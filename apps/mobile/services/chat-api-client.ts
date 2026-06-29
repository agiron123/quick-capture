import type {
  ChatMessage,
  ChatStreamEvent,
  ChatThread,
  CreateChatThreadRequest,
  UpdateChatThreadRequest,
} from '@quick-capture/shared';

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

export async function chatApiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
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
  });
}

export async function fetchChatThreads(): Promise<ChatThread[]> {
  const response = await chatApiFetch('/api/chat/threads');
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = (await response.json()) as { threads: ChatThread[] };
  return data.threads;
}

export async function createChatThread(body: CreateChatThreadRequest = {}): Promise<ChatThread> {
  const response = await chatApiFetch('/api/chat/threads', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = (await response.json()) as { thread: ChatThread };
  return data.thread;
}

export async function updateChatThread(
  threadId: string,
  body: UpdateChatThreadRequest
): Promise<ChatThread> {
  const response = await chatApiFetch(`/api/chat/threads/${encodeURIComponent(threadId)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = (await response.json()) as { thread: ChatThread };
  return data.thread;
}

export async function deleteChatThread(threadId: string): Promise<void> {
  const response = await chatApiFetch(`/api/chat/threads/${encodeURIComponent(threadId)}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error(await parseApiError(response));
}

export async function fetchChatMessages(
  threadId: string,
  cursor?: string
): Promise<{ messages: ChatMessage[]; nextCursor?: string }> {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);

  const query = params.toString();
  const response = await chatApiFetch(
    `/api/chat/threads/${encodeURIComponent(threadId)}/messages${query ? `?${query}` : ''}`
  );
  if (!response.ok) throw new Error(await parseApiError(response));
  return (await response.json()) as { messages: ChatMessage[]; nextCursor?: string };
}

function parseSseEvents(chunk: string, onEvent: (event: ChatStreamEvent) => void) {
  const lines = chunk.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data:')) continue;
    const payload = trimmed.slice('data:'.length).trim();
    if (!payload) continue;
    try {
      onEvent(JSON.parse(payload) as ChatStreamEvent);
    } catch {
      // ignore malformed events
    }
  }
}

export async function streamChatMessage(
  input: { threadId?: string; message: string },
  onEvent: (event: ChatStreamEvent) => void
): Promise<void> {
  const response = await chatApiFetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify(input),
    headers: {
      Accept: 'text/event-stream',
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  if (!response.body) {
    throw new Error('Chat stream returned no body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      parseSseEvents(part, onEvent);
    }
  }

  if (buffer.trim()) {
    parseSseEvents(buffer, onEvent);
  }
}
