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
