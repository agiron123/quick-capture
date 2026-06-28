import {
    aiStatusResponseSchema,
    extractImageResponseSchema,
    extractTranscriptRequestSchema,
    extractTranscriptResponseSchema,
    extractVoiceResponseSchema,
} from '@quick-capture/shared';
import { Hono } from 'hono';

import {
    assertChatProviderConfigured,
    assertTranscriptionConfigured,
    getAiConfig,
} from '../ai/config.js';
import { getChatProvider } from '../ai/router.js';
import { transcribeAudio } from '../ai/transcribe.js';

export const aiRoutes = new Hono();

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong';
}

function toErrorStatus(error: unknown): 400 | 500 {
  if (error instanceof Error) {
    if (
      error.message.includes('required') ||
      error.message.includes('Missing') ||
      error.message.includes('Voice capture requires')
    ) {
      return 400;
    }
  }
  return 500;
}

async function readUploadFile(
  value: unknown,
  fieldName: string
): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
  if (!(value instanceof File)) {
    throw new Error(`Missing ${fieldName} file upload`);
  }

  const buffer = Buffer.from(await value.arrayBuffer());
  if (buffer.length === 0) {
    throw new Error(`${fieldName} file is empty`);
  }

  return {
    buffer,
    filename: value.name || fieldName,
    mimeType: value.type || 'application/octet-stream',
  };
}

aiRoutes.get('/status', (c) => {
  const config = getAiConfig();
  const payload = aiStatusResponseSchema.parse({
    provider: config.provider,
    transcriptionProvider: config.transcriptionProvider,
    mockMode: false,
  });
  return c.json(payload);
});

aiRoutes.post('/extract/image', async (c) => {
  try {
    const config = getAiConfig();
    assertChatProviderConfigured(config);

    const body = await c.req.parseBody();
    const upload = await readUploadFile(body.image, 'image');
    const mimeType = upload.mimeType.startsWith('image/') ? upload.mimeType : 'image/jpeg';
    const imageBase64 = upload.buffer.toString('base64');

    const provider = getChatProvider(config);
    const todos = await provider.extractFromImage(imageBase64, mimeType);
    const payload = extractImageResponseSchema.parse({ todos });
    return c.json(payload);
  } catch (error) {
    const status = toErrorStatus(error);
    return c.json({ error: toErrorMessage(error) }, status);
  }
});

aiRoutes.post('/extract/transcript', async (c) => {
  try {
    const config = getAiConfig();
    assertChatProviderConfigured(config);

    const body = await c.req.json();
    const parsed = extractTranscriptRequestSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.flatten() }, 400);
    }

    const provider = getChatProvider(config);
    const todos = await provider.extractFromTranscript(parsed.data.transcript);
    const payload = extractTranscriptResponseSchema.parse({ todos });
    return c.json(payload);
  } catch (error) {
    const status = toErrorStatus(error);
    return c.json({ error: toErrorMessage(error) }, status);
  }
});

aiRoutes.post('/extract/voice', async (c) => {
  try {
    const config = getAiConfig();
    assertChatProviderConfigured(config);
    assertTranscriptionConfigured(config);

    const body = await c.req.parseBody();
    const upload = await readUploadFile(body.audio, 'audio');
    const mimeType = upload.mimeType.startsWith('audio/') ? upload.mimeType : 'audio/m4a';

    const transcript = await transcribeAudio(
      config,
      upload.buffer,
      upload.filename || 'recording.m4a',
      mimeType
    );

    const provider = getChatProvider(config);
    const todos = transcript
      ? await provider.extractFromTranscript(transcript)
      : [];

    const payload = extractVoiceResponseSchema.parse({ transcript, todos });
    return c.json(payload);
  } catch (error) {
    const status = toErrorStatus(error);
    return c.json({ error: toErrorMessage(error) }, status);
  }
});
