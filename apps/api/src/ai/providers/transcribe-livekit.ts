import { inference, stt } from '@livekit/agents';
import { AudioFrame } from '@livekit/rtc-node';

import {
  decodeAudioToPcm,
  LIVEKIT_PCM_SAMPLE_RATE,
} from '../audio/decode-to-pcm.js';
import type { AiConfig } from '../config.js';

const FRAME_DURATION_MS = 100;
const SAMPLES_PER_FRAME = Math.floor((LIVEKIT_PCM_SAMPLE_RATE * FRAME_DURATION_MS) / 1000);

function createPcmFrames(pcm: Int16Array): AudioFrame[] {
  const frames: AudioFrame[] = [];

  for (let offset = 0; offset < pcm.length; offset += SAMPLES_PER_FRAME) {
    const chunk = pcm.subarray(offset, offset + SAMPLES_PER_FRAME);
    frames.push(new AudioFrame(chunk, LIVEKIT_PCM_SAMPLE_RATE, 1, chunk.length));
  }

  return frames;
}

async function collectFinalTranscript(stream: stt.SpeechStream): Promise<string> {
  const parts: string[] = [];

  for await (const event of stream) {
    if (event.type === stt.SpeechEventType.FINAL_TRANSCRIPT) {
      const text = event.alternatives?.[0]?.text?.trim();
      if (text) {
        parts.push(text);
      }
    }
  }

  return parts.join(' ').trim();
}

export async function transcribeWithLiveKit(
  config: AiConfig,
  audioBuffer: Buffer,
  _filename: string,
  mimeType: string
): Promise<string> {
  if (!config.livekitApiKey || !config.livekitApiSecret) {
    throw new Error(
      'Voice capture requires LIVEKIT_API_KEY and LIVEKIT_API_SECRET when TRANSCRIPTION_PROVIDER=livekit.'
    );
  }

  const pcm = await decodeAudioToPcm(audioBuffer, mimeType);
  const frames = createPcmFrames(pcm);

  const livekitStt = new inference.STT({
    model: config.livekitSttModel,
    language: config.livekitSttLanguage,
    apiKey: config.livekitApiKey,
    apiSecret: config.livekitApiSecret,
    baseURL: config.livekitInferenceUrl,
    sampleRate: LIVEKIT_PCM_SAMPLE_RATE,
    encoding: 'pcm_s16le',
  });

  const stream = livekitStt.stream();
  const transcriptPromise = collectFinalTranscript(stream);

  try {
    for (const frame of frames) {
      stream.pushFrame(frame);
    }

    stream.flush();
    stream.endInput();

    return await transcriptPromise;
  } finally {
    stream.close();
    await livekitStt.close();
  }
}
