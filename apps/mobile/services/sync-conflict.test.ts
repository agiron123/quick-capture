import { describe, expect, it } from 'vitest';
import { createTestTodo } from '@quick-capture/shared/test-fixtures';

import { SyncConflictError } from './sync-conflict';

describe('SyncConflictError', () => {
  it('carries server todo', () => {
    const serverTodo = createTestTodo({ id: 'server', title: 'Server wins' });
    const error = new SyncConflictError(serverTodo);
    expect(error.name).toBe('SyncConflictError');
    expect(error.serverTodo).toEqual(serverTodo);
    expect(error.message).toContain('another device');
  });
});
