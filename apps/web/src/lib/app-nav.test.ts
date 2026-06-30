import { describe, expect, it } from 'vitest';

import { APP_NAV_ITEMS, getActiveAppNavItem } from './app-nav';

describe('app-nav', () => {
  it('matches nested chat routes', () => {
    const chat = APP_NAV_ITEMS.find((item) => item.href === '/chat');
    expect(chat?.match('/chat/thread-1')).toBe(true);
    expect(chat?.match('/capture')).toBe(false);
  });

  it('returns active nav item for pathname', () => {
    expect(getActiveAppNavItem('/chat/thread-1')?.label).toBe('Chat');
    expect(getActiveAppNavItem('/devices')?.label).toBe('Devices');
    expect(getActiveAppNavItem('/unknown')).toBeUndefined();
  });
});
