import { registerDeviceSchema } from '@quick-capture/shared';
import { and, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';

import { getDatabase, isDatabaseConfigured } from '../db/client.js';
import { userDevices } from '../db/schema.js';
import type { AuthVariables } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';

function serializeDevice(row: typeof userDevices.$inferSelect) {
  return {
    id: row.id,
    userId: row.userId,
    platform: row.platform,
    pushProvider: row.pushProvider,
    deviceName: row.deviceName ?? undefined,
    lastSeenAt: row.lastSeenAt,
    createdAt: row.createdAt,
  };
}

export const deviceRoutes = new Hono<{ Variables: AuthVariables }>();

deviceRoutes.use('*', async (c, next) => {
  if (!isDatabaseConfigured()) {
    return c.json({ error: 'Database is not configured (set DATABASE_URL)' }, 503);
  }
  await next();
});

deviceRoutes.use('*', authMiddleware);

deviceRoutes.get('/', async (c) => {
  const userId = c.get('userId');
  const db = getDatabase()!;
  const rows = await db
    .select()
    .from(userDevices)
    .where(eq(userDevices.userId, userId))
    .orderBy(desc(userDevices.lastSeenAt));

  return c.json({ devices: rows.map(serializeDevice) });
});

deviceRoutes.post('/register', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const parsed = registerDeviceSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const db = getDatabase()!;
  const now = new Date().toISOString();
  const existing = await db
    .select()
    .from(userDevices)
    .where(
      and(eq(userDevices.userId, userId), eq(userDevices.pushToken, parsed.data.pushToken))
    )
    .limit(1);

  if (existing[0]) {
    await db
      .update(userDevices)
      .set({
        lastSeenAt: now,
        deviceName: parsed.data.deviceName ?? existing[0].deviceName,
        platform: parsed.data.platform,
        pushProvider: parsed.data.pushProvider,
      })
      .where(eq(userDevices.id, existing[0].id));

    const [updated] = await db
      .select()
      .from(userDevices)
      .where(eq(userDevices.id, existing[0].id))
      .limit(1);

    return c.json({ device: serializeDevice(updated) });
  }

  const [created] = await db
    .insert(userDevices)
    .values({
      userId,
      platform: parsed.data.platform,
      pushToken: parsed.data.pushToken,
      pushProvider: parsed.data.pushProvider,
      deviceName: parsed.data.deviceName,
      lastSeenAt: now,
    })
    .returning();

  return c.json({ device: serializeDevice(created) }, 201);
});

deviceRoutes.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const deviceId = c.req.param('id');
  const db = getDatabase()!;

  const result = await db
    .delete(userDevices)
    .where(and(eq(userDevices.id, deviceId), eq(userDevices.userId, userId)))
    .returning({ id: userDevices.id });

  if (result.length === 0) {
    return c.json({ error: 'Device not found' }, 404);
  }

  return c.json({ ok: true });
});
