import { createAuthClient } from '@neondatabase/auth';

function getAuthUrl(): string | null {
  const url = process.env.EXPO_PUBLIC_NEON_AUTH_URL?.trim();
  return url || null;
}

export const authClient = (() => {
  const url = getAuthUrl();
  return url ? createAuthClient(url) : null;
})();

export function isAuthConfigured(): boolean {
  return Boolean(authClient);
}

export async function getAccessToken(): Promise<string | null> {
  if (!authClient) return null;
  const result = await authClient.getSession();
  return result.data?.session?.token ?? null;
}
