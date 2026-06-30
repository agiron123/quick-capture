import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getChatMaxHistoryMessages, getChatRateLimitPerHour } from '../ai/config.js';
import { CHAT_AGENT_SYSTEM_PROMPT } from '../ai/prompts.js';
import { checkChatRateLimit, resetChatRateLimitForTests } from '../services/chat-rate-limit.js';
import { hasTodoUpdateConflict } from './todo-conflict.js';
import { sanitizeChatThreadTitle } from './chat-title.js';

describe('hasTodoUpdateConflict', () => {
  it('detects stale baseUpdatedAt', () => {
    expect(hasTodoUpdateConflict('2026-01-02T00:00:00.000Z', '2026-01-01T00:00:00.000Z')).toBe(
      true
    );
    expect(hasTodoUpdateConflict('2026-01-02T00:00:00.000Z', '2026-01-02T00:00:00.000Z')).toBe(
      false
    );
    expect(hasTodoUpdateConflict('2026-01-02T00:00:00.000Z', undefined)).toBe(false);
  });
});

describe('sanitizeChatThreadTitle', () => {
  it('trims quotes and caps length', () => {
    expect(sanitizeChatThreadTitle('"Weekly plan"')).toBe('Weekly plan');
    expect(sanitizeChatThreadTitle('a'.repeat(80)).length).toBe(58);
    expect(sanitizeChatThreadTitle('   ')).toBe('New chat');
  });
});

describe('chat rate limit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T12:00:00.000Z'));
    process.env.CHAT_RATE_LIMIT_PER_HOUR = '2';
    resetChatRateLimitForTests();
  });

  afterEach(() => {
    vi.useRealTimers();
    delete process.env.CHAT_RATE_LIMIT_PER_HOUR;
    resetChatRateLimitForTests();
  });

  it('allows requests under the limit', () => {
    expect(checkChatRateLimit('user-1')).toEqual({ allowed: true });
    expect(checkChatRateLimit('user-1')).toEqual({ allowed: true });
  });

  it('blocks requests over the limit with retryAfterSec', () => {
    expect(checkChatRateLimit('user-1')).toEqual({ allowed: true });
    expect(checkChatRateLimit('user-1')).toEqual({ allowed: true });
    const blocked = checkChatRateLimit('user-1');
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.retryAfterSec).toBeGreaterThan(0);
    }
  });

  it('isolates limits per user', () => {
    expect(checkChatRateLimit('user-a')).toEqual({ allowed: true });
    expect(checkChatRateLimit('user-b')).toEqual({ allowed: true });
  });
});

describe('ai config helpers', () => {
  afterEach(() => {
    delete process.env.CHAT_MAX_HISTORY_MESSAGES;
    delete process.env.CHAT_RATE_LIMIT_PER_HOUR;
  });

  it('uses defaults for chat limits', () => {
    expect(getChatMaxHistoryMessages()).toBe(40);
    expect(getChatRateLimitPerHour()).toBe(30);
  });

  it('parses env overrides', () => {
    process.env.CHAT_MAX_HISTORY_MESSAGES = '12';
    process.env.CHAT_RATE_LIMIT_PER_HOUR = '5';
    expect(getChatMaxHistoryMessages()).toBe(12);
    expect(getChatRateLimitPerHour()).toBe(5);
  });
});

describe('CHAT_AGENT_SYSTEM_PROMPT', () => {
  it('forbids direct data writes', () => {
    expect(CHAT_AGENT_SYSTEM_PROMPT).toContain('cannot create, edit, or delete todos');
  });
});
