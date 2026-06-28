import type { AiConfig } from '../config.js';
import { createOpenAiCompatibleProvider } from './openai-compatible.js';

export function createMiniMaxProvider(config: AiConfig) {
  if (!config.minimaxApiKey) {
    throw new Error('MINIMAX_API_KEY is required when AI_PROVIDER=minimax');
  }

  return createOpenAiCompatibleProvider({
    name: 'minimax',
    apiKey: config.minimaxApiKey,
    baseUrl: config.minimaxBaseUrl,
    model: config.minimaxChatModel,
  });
}
