import type { ExtractedTodo } from '@/types/todo';

import {
    extractTodosFromImageViaApi,
    isApiConfigured,
    shouldUseMockAi,
} from '@/services/ai-api-client';

const MOCK_TODOS: ExtractedTodo[] = [
  { title: 'Review meeting notes' },
  { title: 'Send follow-up email' },
  { title: 'Schedule dentist appointment' },
];

export async function extractTodosFromImage(imageUri: string): Promise<ExtractedTodo[]> {
  if (shouldUseMockAi() || !isApiConfigured()) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return MOCK_TODOS;
  }

  const result = await extractTodosFromImageViaApi(imageUri);
  return result.todos;
}
