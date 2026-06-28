import { createCaptureSchema, todoSourceSchema } from '@quick-capture/shared';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { getDatabase, isDatabaseConfigured } from '../db/client.js';
import { captures } from '../db/schema.js';
import { serializeCapture } from '../lib/serialize.js';
import type { AuthVariables } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { readCaptureMedia, saveCaptureMedia } from '../services/capture-storage.js';

export const captureRoutes = new Hono<{ Variables: AuthVariables }>();

captureRoutes.use('*', async (c, next) => {
  if (!isDatabaseConfigured()) {
    return c.json({ error: 'Database is not configured (set DATABASE_URL)' }, 503);
  }
  await next();
});

captureRoutes.use('*', authMiddleware);

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

captureRoutes.post('/upload', async (c) => {
  const userId = c.get('userId');

  try {
    const body = await c.req.parseBody();
    const sourceValue = body.source;
    const transcriptValue = body.transcript;
    const fileValue = body.file ?? body.image ?? body.audio;

    const sourceParsed = todoSourceSchema.safeParse(sourceValue);
    if (!sourceParsed.success) {
      return c.json({ error: 'Invalid capture source' }, 400);
    }

    const metaParsed = createCaptureSchema.safeParse({
      source: sourceParsed.data,
      transcript: typeof transcriptValue === 'string' ? transcriptValue : undefined,
    });

    if (!metaParsed.success) {
      return c.json({ error: metaParsed.error.flatten() }, 400);
    }

    const db = getDatabase()!;
    const [capture] = await db
      .insert(captures)
      .values({
        userId,
        source: metaParsed.data.source,
        transcript: metaParsed.data.transcript ?? null,
        mediaMimeType: metaParsed.data.mediaMimeType ?? null,
      })
      .returning();

    let savedCapture = capture;
    let mediaUrl: string | undefined;

    if (fileValue) {
      const upload = await readUploadFile(fileValue, 'file');
      const mediaKey = await saveCaptureMedia(userId, capture.id, upload.buffer, upload.mimeType);

      const [updated] = await db
        .update(captures)
        .set({
          mediaKey,
          mediaMimeType: upload.mimeType,
          updatedAt: new Date().toISOString(),
        })
        .where(and(eq(captures.id, capture.id), eq(captures.userId, userId)))
        .returning();

      savedCapture = updated;
      mediaUrl = `/api/captures/${capture.id}/media`;
    }

    return c.json(
      {
        capture: serializeCapture(savedCapture),
        mediaUrl,
      },
      201
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return c.json({ error: message }, 400);
  }
});

captureRoutes.get('/:id/media', async (c) => {
  const userId = c.get('userId');
  const captureId = c.req.param('id');

  const idParsed = z.string().uuid().safeParse(captureId);
  if (!idParsed.success) {
    return c.json({ error: 'Invalid capture id' }, 400);
  }

  const db = getDatabase()!;
  const rows = await db
    .select()
    .from(captures)
    .where(and(eq(captures.id, captureId), eq(captures.userId, userId)))
    .limit(1);

  const capture = rows[0];
  if (!capture?.mediaKey) {
    return c.json({ error: 'Media not found' }, 404);
  }

  const media = await readCaptureMedia(capture.mediaKey);
  if (!media) {
    return c.json({ error: 'Media not found' }, 404);
  }

  return new Response(new Uint8Array(media.buffer), {
    headers: {
      'Content-Type': media.mimeType,
      'Cache-Control': 'private, max-age=3600',
    },
  });
});
