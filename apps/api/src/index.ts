import './load-env.js';

import { serve } from '@hono/node-server';
import { createTodoSchema } from '@quick-capture/shared';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { aiRoutes } from './routes/ai.js';

const app = new Hono();

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  })
);

app.get('/health', (c) => c.json({ status: 'ok' }));

app.get('/api', (c) => c.json({ name: 'quick-capture-api', version: '0.0.0' }));

app.post('/api/todos/validate', async (c) => {
  const body = await c.req.json();
  const parsed = createTodoSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  return c.json({ ok: true, data: parsed.data });
});

app.route('/api/ai', aiRoutes);

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, () => {
  console.log(`API listening on http://localhost:${port}`);
});
