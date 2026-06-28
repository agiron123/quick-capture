import {
    createTodoSchema,
    createTodosBatchSchema,
    reorderTodosSchema,
    updateTodoSchema,
} from '@quick-capture/shared';
import { and, asc, eq } from 'drizzle-orm';
import { Hono } from 'hono';

import { getDatabase, isDatabaseConfigured } from '../db/client.js';
import { todos } from '../db/schema.js';
import { DEFAULT_LIST_ID } from '../lib/constants.js';
import { createId } from '../lib/id.js';
import { serializeTodo } from '../lib/serialize.js';
import type { AuthVariables } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { ensureDefaultList, getUserList } from '../services/lists.js';

export const todoRoutes = new Hono<{ Variables: AuthVariables }>();

todoRoutes.use('*', async (c, next) => {
  if (!isDatabaseConfigured()) {
    return c.json({ error: 'Database is not configured (set DATABASE_URL)' }, 503);
  }
  await next();
});

todoRoutes.use('*', authMiddleware);

todoRoutes.get('/', async (c) => {
  const userId = c.get('userId');
  const listId = c.req.query('listId') ?? DEFAULT_LIST_ID;

  await ensureDefaultList(userId);
  const list = await getUserList(userId, listId);
  if (!list) {
    return c.json({ error: 'List not found' }, 404);
  }

  const db = getDatabase()!;
  const rows = await db
    .select()
    .from(todos)
    .where(and(eq(todos.userId, userId), eq(todos.listId, listId)))
    .orderBy(asc(todos.sortOrder), asc(todos.createdAt));

  return c.json({ todos: rows.map(serializeTodo) });
});

todoRoutes.post('/', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();

  const batchParsed = createTodosBatchSchema.safeParse(body);
  if (batchParsed.success) {
    try {
      const created = await insertTodos(userId, batchParsed.data.listId, batchParsed.data.todos);
      return c.json({ todos: created }, 201);
    } catch {
      return c.json({ error: 'List not found' }, 404);
    }
  }

  const parsed = createTodoSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  try {
    const created = await insertTodos(userId, parsed.data.listId, [parsed.data]);
    return c.json({ todo: created[0], todos: created }, 201);
  } catch {
    return c.json({ error: 'List not found' }, 404);
  }
});

todoRoutes.put('/reorder', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const parsed = reorderTodosSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const list = await getUserList(userId, parsed.data.listId);
  if (!list) {
    return c.json({ error: 'List not found' }, 404);
  }

  const db = getDatabase()!;
  const existing = await db
    .select({ id: todos.id })
    .from(todos)
    .where(and(eq(todos.userId, userId), eq(todos.listId, parsed.data.listId)));

  const existingIds = new Set(existing.map((row) => row.id));
  if (
    parsed.data.todoIds.length !== existing.length ||
    parsed.data.todoIds.some((id) => !existingIds.has(id))
  ) {
    return c.json({ error: 'Invalid reorder payload' }, 400);
  }

  await Promise.all(
    parsed.data.todoIds.map((id, index) =>
      db
        .update(todos)
        .set({ sortOrder: index })
        .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    )
  );

  const rows = await db
    .select()
    .from(todos)
    .where(and(eq(todos.userId, userId), eq(todos.listId, parsed.data.listId)))
    .orderBy(asc(todos.sortOrder));

  return c.json({ todos: rows.map(serializeTodo) });
});

todoRoutes.patch('/:id', async (c) => {
  const userId = c.get('userId');
  const todoId = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateTodoSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const db = getDatabase()!;
  const existing = await db
    .select()
    .from(todos)
    .where(and(eq(todos.id, todoId), eq(todos.userId, userId)))
    .limit(1);

  const todo = existing[0];
  if (!todo) {
    return c.json({ error: 'Todo not found' }, 404);
  }

  if (parsed.data.baseUpdatedAt !== undefined && todo.updatedAt !== parsed.data.baseUpdatedAt) {
    return c.json({ error: 'Conflict', todo: serializeTodo(todo) }, 409);
  }

  const updates: Partial<typeof todo> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.listId !== undefined) updates.listId = parsed.data.listId;
  if (parsed.data.sortOrder !== undefined) updates.sortOrder = parsed.data.sortOrder;
  if (parsed.data.completed !== undefined) {
    updates.completed = parsed.data.completed;
    if (parsed.data.completed) {
      updates.reminderAt = null;
      updates.reminderSentAt = null;
    }
  }
  if (parsed.data.tags !== undefined) {
    updates.tags = parsed.data.tags.length > 0 ? parsed.data.tags : null;
  }
  if (parsed.data.priority !== undefined) {
    updates.priority = parsed.data.priority;
  }
  if (parsed.data.dueAt !== undefined) {
    updates.dueAt = parsed.data.dueAt;
  }
  if (parsed.data.reminderAt !== undefined) {
    updates.reminderAt = parsed.data.reminderAt;
    updates.reminderSentAt = null;
  }

  updates.updatedAt = new Date().toISOString();

  await db
    .update(todos)
    .set(updates)
    .where(and(eq(todos.id, todoId), eq(todos.userId, userId)));

  const [updated] = await db.select().from(todos).where(eq(todos.id, todoId)).limit(1);
  return c.json({ todo: serializeTodo(updated) });
});

todoRoutes.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const todoId = c.req.param('id');
  const db = getDatabase()!;

  const result = await db
    .delete(todos)
    .where(and(eq(todos.id, todoId), eq(todos.userId, userId)))
    .returning({ id: todos.id });

  if (result.length === 0) {
    return c.json({ error: 'Todo not found' }, 404);
  }

  return c.json({ ok: true });
});

async function insertTodos(
  userId: string,
  listId: string | undefined,
  items: Array<ReturnType<typeof createTodoSchema.parse>>
) {
  await ensureDefaultList(userId);
  const targetListId = listId ?? DEFAULT_LIST_ID;
  const list = await getUserList(userId, targetListId);
  if (!list) {
    throw new Error('List not found');
  }

  const db = getDatabase()!;
  const existing = await db
    .select({ sortOrder: todos.sortOrder })
    .from(todos)
    .where(and(eq(todos.userId, userId), eq(todos.listId, targetListId)));

  let nextSortOrder = existing.reduce((max, row) => Math.max(max, row.sortOrder), -1) + 1;
  const now = new Date().toISOString();

  const rows = items
    .filter((item) => item.title.trim())
    .map((item) => {
      const sortOrder = item.sortOrder ?? nextSortOrder++;
      return {
        id: item.clientId ?? createId(),
        userId,
        listId: item.listId ?? targetListId,
        title: item.title.trim(),
        completed: false,
        source: item.source,
        sortOrder,
        createdAt: now,
        updatedAt: now,
        dueAt: item.dueAt ?? null,
        priority: item.priority ?? null,
        tags: item.tags?.length ? item.tags : null,
        reminderAt: item.reminderAt ?? null,
        transcript: item.transcript ?? null,
        captureId: item.captureId ?? null,
      };
    });

  if (rows.length === 0) {
    return [];
  }

  await db.insert(todos).values(rows);
  return rows.map((row) =>
    serializeTodo({
      ...row,
      updatedAt: row.updatedAt,
      reminderSentAt: null,
      captureId: row.captureId,
    })
  );
}
