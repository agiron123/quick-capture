const DEFAULT_THREAD_TITLE = 'New chat';

export function sanitizeChatThreadTitle(
  title: string,
  fallback: string = DEFAULT_THREAD_TITLE
): string {
  const cleaned = title.replace(/^["']|["']$/g, '').trim();
  if (!cleaned) return fallback;
  return cleaned.length > 60 ? `${cleaned.slice(0, 57)}…` : cleaned;
}
