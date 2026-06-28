import type { AiConfig } from './config.js';

export async function transcribeAudio(
  config: AiConfig,
  audioBuffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  if (!config.openaiApiKey) {
    throw new Error('Voice capture requires OPENAI_API_KEY for transcription.');
  }

  const formData = new FormData();
  formData.append(
    'file',
    new Blob([new Uint8Array(audioBuffer)], { type: mimeType }),
    filename
  );
  formData.append('model', config.openaiTranscriptionModel);

  const response = await fetch(
    `${config.openaiBaseUrl.replace(/\/$/, '')}/audio/transcriptions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.openaiApiKey}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Whisper request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as { text?: string };
  return data.text?.trim() ?? '';
}
