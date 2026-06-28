import type { Todo } from '@quick-capture/shared';

export class SyncConflictError extends Error {
  readonly serverTodo: Todo;

  constructor(serverTodo: Todo) {
    super('Todo was updated on another device');
    this.name = 'SyncConflictError';
    this.serverTodo = serverTodo;
  }
}
