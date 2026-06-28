import type { ExtractedTodo } from '@/types/todo';

import { extractTodosFromTranscript } from '@/services/ai-extract-todos-from-text';

export type VoiceExtractionResult = {
  transcript: string;
  todos: ExtractedTodo[];
};

const MOCK_RESULT: VoiceExtractionResult = {
  transcript: 'Remind me to call mom tomorrow and pick up groceries.',
  todos: [{ title: 'Call mom tomorrow' }, { title: 'Pick up groceries' }],
};

async function transcribeWithOpenAI(audioUri: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing EXPO_PUBLIC_OPENAI_API_KEY');
  }

  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    name: 'recording.m4a',
    type: 'audio/m4a',
  } as unknown as Blob);
  formData.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Whisper request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as { text?: string };
  return data.text?.trim() ?? '';
}

export async function extractTodosFromVoice(audioUri: string): Promise<VoiceExtractionResult> {
  const useMock =
    process.env.EXPO_PUBLIC_USE_MOCK_AI === 'true' || !process.env.EXPO_PUBLIC_OPENAI_API_KEY;

  if (useMock) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return MOCK_RESULT;
  }

  const transcript = await transcribeWithOpenAI(audioUri);
  const todos = await extractTodosFromTranscript(transcript);
  return { transcript, todos };
}
