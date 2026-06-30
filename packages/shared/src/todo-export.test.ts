import { describe, expect, it } from 'vitest';

import { createTestTodo } from './test-fixtures';
import { exportTodosAsJson, exportTodosAsText, toExportableTodo } from './todo-export';

describe('todo-export', () => {
  it('maps todo to exportable shape', () => {
    const todo = createTestTodo({
      priority: 'high',
      dueAt: '2026-06-15T23:59:00.000Z',
      tags: ['work'],
    });
    expect(toExportableTodo(todo)).toMatchObject({
      id: todo.id,
      title: todo.title,
      priority: 'high',
      tags: ['work'],
    });
  });

  it('exports JSON sorted by sortOrder', () => {
    const todos = [
      createTestTodo({ id: 'b', sortOrder: 1, title: 'B' }),
      createTestTodo({ id: 'a', sortOrder: 0, title: 'A' }),
    ];
    const parsed = JSON.parse(exportTodosAsJson(todos)) as { title: string }[];
    expect(parsed.map((t) => t.title)).toEqual(['A', 'B']);
  });

  it('exports markdown checklist with metadata', () => {
    const todos = [
      createTestTodo({
        id: 'p1',
        title: 'Parent',
        completed: true,
        priority: 'medium',
        tags: ['home'],
      }),
      createTestTodo({ id: 'c1', title: 'Child', parentId: 'p1', sortOrder: 0 }),
    ];
    const text = exportTodosAsText(todos, { listName: 'Inbox' });
    expect(text).toContain('# Inbox');
    expect(text).toContain('- [x] Parent (priority: medium · tags: home)');
    expect(text).toContain('  - [ ] Child');
  });

  it('returns placeholder for empty list', () => {
    expect(exportTodosAsText([])).toBe('(no todos)');
    expect(exportTodosAsText([], { listName: 'Empty' })).toContain('(no todos)');
  });
});
