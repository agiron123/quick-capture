import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';

import ffmpegStatic from 'ffmpeg-static';

const PCM_SAMPLE_RATE = 16_000;
const PCM_CHANNELS = 1;

export const LIVEKIT_PCM_SAMPLE_RATE = PCM_SAMPLE_RATE;

export async function decodeAudioToPcm(audioBuffer: Buffer, mimeType: string): Promise<Int16Array> {
  const ffmpegPath =
    typeof ffmpegStatic === 'string' ? ffmpegStatic : process.env.FFMPEG_BIN?.trim() || null;
  if (!ffmpegPath) {
    throw new Error('ffmpeg-static binary is unavailable.');
  }

  const inputFormat = mimeType.includes('webm')
    ? 'webm'
    : mimeType.includes('wav')
      ? 'wav'
      : mimeType.includes('mp4') || mimeType.includes('m4a')
        ? 'mp4'
        : undefined;

  const args = [
    ...(inputFormat ? ['-f', inputFormat] : []),
    '-i',
    'pipe:0',
    '-f',
    's16le',
    '-ac',
    String(PCM_CHANNELS),
    '-ar',
    String(PCM_SAMPLE_RATE),
    'pipe:1',
  ];

  return new Promise((resolve, reject) => {
    const ffmpeg: ChildProcessWithoutNullStreams = spawn(ffmpegPath, args);

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    ffmpeg.stdout.on('data', (chunk: Buffer) => {
      stdoutChunks.push(chunk);
    });

    ffmpeg.stderr.on('data', (chunk: Buffer) => {
      stderrChunks.push(chunk);
    });

    ffmpeg.on('error', (error: Error) => {
      reject(error);
    });

    ffmpeg.on('close', (code: number | null) => {
      if (code !== 0) {
        const stderr = Buffer.concat(stderrChunks).toString('utf8').trim();
        reject(new Error(`ffmpeg decode failed (${code}): ${stderr || 'unknown error'}`));
        return;
      }

      const pcmBuffer = Buffer.concat(stdoutChunks);
      if (pcmBuffer.length === 0) {
        reject(new Error('ffmpeg decode produced empty PCM output.'));
        return;
      }

      if (pcmBuffer.byteLength % 2 !== 0) {
        reject(new Error('ffmpeg decode produced invalid PCM byte length.'));
        return;
      }

      const samples = new Int16Array(
        pcmBuffer.buffer,
        pcmBuffer.byteOffset,
        pcmBuffer.byteLength / 2
      );
      resolve(samples);
    });

    ffmpeg.stdin.write(audioBuffer);
    ffmpeg.stdin.end();
  });
}
