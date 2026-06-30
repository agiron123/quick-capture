import { describe, expect, it } from 'vitest';
import { createTestTodo } from '@quick-capture/shared/test-fixtures';

import { buildListIdMap, localTodoDiffers } from './todo-sync-helpers';

describe('buildListIdMap', () => {
  it('maps local list ids to server ids by exact id or name', () => {
    const map = buildListIdMap(
      [
        { id: 'local-1', name: 'Inbox' },
        { id: 'local-2', name: 'Work' },
      ],
      [
        { id: 'server-inbox', name: 'Inbox' },
        { id: 'local-2', name: 'Work' },
      ]
    );

    expect(map.get('local-1')).toBe('server-inbox');
    expect(map.get('local-2')).toBe('local-2');
  });
});

describe('localTodoDiffers', () => {
  const base = createTestTodo({
    id: 't1',
    listId: 'inbox',
    updatedAt: '2026-01-01T00:00:00.000Z',
  });

  it('detects field differences', () => {
    const server = { ...base, title: 'Server title' };
    expect(localTodoDiffers(base, server, 'inbox')).toBe(true);
    expect(localTodoDiffers(base, base, 'inbox')).toBe(false);
  });

  it('detects mapped list id differences', () => {
    expect(localTodoDiffers(base, base, 'other-list')).toBe(true);
  });
});
