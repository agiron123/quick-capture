import {
  chatRequestSchema,
  createChatThreadSchema,
  updateChatThreadSchema,
} from '@quick-capture/shared';
import { Hono } from 'hono';
import { stream } from 'hono/streaming';

import { isDatabaseConfigured } from '../db/client.js';
import type { AuthVariables } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { checkChatRateLimit } from '../services/chat-rate-limit.js';
import {
  createUserChatThread,
  deleteUserChatThread,
  handleChatStream,
  listThreadMessages,
  listUserChatThreads,
  updateUserChatThreadTitle,
} from '../services/chat.js';

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
