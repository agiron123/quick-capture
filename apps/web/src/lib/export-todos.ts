import { exportTodosAsJson, exportTodosAsText } from '@quick-capture/shared';
import type { Todo } from '@quick-capture/shared';

export function buildTodosExportText(todos: Todo[], listName?: string): string {
  return exportTodosAsText(todos, { listName });
}

export function buildTodosExportJson(todos: Todo[]): string {
  return exportTodosAsJson(todos);
}

export async function copyTodosAsText(todos: Todo[], listName?: string): Promise<void> {
  const text = buildTodosExportText(todos, listName);
  await navigator.clipboard.writeText(text);
}

export function downloadTodosAsJson(todos: Todo[], listName?: string): void {
  const json = buildTodosExportJson(todos);
  const slug = (listName ?? 'todos').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${slug || 'todos'}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
