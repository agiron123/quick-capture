import './load-env.js';

import { serve } from '@hono/node-server';
import { createTodoSchema } from '@quick-capture/shared';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { aiRoutes } from './routes/ai.js';
import { captureRoutes } from './routes/captures.js';
import { deviceRoutes } from './routes/devices.js';
import { listRoutes } from './routes/lists.js';
import { todoRoutes } from './routes/todos.js';
import { startReminderWorker } from './services/reminder-worker.js';

const app = new Hono();

const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3001,http://localhost:8081')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin) return '*';
      if (allowedOrigins.includes(origin)) return origin;
      if (process.env.NODE_ENV !== 'production') return origin;
      return allowedOrigins[0] ?? '*';
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.get('/health', (c) => c.json({ status: 'ok' }));

app.get('/api', (c) =>
  c.json({
    name: 'quick-capture-api',
    version: '0.1.0',
    features: {
      ai: true,
      sync: Boolean(process.env.DATABASE_URL?.trim()),
      auth: Boolean(process.env.NEON_AUTH_URL?.trim() ?? process.env.NEON_AUTH_BASE_URL?.trim()),
    },
  })
);

app.post('/api/todos/validate', async (c) => {
  const body = await c.req.json();
  const parsed = createTodoSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  return c.json({ ok: true, data: parsed.data });
});

app.route('/api/ai', aiRoutes);
app.route('/api/captures', captureRoutes);
app.route('/api/devices', deviceRoutes);
app.route('/api/lists', listRoutes);
app.route('/api/todos', todoRoutes);

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, () => {
  console.log(`API listening on http://localhost:${port}`);
  startReminderWorker();
});
