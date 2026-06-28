import { and, asc, eq } from 'drizzle-orm';

import { getDatabase } from '../db/client.js';
import { todoLists } from '../db/schema.js';
import { DEFAULT_LIST_ID, DEFAULT_LIST_NAME } from '../lib/constants.js';

export async function ensureDefaultList(userId: string): Promise<void> {
  const db = getDatabase();
  if (!db) return;

  const existing = await db
    .select({ id: todoLists.id })
    .from(todoLists)
    .where(and(eq(todoLists.id, DEFAULT_LIST_ID), eq(todoLists.userId, userId)))
    .limit(1);

  if (existing.length > 0) return;

  await db.insert(todoLists).values({
    id: DEFAULT_LIST_ID,
    userId,
    name: DEFAULT_LIST_NAME,
    sortOrder: 0,
  });
}

export async function getUserList(userId: string, listId: string) {
  const db = getDatabase();
  if (!db) return null;

  const rows = await db
    .select()
    .from(todoLists)
    .where(and(eq(todoLists.id, listId), eq(todoLists.userId, userId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function listUserLists(userId: string) {
  const db = getDatabase();
  if (!db) return [];

  await ensureDefaultList(userId);

  return db
    .select()
    .from(todoLists)
    .where(eq(todoLists.userId, userId))
    .orderBy(asc(todoLists.sortOrder), asc(todoLists.createdAt));
}
