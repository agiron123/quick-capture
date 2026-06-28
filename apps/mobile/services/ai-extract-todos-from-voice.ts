import type { ExtractedTodo } from '@/types/todo';

import {
    extractTodosFromVoiceViaApi,
    isApiConfigured,
    shouldUseMockAi,
} from '@/services/ai-api-client';

export type VoiceExtractionResult = {
  transcript: string;
  todos: ExtractedTodo[];
};

const MOCK_RESULT: VoiceExtractionResult = {
  transcript: 'Remind me to call mom tomorrow and pick up groceries.',
  todos: [{ title: 'Call mom tomorrow' }, { title: 'Pick up groceries' }],
};

export async function extractTodosFromVoice(audioUri: string): Promise<VoiceExtractionResult> {
  if (shouldUseMockAi() || !isApiConfigured()) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return MOCK_RESULT;
  }

  return extractTodosFromVoiceViaApi(audioUri);
}
