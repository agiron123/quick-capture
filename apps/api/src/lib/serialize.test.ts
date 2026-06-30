import { describe, expect, it } from 'vitest';

import { serializeCapture, serializeList, serializeTodo } from './serialize.js';

describe('serializeTodo', () => {
  it('maps row fields and drops invalid priority', () => {
    const todo = serializeTodo({
      id: 't1',
      userId: 'u1',
      listId: 'inbox',
      parentId: null,
      title: 'Todo',
      completed: false,
      source: 'manual',
      sortOrder: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      dueAt: '2026-06-01T00:00:00.000Z',
      priority: 'bogus',
      tags: ['work'],
      reminderAt: null,
      reminderSentAt: null,
      transcript: null,
      captureId: null,
    });

    expect(todo).toMatchObject({
      id: 't1',
      listId: 'inbox',
      priority: undefined,
      dueAt: '2026-06-01T00:00:00.000Z',
      tags: ['work'],
      parentId: undefined,
    });
  });
});

describe('serializeList', () => {
  it('maps list row', () => {
    expect(
      serializeList({
        id: 'inbox',
        userId: 'u1',
        name: 'Inbox',
        sortOrder: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
      })
    ).toEqual({
      id: 'inbox',
      name: 'Inbox',
      sortOrder: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });
});

describe('serializeCapture', () => {
  it('maps optional capture fields', () => {
    expect(
      serializeCapture({
        id: 'c1',
        userId: 'u1',
        source: 'voice',
        transcript: 'hello',
        mediaKey: 'key',
        mediaMimeType: 'audio/wav',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      })
    ).toMatchObject({
      transcript: 'hello',
      mediaKey: 'key',
    });
  });
});
