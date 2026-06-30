import { describe, expect, it } from 'vitest';

import {
  chatRequestSchema,
  createChatThreadSchema,
  listChatMessagesResponseSchema,
  updateChatThreadSchema,
} from './chat-schemas';

describe('chat-schemas', () => {
  it('validates chat request message', () => {
    expect(chatRequestSchema.safeParse({ message: 'Hello' }).success).toBe(true);
    expect(chatRequestSchema.safeParse({ message: '' }).success).toBe(false);
  });

  it('validates optional thread title on create', () => {
    expect(createChatThreadSchema.safeParse({}).success).toBe(true);
    expect(createChatThreadSchema.safeParse({ title: '  Plan week  ' }).success).toBe(true);
  });

  it('requires title on update', () => {
    expect(updateChatThreadSchema.safeParse({ title: 'Renamed' }).success).toBe(true);
    expect(updateChatThreadSchema.safeParse({ title: '' }).success).toBe(false);
  });

  it('validates paginated messages response', () => {
    const result = listChatMessagesResponseSchema.safeParse({
      messages: [
        {
          id: 'm1',
          threadId: 't1',
          role: 'user',
          content: 'Hi',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      nextCursor: 'cursor-1',
    });
    expect(result.success).toBe(true);
  });
});
