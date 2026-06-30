import type { ExtractedTodo } from '@/types/todo';

import {
  extractTodosFromTranscriptViaApi,
  extractTodosFromVoiceViaApi,
  isApiConfigured,
  shouldUseMockAi,
} from '@/services/ai-api-client';
import { fetchLivekitVoiceToken } from '@/services/livekit-voice-session';

export type VoiceExtractionResult = {
  transcript: string;
  todos: ExtractedTodo[];
};

const MOCK_RESULT: VoiceExtractionResult = {
  transcript: 'Remind me to call mom tomorrow and pick up groceries.',
  todos: [{ title: 'Call mom tomorrow' }, { title: 'Pick up groceries' }],
};

export async function extractTodosFromVoice(
  audioUri?: string,
  existingTranscript?: string
): Promise<VoiceExtractionResult> {
  if (shouldUseMockAi() || !isApiConfigured()) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return MOCK_RESULT;
  }

  const trimmedTranscript = existingTranscript?.trim();
  if (trimmedTranscript) {
    const result = await extractTodosFromTranscriptViaApi(trimmedTranscript);
    return {
      transcript: trimmedTranscript,
      todos: result.todos,
    };
  }

  if (!audioUri) {
    throw new Error('Missing audio recording.');
  }

  return extractTodosFromVoiceViaApi(audioUri);
}

export { fetchLivekitVoiceToken };
