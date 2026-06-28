import type { Todo, TodoListRecord } from '@quick-capture/shared';

import { getAccessToken } from '@/services/auth-client';

function getApiBaseUrl(): string {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!baseUrl) {
    throw new Error('Missing EXPO_PUBLIC_API_URL');
  }
  return baseUrl.replace(/\/$/, '');
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

export async function syncApiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  if (init.body && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
  });
}

export async function fetchListsFromApi(): Promise<TodoListRecord[]> {
  const response = await syncApiFetch('/api/lists');
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = (await response.json()) as { lists: TodoListRecord[] };
  return data.lists;
}

export async function fetchTodosFromApi(listId: string): Promise<Todo[]> {
  const response = await syncApiFetch(`/api/todos?listId=${encodeURIComponent(listId)}`);
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = (await response.json()) as { todos: Todo[] };
  return data.todos;
}

export async function updateTodoReminderOnApi(
  id: string,
  reminderAt: string | null
): Promise<void> {
  const response = await syncApiFetch(`/api/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ reminderAt }),
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
}

export async function createTodoOnApi(input: {
  title: string;
  source?: Todo['source'];
  listId: string;
  sortOrder?: number;
  clientId?: string;
  captureId?: string;
  transcript?: string;
  reminderAt?: string;
}): Promise<Todo> {
  const response = await syncApiFetch('/api/todos', {
    method: 'POST',
    body: JSON.stringify({
      title: input.title,
      source: input.source ?? 'manual',
      listId: input.listId,
      sortOrder: input.sortOrder,
      clientId: input.clientId,
      captureId: input.captureId,
      transcript: input.transcript,
      reminderAt: input.reminderAt,
    }),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = (await response.json()) as { todo: Todo };
  return data.todo;
}

export async function createTodosBatchOnApi(
  listId: string,
  items: Array<{
    title: string;
    source?: Todo['source'];
    clientId?: string;
    captureId?: string;
    transcript?: string;
    reminderAt?: string;
    sortOrder?: number;
  }>
): Promise<Todo[]> {
  const response = await syncApiFetch('/api/todos', {
    method: 'POST',
    body: JSON.stringify({
      listId,
      todos: items.map((item) => ({
        title: item.title,
        source: item.source ?? 'capture',
        clientId: item.clientId,
        captureId: item.captureId,
        transcript: item.transcript,
        reminderAt: item.reminderAt,
        sortOrder: item.sortOrder,
      })),
    }),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = (await response.json()) as { todos: Todo[] };
  return data.todos;
}

export async function updateTodoOnApi(
  id: string,
  patch: { title?: string; completed?: boolean; reminderAt?: string | null }
): Promise<Todo> {
  const response = await syncApiFetch(`/api/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = (await response.json()) as { todo: Todo };
  return data.todo;
}

export async function deleteTodoOnApi(id: string): Promise<void> {
  const response = await syncApiFetch(`/api/todos/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(await parseApiError(response));
}

export async function reorderTodosOnApi(listId: string, todoIds: string[]): Promise<Todo[]> {
  const response = await syncApiFetch('/api/todos/reorder', {
    method: 'PUT',
    body: JSON.stringify({ listId, todoIds }),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = (await response.json()) as { todos: Todo[] };
  return data.todos;
}

export async function createListOnApi(name: string): Promise<TodoListRecord> {
  const response = await syncApiFetch('/api/lists', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = (await response.json()) as { list: TodoListRecord };
  return data.list;
}

export async function renameListOnApi(listId: string, name: string): Promise<TodoListRecord> {
  const response = await syncApiFetch(`/api/lists/${listId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = (await response.json()) as { list: TodoListRecord };
  return data.list;
}

export async function deleteListOnApi(listId: string): Promise<void> {
  const response = await syncApiFetch(`/api/lists/${listId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(await parseApiError(response));
}

export async function registerDeviceOnApi(input: {
  platform: 'ios' | 'android' | 'web';
  pushProvider: 'expo' | 'web-push';
  pushToken: string;
  deviceName?: string;
}): Promise<void> {
  const response = await syncApiFetch('/api/devices/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
}

export function isSyncApiConfigured(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_API_URL?.trim());
}
