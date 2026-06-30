import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Hono } from 'hono';

import type { AuthVariables } from '../middleware/auth.js';

const jwtVerify = vi.fn();

vi.mock('jose', () => ({
  jwtVerify,
  createRemoteJWKSet: vi.fn(() => ({})),
}));

describe('authMiddleware', () => {
  const originalAuthUrl = process.env.NEON_AUTH_URL;

  beforeEach(() => {
    jwtVerify.mockReset();
    process.env.NEON_AUTH_URL = 'https://auth.example.com';
  });

  afterEach(() => {
    if (originalAuthUrl === undefined) {
      delete process.env.NEON_AUTH_URL;
    } else {
      process.env.NEON_AUTH_URL = originalAuthUrl;
    }
    vi.resetModules();
  });

  async function loadMiddleware() {
    const mod = await import('../middleware/auth.js');
    return mod.authMiddleware;
  }

  it('returns 503 when auth is not configured', async () => {
    delete process.env.NEON_AUTH_URL;
    vi.resetModules();
    const authMiddleware = await loadMiddleware();
    const app = new Hono<{ Variables: AuthVariables }>();
    app.use('*', authMiddleware);
    app.get('/', (c) => c.json({ ok: true }));

    const response = await app.request('/');
    expect(response.status).toBe(503);
  });

  it('returns 401 without bearer token', async () => {
    const authMiddleware = await loadMiddleware();
    const app = new Hono<{ Variables: AuthVariables }>();
    app.use('*', authMiddleware);
    app.get('/', (c) => c.json({ ok: true }));

    const response = await app.request('/');
    expect(response.status).toBe(401);
  });

  it('sets userId for valid JWT', async () => {
    jwtVerify.mockResolvedValue({ payload: { sub: 'user-123' } });
    const authMiddleware = await loadMiddleware();
    const app = new Hono<{ Variables: AuthVariables }>();
    app.use('*', authMiddleware);
    app.get('/', (c) => c.json({ userId: c.get('userId') }));

    const response = await app.request('/', {
      headers: { Authorization: 'Bearer valid-token' },
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ userId: 'user-123' });
  });
});
