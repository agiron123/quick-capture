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
  whisperCppBaseUrl: string | undefined;
  whisperCppInferencePath: string;
  livekitApiKey: string | undefined;
  livekitApiSecret: string | undefined;
  livekitInferenceUrl: string | undefined;
  livekitSttModel: string;
  livekitSttLanguage: string;
  livekitUrl: string | undefined;
  livekitTranscriberAgentName: string;
};

function parseProvider(value: string | undefined): AiProvider {
  if (value === 'minimax') return 'minimax';
  return 'openai';
}

function parseTranscriptionProvider(value: string | undefined): TranscriptionProvider {
  if (value === 'whisper-cpp') return 'whisper-cpp';
  if (value === 'livekit') return 'livekit';
  return 'openai';
}

export function getAiConfig(): AiConfig {
  const provider = parseProvider(process.env.AI_PROVIDER);

  return {
    provider,
    transcriptionProvider: parseTranscriptionProvider(process.env.TRANSCRIPTION_PROVIDER),
    openaiApiKey: process.env.OPENAI_API_KEY?.trim() || undefined,
    openaiBaseUrl: process.env.OPENAI_BASE_URL?.trim() || 'https://api.openai.com/v1',
    openaiChatModel: process.env.OPENAI_CHAT_MODEL?.trim() || 'gpt-4o-mini',
    openaiTranscriptionModel: process.env.OPENAI_TRANSCRIPTION_MODEL?.trim() || 'whisper-1',
    minimaxApiKey: process.env.MINIMAX_API_KEY?.trim() || undefined,
    minimaxBaseUrl: process.env.MINIMAX_BASE_URL?.trim() || 'https://api.minimax.io/v1',
    minimaxChatModel: process.env.MINIMAX_CHAT_MODEL?.trim() || 'MiniMax-M2.5',
    whisperCppBaseUrl: process.env.WHISPER_CPP_BASE_URL?.trim() || undefined,
    whisperCppInferencePath: process.env.WHISPER_CPP_INFERENCE_PATH?.trim() || '/inference',
    livekitApiKey: process.env.LIVEKIT_API_KEY?.trim() || undefined,
    livekitApiSecret: process.env.LIVEKIT_API_SECRET?.trim() || undefined,
    livekitInferenceUrl: process.env.LIVEKIT_INFERENCE_URL?.trim() || undefined,
    livekitSttModel: process.env.LIVEKIT_STT_MODEL?.trim() || 'deepgram/nova-3',
    livekitSttLanguage: process.env.LIVEKIT_STT_LANGUAGE?.trim() || 'en',
    livekitUrl: process.env.LIVEKIT_URL?.trim() || undefined,
    livekitTranscriberAgentName:
      process.env.LIVEKIT_TRANSCRIBER_AGENT_NAME?.trim() || 'qc-transcriber',
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
  if (config.transcriptionProvider === 'whisper-cpp') {
    if (!config.whisperCppBaseUrl) {
      throw new Error('Voice capture requires WHISPER_CPP_BASE_URL when TRANSCRIPTION_PROVIDER=whisper-cpp.');
    }
    return;
  }

  if (config.transcriptionProvider === 'livekit') {
    if (!config.livekitApiKey || !config.livekitApiSecret) {
      throw new Error(
        'Voice capture requires LIVEKIT_API_KEY and LIVEKIT_API_SECRET when TRANSCRIPTION_PROVIDER=livekit.'
      );
    }
    return;
  }

  if (!config.openaiApiKey) {
    throw new Error('Voice capture requires OPENAI_API_KEY for transcription.');
  }
}

export function assertLivekitRealtimeConfigured(config: AiConfig): void {
  if (!config.livekitApiKey || !config.livekitApiSecret) {
    throw new Error(
      'LiveKit realtime requires LIVEKIT_API_KEY and LIVEKIT_API_SECRET when TRANSCRIPTION_PROVIDER=livekit.'
    );
  }
  if (!config.livekitUrl) {
    throw new Error('LiveKit realtime requires LIVEKIT_URL when TRANSCRIPTION_PROVIDER=livekit.');
  }
}

export function isLivekitRealtimeEnabled(config: AiConfig): boolean {
  return (
    config.transcriptionProvider === 'livekit' &&
    Boolean(config.livekitApiKey && config.livekitApiSecret && config.livekitUrl)
  );
}

export function assertMiniMaxChatConfigured(config: AiConfig): void {
  if (!config.minimaxApiKey) {
    throw new Error('MINIMAX_API_KEY is required for chat');
  }
}

export function getChatMaxHistoryMessages(): number {
  const parsed = Number(process.env.CHAT_MAX_HISTORY_MESSAGES ?? '40');
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 40;
}

export function getChatRateLimitPerHour(): number {
  const parsed = Number(process.env.CHAT_RATE_LIMIT_PER_HOUR ?? '30');
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 30;
}
