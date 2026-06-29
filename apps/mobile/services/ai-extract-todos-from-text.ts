import type { ExtractedTodo } from '@/types/todo';

import {
    extractTodosFromTranscriptViaApi,
    isApiConfigured,
    shouldUseMockAi,
} from '@/services/ai-api-client';

export async function extractTodosFromTranscript(transcript: string): Promise<ExtractedTodo[]> {
  const trimmed = transcript.trim();
  if (!trimmed) return [];

  if (shouldUseMockAi()) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return [
      { title: 'Review meeting notes' },
      { title: 'Send follow-up email' },
    ];
  }

  if (!isApiConfigured()) {
    throw new Error('AI API is not configured. Set EXPO_PUBLIC_API_URL or enable mock mode.');
  }

  const result = await extractTodosFromTranscriptViaApi(trimmed);
  return result.todos;
}
