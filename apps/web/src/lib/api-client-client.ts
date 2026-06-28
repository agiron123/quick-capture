'use client';

import type { Todo, TodoListRecord, TodoSource } from '@quick-capture/shared';

import { authClient } from '@/lib/auth/client';

function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!baseUrl) {
    throw new Error('Missing NEXT_PUBLIC_API_URL');
  }
  return baseUrl.replace(/\/$/, '');
}

async function getAccessToken(): Promise<string | null> {
  if (!authClient) return null;
  const result = await authClient.getSession();
  return result.data?.session?.token ?? null;
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

export type CreateTodoItemInput = {
  title: string;
  source?: TodoSource;
  captureId?: string;
  transcript?: string;
};

export async function createTodosBatch(
  listId: string,
  items: CreateTodoItemInput[]
): Promise<Todo[]> {
  const response = await apiFetch('/api/todos', {
    method: 'POST',
    body: JSON.stringify({
      listId,
      todos: items.map((item) => ({
        title: item.title,
        source: item.source ?? 'manual',
        captureId: item.captureId,
        transcript: item.transcript,
      })),
    }),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = (await response.json()) as { todos: Todo[] };
  return data.todos;
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

export async function reorderTodos(listId: string, todoIds: string[]): Promise<Todo[]> {
  const response = await apiFetch('/api/todos/reorder', {
    method: 'PUT',
    body: JSON.stringify({ listId, todoIds }),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = (await response.json()) as { todos: Todo[] };
  return data.todos;
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

export async function renameList(listId: string, name: string): Promise<TodoListRecord> {
  const response = await apiFetch(`/api/lists/${listId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = (await response.json()) as { list: TodoListRecord };
  return data.list;
}

export async function deleteList(listId: string): Promise<void> {
  const response = await apiFetch(`/api/lists/${listId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(await parseApiError(response));
}

export async function uploadCapture(input: {
  file?: File | Blob;
  filename?: string;
  source: TodoSource;
  transcript?: string;
}): Promise<{ captureId: string; mediaUrl?: string }> {
  const formData = new FormData();
  formData.append('source', input.source);
  if (input.transcript) {
    formData.append('transcript', input.transcript);
  }
  if (input.file) {
    const name = input.filename ?? (input.file instanceof File ? input.file.name : 'capture.bin');
    formData.append('file', input.file, name);
  }

  const response = await apiFetch('/api/captures/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error(await parseApiError(response));
  const data = (await response.json()) as { capture: { id: string }; mediaUrl?: string };
  return { captureId: data.capture.id, mediaUrl: data.mediaUrl };
}

export function getCaptureMediaUrl(captureId: string): string {
  return `${getApiBaseUrl()}/api/captures/${captureId}/media`;
}
