import {
  chatAttachmentUploadResponseSchema,
  chatRequestSchema,
  createChatThreadSchema,
  updateChatThreadSchema,
} from '@quick-capture/shared';
import { Hono } from 'hono';
import { stream } from 'hono/streaming';

import { isDatabaseConfigured } from '../db/client.js';
import type { AuthVariables } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { createId } from '../lib/id.js';
import { checkChatRateLimit } from '../services/chat-rate-limit.js';
import {
  readChatAttachment,
  saveChatAttachment,
} from '../services/chat-attachment-storage.js';
import {
  createUserChatThread,
  deleteUserChatThread,
  handleChatStream,
  listThreadMessages,
  listUserChatThreads,
  updateUserChatThreadTitle,
} from '../services/chat.js';

const MAX_CHAT_ATTACHMENT_BYTES = 5 * 1024 * 1024;

export const chatRoutes = new Hono<{ Variables: AuthVariables }>();

chatRoutes.use('*', async (c, next) => {
  if (!isDatabaseConfigured()) {
    return c.json({ error: 'Database is not configured (set DATABASE_URL)' }, 503);
  }
  await next();
});

chatRoutes.use('*', authMiddleware);

function formatSse(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

chatRoutes.get('/threads', async (c) => {
  const userId = c.get('userId');
  const threads = await listUserChatThreads(userId);
  return c.json({ threads });
});

chatRoutes.post('/threads', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const parsed = createChatThreadSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const thread = await createUserChatThread(userId, parsed.data.title);
  return c.json({ thread }, 201);
});

chatRoutes.patch('/threads/:id', async (c) => {
  const userId = c.get('userId');
  const threadId = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateChatThreadSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const thread = await updateUserChatThreadTitle(userId, threadId, parsed.data.title);
  if (!thread) {
    return c.json({ error: 'Thread not found' }, 404);
  }

  return c.json({ thread });
});

chatRoutes.delete('/threads/:id', async (c) => {
  const userId = c.get('userId');
  const threadId = c.req.param('id');
  const deleted = await deleteUserChatThread(userId, threadId);

  if (!deleted) {
    return c.json({ error: 'Thread not found' }, 404);
  }

  return c.body(null, 204);
});

chatRoutes.get('/threads/:id/messages', async (c) => {
  const userId = c.get('userId');
  const threadId = c.req.param('id');
  const cursor = c.req.query('cursor');
  const limitParam = c.req.query('limit');
  const limit = limitParam ? Number(limitParam) : undefined;

  const result = await listThreadMessages(userId, threadId, { cursor, limit });
  if (!result) {
    return c.json({ error: 'Thread not found' }, 404);
  }

  return c.json(result);
});

chatRoutes.post('/attachments', async (c) => {
  const userId = c.get('userId');

  try {
    const body = await c.req.parseBody();
    const fileValue = body.image ?? body.file;

    if (!(fileValue instanceof File)) {
      return c.json({ error: 'Missing image upload' }, 400);
    }

    const buffer = Buffer.from(await fileValue.arrayBuffer());
    if (buffer.length === 0) {
      return c.json({ error: 'Image file is empty' }, 400);
    }
    if (buffer.length > MAX_CHAT_ATTACHMENT_BYTES) {
      return c.json({ error: 'Image must be 5 MB or smaller' }, 400);
    }

    const mimeType = fileValue.type.startsWith('image/') ? fileValue.type : 'image/jpeg';
    if (!mimeType.startsWith('image/')) {
      return c.json({ error: 'Only image attachments are supported' }, 400);
    }

    const attachmentId = createId();
    await saveChatAttachment(userId, attachmentId, buffer, mimeType);

    const payload = chatAttachmentUploadResponseSchema.parse({
      attachment: {
        id: attachmentId,
        mimeType,
        url: `/api/chat/attachments/${attachmentId}/media`,
        filename: fileValue.name || undefined,
      },
    });

    return c.json(payload, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return c.json({ error: message }, 400);
  }
});

chatRoutes.get('/attachments/:id/media', async (c) => {
  const userId = c.get('userId');
  const attachmentId = c.req.param('id');
  const media = await readChatAttachment(userId, attachmentId);

  if (!media) {
    return c.json({ error: 'Attachment not found' }, 404);
  }

  return new Response(new Uint8Array(media.buffer), {
    headers: {
      'Content-Type': media.mimeType,
      'Cache-Control': 'private, max-age=3600',
    },
  });
});

chatRoutes.post('/', async (c) => {
  const userId = c.get('userId');
  const rateLimit = checkChatRateLimit(userId);

  if (!rateLimit.allowed) {
    c.header('Retry-After', String(rateLimit.retryAfterSec));
    return c.json({ error: 'Chat rate limit exceeded' }, 429);
  }

  const body = await c.req.json();
  const parsed = chatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  return stream(c, async (sseStream) => {
    c.header('Content-Type', 'text/event-stream; charset=utf-8');
    c.header('Cache-Control', 'no-cache, no-transform');
    c.header('Connection', 'keep-alive');

    try {
      await handleChatStream(userId, parsed.data, {
        write: async (event) => {
          await sseStream.write(formatSse(event));
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Chat failed';
      await sseStream.write(formatSse({ type: 'error', error: message }));
      await sseStream.write(formatSse({ type: 'done' }));
    }
  });
});
