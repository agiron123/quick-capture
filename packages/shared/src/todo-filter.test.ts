import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createTestTodo } from './test-fixtures';
import { collectTodoTags, filterTodos } from './todo-filter';

describe('filterTodos', () => {
  const todos = [
    createTestTodo({ id: 'p1', title: 'Buy milk', sortOrder: 0, tags: ['errands'] }),
    createTestTodo({
      id: 'c1',
      title: 'Organic milk',
      parentId: 'p1',
      sortOrder: 0,
      priority: 'high',
    }),
    createTestTodo({ id: 'p2', title: 'Done task', completed: true, sortOrder: 1 }),
  ];

  it('returns all todos when no filters are active', () => {
    expect(filterTodos(todos)).toEqual(todos);
  });

  it('filters by open status', () => {
    const result = filterTodos(todos, { status: 'open' });
    expect(result.map((t) => t.id)).toEqual(['p1', 'c1']);
  });

  it('filters by query case-insensitively', () => {
    const result = filterTodos(todos, { query: 'MILK' });
    expect(result.map((t) => t.id)).toEqual(['p1', 'c1']);
  });

  it('includes parent when subtask matches query', () => {
    const result = filterTodos(todos, { query: 'organic' });
    expect(result.map((t) => t.id)).toEqual(['p1', 'c1']);
  });

  it('shows matching subtasks when parent matches other filters but not query', () => {
    const result = filterTodos(todos, { query: 'organic', priority: 'high' });
    expect(result.map((t) => t.id)).toEqual(['p1', 'c1']);
  });

  it('filters by priority', () => {
    const result = filterTodos(todos, { priority: 'high' });
    expect(result.map((t) => t.id)).toEqual(['p1', 'c1']);
  });

  it('filters by tag', () => {
    const result = filterTodos(todos, { tag: 'errands' });
    expect(result.map((t) => t.id)).toEqual(['p1']);
  });
});

describe('collectTodoTags', () => {
  it('returns sorted unique tags', () => {
    const tags = collectTodoTags([
      createTestTodo({ tags: ['work', 'home'] }),
      createTestTodo({ id: 't2', tags: ['work', 'urgent'] }),
    ]);
    expect(tags).toEqual(['home', 'urgent', 'work']);
  });
});

describe('filterTodos due filters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('filters overdue todos', () => {
    const todos = [
      createTestTodo({ id: 'overdue', dueAt: '2026-06-10T12:00:00.000Z' }),
      createTestTodo({ id: 'future', dueAt: '2026-06-20T12:00:00.000Z' }),
    ];
    const result = filterTodos(todos, { due: 'overdue' });
    expect(result.map((t) => t.id)).toEqual(['overdue']);
  });

  it('filters todos due today', () => {
    const todos = [
      createTestTodo({ id: 'today', dueAt: '2026-06-15T08:00:00.000Z' }),
      createTestTodo({ id: 'tomorrow', dueAt: '2026-06-16T08:00:00.000Z' }),
    ];
    const result = filterTodos(todos, { due: 'today' });
    expect(result.map((t) => t.id)).toEqual(['today']);
  });

  it('filters todos with no due date', () => {
    const todos = [
      createTestTodo({ id: 'no-due' }),
      createTestTodo({ id: 'has-due', dueAt: '2026-06-20T08:00:00.000Z' }),
    ];
    const result = filterTodos(todos, { due: 'no-due' });
    expect(result.map((t) => t.id)).toEqual(['no-due']);
  });
});
