'use client';

import { createAuthClient } from '@neondatabase/auth/next';

const authUrl =
  process.env.NEXT_PUBLIC_NEON_AUTH_URL?.trim() ??
  process.env.NEXT_PUBLIC_NEON_AUTH_BASE_URL?.trim() ??
  '';

export const authClient = authUrl ? createAuthClient() : null;

export function isAuthClientConfigured(): boolean {
  return Boolean(authUrl);
}
