import type { AiConfig } from '../config.js';
import { createOpenAiCompatibleProvider } from './openai-compatible.js';

export function createOpenAiProvider(config: AiConfig) {
  if (!config.openaiApiKey) {
    throw new Error('OPENAI_API_KEY is required when AI_PROVIDER=openai');
  }

  return createOpenAiCompatibleProvider({
    name: 'openai',
    apiKey: config.openaiApiKey,
    baseUrl: config.openaiBaseUrl,
    model: config.openaiChatModel,
  });
}
