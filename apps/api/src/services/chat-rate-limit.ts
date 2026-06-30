import { getChatRateLimitPerHour } from '../ai/config.js';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

export function resetChatRateLimitForTests(): void {
  buckets.clear();
}

export function checkChatRateLimit(userId: string): { allowed: true } | { allowed: false; retryAfterSec: number } {
  const limit = getChatRateLimitPerHour();
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;

  let entry = buckets.get(userId);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowMs };
    buckets.set(userId, entry);
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count += 1;
  return { allowed: true };
}
