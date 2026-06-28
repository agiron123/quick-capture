import type { Todo } from './todo';

export type TodoDisplayItem = {
  todo: Todo;
  depth: number;
};

export function groupSubtasksByParent(todos: Todo[]): Map<string, Todo[]> {
  const map = new Map<string, Todo[]>();
  for (const todo of todos) {
    if (!todo.parentId) continue;
    const group = map.get(todo.parentId) ?? [];
    group.push(todo);
    map.set(todo.parentId, group);
  }
  for (const [parentId, children] of map) {
    map.set(
      parentId,
      children.sort((a, b) => a.sortOrder - b.sortOrder)
    );
  }
  return map;
}

export function getTopLevelTodos(todos: Todo[]): Todo[] {
  return todos
    .filter((todo) => !todo.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function flattenTodosWithSubtasks(todos: Todo[]): TodoDisplayItem[] {
  const subtasksByParent = groupSubtasksByParent(todos);
  const result: TodoDisplayItem[] = [];

  for (const parent of getTopLevelTodos(todos)) {
    result.push({ todo: parent, depth: 0 });
    for (const child of subtasksByParent.get(parent.id) ?? []) {
      result.push({ todo: child, depth: 1 });
    }
  }

  return result;
}
