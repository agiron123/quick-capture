import type { TodoListRecord } from './list';
import type { Todo } from './todo';

const DEFAULT_LIST_ID = 'inbox';

export function createTestTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 'todo-1',
    title: 'Test todo',
    completed: false,
    source: 'manual',
    listId: DEFAULT_LIST_ID,
    createdAt: '2026-01-01T12:00:00.000Z',
    sortOrder: 0,
    ...overrides,
  };
}

export function createTestList(overrides: Partial<TodoListRecord> = {}): TodoListRecord {
  return {
    id: DEFAULT_LIST_ID,
    name: 'Inbox',
    sortOrder: 0,
    createdAt: '2026-01-01T12:00:00.000Z',
    ...overrides,
  };
}
