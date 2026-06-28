import type { Todo } from './todo';
import { groupSubtasksByParent, getTopLevelTodos } from './todo-tree';

export type TodoStatusFilter = 'all' | 'open' | 'done';

export type TodoFilterOptions = {
  query?: string;
  status?: TodoStatusFilter;
};

function matchesStatus(todo: Todo, status: TodoStatusFilter): boolean {
  if (status === 'open') return !todo.completed;
  if (status === 'done') return todo.completed;
  return true;
}

function matchesQuery(todo: Todo, query: string): boolean {
  return todo.title.toLowerCase().includes(query);
}

export function filterTodos(todos: Todo[], options: TodoFilterOptions = {}): Todo[] {
  const query = options.query?.trim().toLowerCase() ?? '';
  const status = options.status ?? 'all';

  if (!query && status === 'all') {
    return todos;
  }

  const subtasksByParent = groupSubtasksByParent(todos);
  const result: Todo[] = [];

  for (const parent of getTopLevelTodos(todos)) {
    const children = subtasksByParent.get(parent.id) ?? [];
    const parentMatches =
      matchesStatus(parent, status) && (!query || matchesQuery(parent, query));
    const matchingChildren = children.filter(
      (child) => matchesStatus(child, status) && (!query || matchesQuery(child, query))
    );

    if (parentMatches) {
      result.push(parent);
      for (const child of children) {
        if (matchesStatus(child, status)) {
          result.push(child);
        }
      }
    } else if (matchingChildren.length > 0) {
      result.push(parent);
      result.push(...matchingChildren);
    }
  }

  return result;
}
