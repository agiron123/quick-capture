import { describe, expect, it } from 'vitest';

import { createTestTodo } from './test-fixtures';
import {
  flattenTodosWithSubtasks,
  getTopLevelTodos,
  groupSubtasksByParent,
} from './todo-tree';

describe('todo-tree', () => {
  const todos = [
    createTestTodo({ id: 'p2', title: 'Second', sortOrder: 1 }),
    createTestTodo({ id: 'c1', title: 'Child B', parentId: 'p1', sortOrder: 1 }),
    createTestTodo({ id: 'p1', title: 'First', sortOrder: 0 }),
    createTestTodo({ id: 'c0', title: 'Child A', parentId: 'p1', sortOrder: 0 }),
    createTestTodo({ id: 'orphan-child', title: 'Orphan child', parentId: 'missing', sortOrder: 0 }),
  ];

  it('groups subtasks by parent sorted by sortOrder', () => {
    const map = groupSubtasksByParent(todos);
    expect(map.get('p1')?.map((t) => t.id)).toEqual(['c0', 'c1']);
    expect(map.get('missing')?.map((t) => t.id)).toEqual(['orphan-child']);
  });

  it('returns top-level todos sorted by sortOrder', () => {
    expect(getTopLevelTodos(todos).map((t) => t.id)).toEqual(['p1', 'p2']);
  });

  it('flattens todos with subtask depth', () => {
    const flat = flattenTodosWithSubtasks(todos);
    expect(flat.map((item) => [item.todo.id, item.depth])).toEqual([
      ['p1', 0],
      ['c0', 1],
      ['c1', 1],
      ['p2', 0],
    ]);
  });
});
