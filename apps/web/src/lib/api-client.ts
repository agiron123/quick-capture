import type { Todo, TodoListRecord } from '@quick-capture/shared';

import { auth } from '@/lib/auth/server';

function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!baseUrl) {
    throw new Error('Missing NEXT_PUBLIC_API_URL');
  }
  return baseUrl.replace(/\/$/, '');
}

async function getServerAccessToken(): Promise<string | null> {
  if (!auth) return null;
  const result = await auth.getSession();
  const token = result.data?.session?.token;
  return token ?? null;
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string | Record<string, unknown> };
    if (typeof data.error === 'string') return data.error;
    if (data.error) return JSON.stringify(data.error);
  } catch {
    // fall through
  }
  return `Request failed: ${response.status}`;
}

async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getServerAccessToken();
  const headers = new Headers(init.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });
}

export async function fetchLists(): Promise<TodoListRecord[]> {
  const response = await apiFetch('/api/lists');
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = (await response.json()) as { lists: TodoListRecord[] };
  return data.lists;
}

export async function fetchTodos(listId: string): Promise<Todo[]> {
  const response = await apiFetch(`/api/todos?listId=${encodeURIComponent(listId)}`);
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = (await response.json()) as { todos: Todo[] };
  return data.todos;
}

export async function createTodo(title: string, listId: string): Promise<Todo> {
  const response = await apiFetch('/api/todos', {
    method: 'POST',
    body: JSON.stringify({ title, source: 'manual', listId }),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = (await response.json()) as { todo: Todo };
  return data.todo;
}

export async function updateTodo(
  id: string,
  patch: { title?: string; completed?: boolean; reminderAt?: string | null }
): Promise<Todo> {
  const response = await apiFetch(`/api/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = (await response.json()) as { todo: Todo };
  return data.todo;
}

export async function deleteTodo(id: string): Promise<void> {
  const response = await apiFetch(`/api/todos/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(await parseApiError(response));
}

export async function createList(name: string): Promise<TodoListRecord> {
  const response = await apiFetch('/api/lists', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = (await response.json()) as { list: TodoListRecord };
  return data.list;
}
