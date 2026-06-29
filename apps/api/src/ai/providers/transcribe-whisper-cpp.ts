import type { AiConfig } from '../config.js';

export async function transcribeWithWhisperCpp(
  config: AiConfig,
  audioBuffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  if (!config.whisperCppBaseUrl) {
    throw new Error('Voice capture requires WHISPER_CPP_BASE_URL when TRANSCRIPTION_PROVIDER=whisper-cpp.');
  }

  const baseUrl = config.whisperCppBaseUrl.replace(/\/$/, '');
  const inferencePath = config.whisperCppInferencePath.startsWith('/')
    ? config.whisperCppInferencePath
    : `/${config.whisperCppInferencePath}`;

  const formData = new FormData();
  formData.append(
    'file',
    new Blob([new Uint8Array(audioBuffer)], { type: mimeType }),
    filename
  );
  formData.append('response_format', 'json');

  const response = await fetch(`${baseUrl}${inferencePath}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`whisper.cpp request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as { text?: string };
  return data.text?.trim() ?? '';
}
