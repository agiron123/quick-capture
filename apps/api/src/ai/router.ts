import type { AiConfig } from './config.js';
import { createMiniMaxProvider } from './providers/minimax.js';
import type { ChatProvider } from './providers/openai-compatible.js';
import { createOpenAiProvider } from './providers/openai.js';

export function getChatProvider(config: AiConfig): ChatProvider {
  if (config.provider === 'minimax') {
    return createMiniMaxProvider(config);
  }
  return createOpenAiProvider(config);
}
