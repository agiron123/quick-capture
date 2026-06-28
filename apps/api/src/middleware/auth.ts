import { createMiddleware } from 'hono/factory';
import * as jose from 'jose';

export type AuthVariables = {
  userId: string;
};

function getNeonAuthUrl(): string | null {
  const url = process.env.NEON_AUTH_URL?.trim() ?? process.env.NEON_AUTH_BASE_URL?.trim();
  return url || null;
}

let jwks: ReturnType<typeof jose.createRemoteJWKSet> | null = null;

function getJwks(authUrl: string) {
  if (!jwks) {
    jwks = jose.createRemoteJWKSet(new URL(`${authUrl.replace(/\/$/, '')}/.well-known/jwks.json`));
  }
  return jwks;
}

export function isAuthConfigured(): boolean {
  return Boolean(getNeonAuthUrl());
}

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const authUrl = getNeonAuthUrl();
  if (!authUrl) {
    return c.json({ error: 'Auth is not configured (set NEON_AUTH_URL)' }, 503);
  }

  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { payload } = await jose.jwtVerify(token, getJwks(authUrl), {
      issuer: new URL(authUrl).origin,
    });

    if (!payload.sub) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    c.set('userId', payload.sub);
    await next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    return c.json({ error: 'Invalid token' }, 401);
  }
});

export const optionalAuthMiddleware = createMiddleware<{ Variables: Partial<AuthVariables> }>(
  async (c, next) => {
    const authUrl = getNeonAuthUrl();
    const authHeader = c.req.header('Authorization');

    if (!authUrl || !authHeader?.startsWith('Bearer ')) {
      await next();
      return;
    }

    const token = authHeader.slice('Bearer '.length).trim();
    try {
      const { payload } = await jose.jwtVerify(token, getJwks(authUrl), {
        issuer: new URL(authUrl).origin,
      });
      if (payload.sub) {
        c.set('userId', payload.sub);
      }
    } catch {
      // Ignore invalid optional auth
    }

    await next();
  }
);
