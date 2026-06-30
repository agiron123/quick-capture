import { describe, expect, it } from 'vitest';

import {
  createTodoSchema,
  createTodosBatchSchema,
  registerDeviceSchema,
  reorderTodosSchema,
  syncPayloadSchema,
  updateTodoSchema,
} from './api-schemas';

describe('createTodoSchema', () => {
  it('accepts valid todo input', () => {
    const result = createTodoSchema.safeParse({
      title: '  Buy milk  ',
      tags: [' Work ', 'work'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Buy milk');
      expect(result.data.tags).toEqual(['work']);
      expect(result.data.source).toBe('manual');
    }
  });

  it('rejects empty title', () => {
    expect(createTodoSchema.safeParse({ title: '   ' }).success).toBe(false);
  });
});

describe('updateTodoSchema', () => {
  it('accepts baseUpdatedAt for conflict checks', () => {
    const result = updateTodoSchema.safeParse({
      title: 'Updated',
      baseUpdatedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid datetime for baseUpdatedAt', () => {
    expect(
      updateTodoSchema.safeParse({ baseUpdatedAt: 'not-a-date' }).success
    ).toBe(false);
  });
});

describe('createTodosBatchSchema', () => {
  it('requires at least one todo', () => {
    expect(createTodosBatchSchema.safeParse({ todos: [] }).success).toBe(false);
  });
});

describe('reorderTodosSchema', () => {
  it('requires listId and todoIds', () => {
    expect(
      reorderTodosSchema.safeParse({ listId: 'inbox', todoIds: ['a'] }).success
    ).toBe(true);
    expect(reorderTodosSchema.safeParse({ listId: '', todoIds: [] }).success).toBe(false);
  });
});

describe('syncPayloadSchema', () => {
  it('validates sync payload todos', () => {
    const result = syncPayloadSchema.safeParse({
      todos: [
        {
          clientId: 'local-1',
          title: 'Todo',
          completed: false,
          source: 'manual',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe('registerDeviceSchema', () => {
  it('validates device registration', () => {
    const result = registerDeviceSchema.safeParse({
      platform: 'ios',
      pushToken: 'ExponentPushToken[xxx]',
      pushProvider: 'expo',
    });
    expect(result.success).toBe(true);
  });
});
