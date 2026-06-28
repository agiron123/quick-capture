import type {
    ExtractImageResponse,
    ExtractTranscriptResponse,
    ExtractVoiceResponse,
} from '@quick-capture/shared';

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
    if (typeof data.error === 'string') {
      return data.error;
    }
    if (data.error) {
      return JSON.stringify(data.error);
    }
  } catch {
    // fall through
  }
  return `Request failed: ${response.status}`;
}

export async function extractTodosFromImageViaApi(imageUri: string): Promise<ExtractImageResponse> {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    name: 'capture.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  const response = await fetch(`${getApiBaseUrl()}/api/ai/extract/image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as ExtractImageResponse;
}

export async function extractTodosFromVoiceViaApi(audioUri: string): Promise<ExtractVoiceResponse> {
  const formData = new FormData();
  formData.append('audio', {
    uri: audioUri,
    name: 'recording.m4a',
    type: 'audio/m4a',
  } as unknown as Blob);

  const response = await fetch(`${getApiBaseUrl()}/api/ai/extract/voice`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as ExtractVoiceResponse;
}

export async function extractTodosFromTranscriptViaApi(
  transcript: string
): Promise<ExtractTranscriptResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/ai/extract/transcript`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transcript }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as ExtractTranscriptResponse;
}

export function shouldUseMockAi(): boolean {
  return process.env.EXPO_PUBLIC_USE_MOCK_AI === 'true';
}

export function isApiConfigured(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_API_URL?.trim());
}
