import { createNeonAuth } from '@neondatabase/auth/next/server';

function getAuthConfig() {
  const baseUrl = process.env.NEON_AUTH_BASE_URL?.trim() ?? process.env.NEON_AUTH_URL?.trim();
  const secret = process.env.NEON_AUTH_COOKIE_SECRET?.trim();

  if (!baseUrl || !secret) {
    return null;
  }

  return { baseUrl, secret };
}

const config = getAuthConfig();

export const auth = config
  ? createNeonAuth({
      baseUrl: config.baseUrl,
      cookies: {
        secret: config.secret,
        // lax: OAuth return navigations + localhost HTTPS dev (Secure cookies)
        sameSite: 'lax',
      },
    })
  : null;

export function isNeonAuthConfigured(): boolean {
  return auth !== null;
}
