import type { Todo, TodoPriority } from './todo';
import { getTopLevelTodos, groupSubtasksByParent } from './todo-tree';

export type TodoStatusFilter = 'all' | 'open' | 'done';
export type TodoDueFilter = 'all' | 'overdue' | 'today' | 'no-due';

export type TodoFilterOptions = {
  query?: string;
  status?: TodoStatusFilter;
  priority?: TodoPriority | null;
  tag?: string | null;
  due?: TodoDueFilter;
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isDueOverdue(dueAt: string, completed = false): boolean {
  if (completed) return false;
  const date = new Date(dueAt);
  if (Number.isNaN(date.getTime())) return false;
  return startOfDay(date).getTime() < startOfDay(new Date()).getTime();
}

function isDueToday(dueAt: string): boolean {
  const date = new Date(dueAt);
  if (Number.isNaN(date.getTime())) return false;
  return startOfDay(date).getTime() === startOfDay(new Date()).getTime();
}

function matchesStatus(todo: Todo, status: TodoStatusFilter): boolean {
  if (status === 'open') return !todo.completed;
  if (status === 'done') return todo.completed;
  return true;
}

function matchesQuery(todo: Todo, query: string): boolean {
  return todo.title.toLowerCase().includes(query);
}

function matchesPriority(todo: Todo, priority?: TodoPriority | null): boolean {
  if (!priority) return true;
  return todo.priority === priority;
}

function matchesTag(todo: Todo, tag?: string | null): boolean {
  if (!tag) return true;
  return todo.tags?.includes(tag) ?? false;
}

function matchesDue(todo: Todo, due: TodoDueFilter): boolean {
  if (due === 'all') return true;
  if (due === 'no-due') return !todo.dueAt;
  if (!todo.dueAt) return false;
  if (due === 'overdue') return isDueOverdue(todo.dueAt, todo.completed);
  if (due === 'today') return isDueToday(todo.dueAt);
  return true;
}

type ResolvedTodoFilterOptions = {
  query: string;
  status: TodoStatusFilter;
  priority?: TodoPriority | null;
  tag?: string | null;
  due: TodoDueFilter;
};

function matchesTodo(todo: Todo, options: ResolvedTodoFilterOptions): boolean {
  return (
    matchesStatus(todo, options.status) &&
    (!options.query || matchesQuery(todo, options.query)) &&
    matchesPriority(todo, options.priority) &&
    matchesTag(todo, options.tag) &&
    matchesDue(todo, options.due)
  );
}

function matchesTodoExceptQuery(todo: Todo, options: ResolvedTodoFilterOptions): boolean {
  return (
    matchesStatus(todo, options.status) &&
    matchesPriority(todo, options.priority) &&
    matchesTag(todo, options.tag) &&
    matchesDue(todo, options.due)
  );
}

function hasActiveFilters(options: TodoFilterOptions): boolean {
  return Boolean(
    options.query?.trim() ||
      (options.status && options.status !== 'all') ||
      options.priority ||
      options.tag ||
      (options.due && options.due !== 'all')
  );
}

export function collectTodoTags(todos: Todo[]): string[] {
  const tags = new Set<string>();
  for (const todo of todos) {
    for (const tag of todo.tags ?? []) {
      tags.add(tag);
    }
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}

export function filterTodos(todos: Todo[], options: TodoFilterOptions = {}): Todo[] {
  const resolved: ResolvedTodoFilterOptions = {
    query: options.query?.trim().toLowerCase() ?? '',
    status: options.status ?? 'all',
    priority: options.priority,
    tag: options.tag,
    due: options.due ?? 'all',
  };

  if (!hasActiveFilters({ ...options, ...resolved })) {
    return todos;
  }

  const subtasksByParent = groupSubtasksByParent(todos);
  const result: Todo[] = [];

  for (const parent of getTopLevelTodos(todos)) {
    const children = subtasksByParent.get(parent.id) ?? [];
    const parentMatches = matchesTodo(parent, resolved);
    const matchingChildren = children.filter((child) => matchesTodo(child, resolved));

    if (parentMatches) {
      result.push(parent);
      for (const child of children) {
        if (matchesTodoExceptQuery(child, resolved)) {
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
