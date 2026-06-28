import type { Todo } from './todo';
import { getTopLevelTodos, groupSubtasksByParent } from './todo-tree';

export type ExportableTodo = {
  id: string;
  title: string;
  completed: boolean;
  source: Todo['source'];
  listId: string;
  parentId?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
  priority?: Todo['priority'];
  dueAt?: string;
  reminderAt?: string;
  tags?: string[];
  transcript?: string;
};

export function toExportableTodo(todo: Todo): ExportableTodo {
  return {
    id: todo.id,
    title: todo.title,
    completed: todo.completed,
    source: todo.source,
    listId: todo.listId,
    parentId: todo.parentId,
    sortOrder: todo.sortOrder,
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt,
    priority: todo.priority,
    dueAt: todo.dueAt,
    reminderAt: todo.reminderAt,
    tags: todo.tags,
    transcript: todo.transcript,
  };
}

function formatTodoMeta(todo: Todo): string {
  const parts: string[] = [];
  if (todo.priority) parts.push(`priority: ${todo.priority}`);
  if (todo.dueAt) parts.push(`due: ${todo.dueAt}`);
  if (todo.tags?.length) parts.push(`tags: ${todo.tags.join(', ')}`);
  if (todo.reminderAt) parts.push(`reminder: ${todo.reminderAt}`);
  return parts.length > 0 ? ` (${parts.join(' · ')})` : '';
}

export function exportTodosAsJson(todos: Todo[]): string {
  const ordered = [...todos].sort((a, b) => a.sortOrder - b.sortOrder);
  return JSON.stringify(ordered.map(toExportableTodo), null, 2);
}

export function exportTodosAsText(todos: Todo[], options?: { listName?: string }): string {
  const lines: string[] = [];
  const listName = options?.listName?.trim();

  if (listName) {
    lines.push(`# ${listName}`, '');
  }

  const subtasksByParent = groupSubtasksByParent(todos);

  for (const parent of getTopLevelTodos(todos)) {
    const checkbox = parent.completed ? '[x]' : '[ ]';
    lines.push(`- ${checkbox} ${parent.title}${formatTodoMeta(parent)}`);

    for (const child of subtasksByParent.get(parent.id) ?? []) {
      const childBox = child.completed ? '[x]' : '[ ]';
      lines.push(`  - ${childBox} ${child.title}${formatTodoMeta(child)}`);
    }
  }

  if (lines.length === 0 || (lines.length === 2 && listName)) {
    return listName ? `# ${listName}\n\n(no todos)` : '(no todos)';
  }

  return lines.join('\n');
}
