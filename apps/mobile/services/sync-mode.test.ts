import { describe, expect, it } from 'vitest';

import { isServerRemindersEnabled, setServerRemindersEnabled } from './sync-mode';

describe('sync-mode', () => {
  it('tracks server reminders flag', () => {
    setServerRemindersEnabled(true);
    expect(isServerRemindersEnabled()).toBe(true);
    setServerRemindersEnabled(false);
    expect(isServerRemindersEnabled()).toBe(false);
  });
});
