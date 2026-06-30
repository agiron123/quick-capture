import type { AiConfig } from './config.js';
import { transcribeWithLiveKit } from './providers/transcribe-livekit.js';
import { transcribeWithOpenAi } from './providers/transcribe-openai.js';
import { transcribeWithWhisperCpp } from './providers/transcribe-whisper-cpp.js';

export async function transcribeAudio(
  config: AiConfig,
  audioBuffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  if (config.transcriptionProvider === 'whisper-cpp') {
    return transcribeWithWhisperCpp(config, audioBuffer, filename, mimeType);
  }

  if (config.transcriptionProvider === 'livekit') {
    return transcribeWithLiveKit(config, audioBuffer, filename, mimeType);
  }

  return transcribeWithOpenAi(config, audioBuffer, filename, mimeType);
}
