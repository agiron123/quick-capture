import { createListSchema, updateListSchema } from '@quick-capture/shared';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';

import { getDatabase, isDatabaseConfigured } from '../db/client.js';
import { todoLists, todos } from '../db/schema.js';
import { DEFAULT_LIST_ID } from '../lib/constants.js';
import { createId } from '../lib/id.js';
import { serializeList } from '../lib/serialize.js';
import type { AuthVariables } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { ensureDefaultList, getUserList, listUserLists } from '../services/lists.js';

export const listRoutes = new Hono<{ Variables: AuthVariables }>();

listRoutes.use('*', async (c, next) => {
  if (!isDatabaseConfigured()) {
    return c.json({ error: 'Database is not configured (set DATABASE_URL)' }, 503);
  }
  await next();
});

listRoutes.use('*', authMiddleware);

listRoutes.get('/', async (c) => {
  const userId = c.get('userId');
  const rows = await listUserLists(userId);
  return c.json({ lists: rows.map(serializeList) });
});

listRoutes.post('/', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const parsed = createListSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const db = getDatabase()!;
  const existing = await db
    .select({ sortOrder: todoLists.sortOrder })
    .from(todoLists)
    .where(eq(todoLists.userId, userId));

  const maxSortOrder = existing.reduce((max, row) => Math.max(max, row.sortOrder), -1);

  const list = {
    id: createId(),
    userId,
    name: parsed.data.name,
    sortOrder: maxSortOrder + 1,
  };

  await db.insert(todoLists).values(list);
  return c.json({ list: serializeList({ ...list, createdAt: new Date().toISOString() }) }, 201);
});

listRoutes.patch('/:id', async (c) => {
  const userId = c.get('userId');
  const listId = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateListSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const list = await getUserList(userId, listId);
  if (!list) {
    return c.json({ error: 'List not found' }, 404);
  }

  const db = getDatabase()!;
  await db
    .update(todoLists)
    .set({ name: parsed.data.name })
    .where(and(eq(todoLists.id, listId), eq(todoLists.userId, userId)));

  return c.json({ list: serializeList({ ...list, name: parsed.data.name }) });
});

listRoutes.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const listId = c.req.param('id');

  if (listId === DEFAULT_LIST_ID) {
    return c.json({ error: 'Cannot delete the default Inbox list' }, 400);
  }

  const list = await getUserList(userId, listId);
  if (!list) {
    return c.json({ error: 'List not found' }, 404);
  }

  const db = getDatabase()!;
  await ensureDefaultList(userId);

  await db
    .update(todos)
    .set({ listId: DEFAULT_LIST_ID })
    .where(and(eq(todos.listId, listId), eq(todos.userId, userId)));

  await db
    .delete(todoLists)
    .where(and(eq(todoLists.id, listId), eq(todoLists.userId, userId)));

  return c.json({ ok: true });
});
