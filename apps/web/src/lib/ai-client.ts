import type { ExtractedTodoDto, ExtractImageResponse, ExtractVoiceResponse } from '@quick-capture/shared';

const MOCK_TODOS: ExtractedTodoDto[] = [
  { title: 'Review meeting notes' },
  { title: 'Send follow-up email' },
  { title: 'Schedule dentist appointment' },
];

const MOCK_TRANSCRIPT =
  'Pick up groceries, call the dentist, and review the project notes before Monday.';

function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!baseUrl) {
    throw new Error('Missing NEXT_PUBLIC_API_URL');
  }
  return baseUrl.replace(/\/$/, '');
}

function shouldUseMockAi(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_AI === 'true';
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (typeof data.error === 'string') return data.error;
  } catch {
    // fall through
  }
  return `Request failed: ${response.status}`;
}

export async function extractTodosFromImage(file: File): Promise<ExtractedTodoDto[]> {
  if (shouldUseMockAi()) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return MOCK_TODOS;
  }

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${getApiBaseUrl()}/api/ai/extract/image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const data = (await response.json()) as ExtractImageResponse;
  return data.todos;
}

export async function extractTodosFromVoice(blob: Blob, filename = 'recording.webm'): Promise<{
  transcript: string;
  todos: ExtractedTodoDto[];
}> {
  if (shouldUseMockAi()) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { transcript: MOCK_TRANSCRIPT, todos: MOCK_TODOS };
  }

  const formData = new FormData();
  formData.append('audio', blob, filename);

  const response = await fetch(`${getApiBaseUrl()}/api/ai/extract/voice`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const data = (await response.json()) as ExtractVoiceResponse;
  return { transcript: data.transcript, todos: data.todos };
}
