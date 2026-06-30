import { z } from 'zod';

export const aiProviderSchema = z.enum(['openai', 'minimax']);
export const transcriptionProviderSchema = z.enum(['openai', 'whisper-cpp', 'livekit']);

export const extractedTodoSchema = z.object({
  title: z.string().trim().min(1),
});

export const extractTranscriptRequestSchema = z.object({
  transcript: z.string().trim().min(1),
});

export const extractImageResponseSchema = z.object({
  todos: z.array(extractedTodoSchema),
});

export const extractTranscriptResponseSchema = z.object({
  todos: z.array(extractedTodoSchema),
});

export const extractVoiceResponseSchema = z.object({
  transcript: z.string(),
  todos: z.array(extractedTodoSchema),
});

export const aiStatusResponseSchema = z.object({
  provider: aiProviderSchema,
  transcriptionProvider: transcriptionProviderSchema,
  mockMode: z.boolean(),
  livekitRealtime: z.boolean(),
});

export type AiProvider = z.infer<typeof aiProviderSchema>;
export type TranscriptionProvider = z.infer<typeof transcriptionProviderSchema>;
export type ExtractedTodoDto = z.infer<typeof extractedTodoSchema>;
export type ExtractTranscriptRequest = z.infer<typeof extractTranscriptRequestSchema>;
export type ExtractImageResponse = z.infer<typeof extractImageResponseSchema>;
export type ExtractTranscriptResponse = z.infer<typeof extractTranscriptResponseSchema>;
export type ExtractVoiceResponse = z.infer<typeof extractVoiceResponseSchema>;
export type AiStatusResponse = z.infer<typeof aiStatusResponseSchema>;
