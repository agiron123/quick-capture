import { describe, expect, it } from 'vitest';

import {
  aiStatusResponseSchema,
  extractImageResponseSchema,
  extractTranscriptRequestSchema,
  extractVoiceResponseSchema,
} from './ai-schemas';

describe('ai-schemas', () => {
  it('validates extract transcript request', () => {
    expect(extractTranscriptRequestSchema.safeParse({ transcript: 'buy milk' }).success).toBe(
      true
    );
    expect(extractTranscriptRequestSchema.safeParse({ transcript: '   ' }).success).toBe(false);
  });

  it('validates extract image response', () => {
    const result = extractImageResponseSchema.safeParse({
      todos: [{ title: 'Call dentist' }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects malformed extract response', () => {
    expect(extractImageResponseSchema.safeParse({ todos: [{ title: '' }] }).success).toBe(false);
    expect(extractImageResponseSchema.safeParse({ todos: 'nope' }).success).toBe(false);
  });

  it('validates voice response with transcript', () => {
    const result = extractVoiceResponseSchema.safeParse({
      transcript: 'remind me',
      todos: [{ title: 'Reminder' }],
    });
    expect(result.success).toBe(true);
  });

  it('validates AI status response', () => {
    const result = aiStatusResponseSchema.safeParse({
      provider: 'openai',
      transcriptionProvider: 'whisper-cpp',
      mockMode: true,
    });
    expect(result.success).toBe(true);
  });
});
