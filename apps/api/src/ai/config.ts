import type { AiProvider, TranscriptionProvider } from '@quick-capture/shared';

export type AiConfig = {
  provider: AiProvider;
  transcriptionProvider: TranscriptionProvider;
  openaiApiKey: string | undefined;
  openaiBaseUrl: string;
  openaiChatModel: string;
  openaiTranscriptionModel: string;
  minimaxApiKey: string | undefined;
  minimaxBaseUrl: string;
  minimaxChatModel: string;
};

function parseProvider(value: string | undefined): AiProvider {
  if (value === 'minimax') return 'minimax';
  return 'openai';
}

export function getAiConfig(): AiConfig {
  const provider = parseProvider(process.env.AI_PROVIDER);

  return {
    provider,
    transcriptionProvider: 'openai',
    openaiApiKey: process.env.OPENAI_API_KEY?.trim() || undefined,
    openaiBaseUrl: process.env.OPENAI_BASE_URL?.trim() || 'https://api.openai.com/v1',
    openaiChatModel: process.env.OPENAI_CHAT_MODEL?.trim() || 'gpt-4o-mini',
    openaiTranscriptionModel: process.env.OPENAI_TRANSCRIPTION_MODEL?.trim() || 'whisper-1',
    minimaxApiKey: process.env.MINIMAX_API_KEY?.trim() || undefined,
    minimaxBaseUrl: process.env.MINIMAX_BASE_URL?.trim() || 'https://api.minimax.io/v1',
    minimaxChatModel: process.env.MINIMAX_CHAT_MODEL?.trim() || 'MiniMax-M2.5',
  };
}

export function assertChatProviderConfigured(config: AiConfig): void {
  if (config.provider === 'openai' && !config.openaiApiKey) {
    throw new Error('OPENAI_API_KEY is required when AI_PROVIDER=openai');
  }
  if (config.provider === 'minimax' && !config.minimaxApiKey) {
    throw new Error('MINIMAX_API_KEY is required when AI_PROVIDER=minimax');
  }
}

export function assertTranscriptionConfigured(config: AiConfig): void {
  if (!config.openaiApiKey) {
    throw new Error('Voice capture requires OPENAI_API_KEY for transcription.');
  }
}
