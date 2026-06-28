import { and, eq, gte, isNull, lte } from 'drizzle-orm';

import { getDatabase, isDatabaseConfigured } from '../db/client.js';
import { todos, userDevices } from '../db/schema.js';
import { dispatchReminder } from './push-dispatcher.js';

const DEVICE_TTL_MS = 90 * 24 * 60 * 60 * 1000;

function getPollIntervalMs(): number {
  const raw = Number(process.env.REMINDER_POLL_INTERVAL_MS ?? 60_000);
  return Number.isFinite(raw) && raw >= 10_000 ? raw : 60_000;
}

async function getActiveDevices(userId: string) {
  const db = getDatabase()!;
  const cutoff = new Date(Date.now() - DEVICE_TTL_MS).toISOString();
  return db
    .select()
    .from(userDevices)
    .where(and(eq(userDevices.userId, userId), gte(userDevices.lastSeenAt, cutoff)));
}

async function processDueReminders(): Promise<void> {
  const db = getDatabase();
  if (!db) return;

  const now = new Date().toISOString();
  const due = await db
    .select()
    .from(todos)
    .where(
      and(
        lte(todos.reminderAt, now),
        isNull(todos.reminderSentAt),
        eq(todos.completed, false)
      )
    );

  for (const todo of due) {
    if (!todo.reminderAt) continue;

    try {
      const devices = await getActiveDevices(todo.userId);
      await dispatchReminder(todo, devices);
      await db
        .update(todos)
        .set({ reminderSentAt: new Date().toISOString() })
        .where(eq(todos.id, todo.id));
    } catch (error) {
      console.error(`Reminder dispatch failed for todo ${todo.id}:`, error);
    }
  }
}

export function startReminderWorker(): void {
  if (!isDatabaseConfigured()) {
    console.log('Reminder worker disabled: DATABASE_URL not set');
    return;
  }

  const intervalMs = getPollIntervalMs();
  console.log(`Reminder worker started (every ${intervalMs}ms)`);

  void processDueReminders();
  setInterval(() => {
    void processDueReminders();
  }, intervalMs);
}
