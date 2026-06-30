import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestTodo } from '@quick-capture/shared/test-fixtures';

const {
  scheduleNotificationAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  isServerRemindersEnabled,
} = vi.hoisted(() => ({
  scheduleNotificationAsync: vi.fn(),
  getPermissionsAsync: vi.fn(),
  requestPermissionsAsync: vi.fn(),
  isServerRemindersEnabled: vi.fn(() => false),
}));

vi.mock('expo-notifications', () => ({
  setNotificationHandler: vi.fn(),
  getPermissionsAsync,
  requestPermissionsAsync,
  scheduleNotificationAsync,
  cancelScheduledNotificationAsync: vi.fn(),
  getAllScheduledNotificationsAsync: vi.fn().mockResolvedValue([]),
  SchedulableTriggerInputTypes: { DATE: 'date' },
  AndroidImportance: { HIGH: 4 },
}));

vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

vi.mock('@/services/sync-mode', () => ({
  isServerRemindersEnabled,
}));

import { scheduleReminder } from '@/services/reminder-scheduler';

describe('scheduleReminder', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T12:00:00.000Z'));
    isServerRemindersEnabled.mockReturnValue(false);
    getPermissionsAsync.mockResolvedValue({ granted: true });
    requestPermissionsAsync.mockResolvedValue({ granted: true });
    scheduleNotificationAsync.mockResolvedValue('notification-1');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('returns null when server reminders are enabled', async () => {
    isServerRemindersEnabled.mockReturnValue(true);
    const result = await scheduleReminder(
      createTestTodo({ reminderAt: '2026-06-15T18:00:00.000Z' })
    );
    expect(result).toBeNull();
    expect(scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('returns null for completed todos', async () => {
    const result = await scheduleReminder(
      createTestTodo({ completed: true, reminderAt: '2026-06-15T18:00:00.000Z' })
    );
    expect(result).toBeNull();
  });

  it('returns null for past reminder times', async () => {
    const result = await scheduleReminder(
      createTestTodo({ reminderAt: '2026-06-15T08:00:00.000Z' })
    );
    expect(result).toBeNull();
  });

  it('returns null when notification permission is denied', async () => {
    getPermissionsAsync.mockResolvedValue({ granted: false });
    requestPermissionsAsync.mockResolvedValue({ granted: false });

    const result = await scheduleReminder(
      createTestTodo({ reminderAt: '2026-06-15T18:00:00.000Z' })
    );
    expect(result).toBeNull();
  });

  it('schedules a future reminder and returns notification id', async () => {
    const todo = createTestTodo({
      id: 'todo-1',
      listId: 'inbox',
      title: 'Buy milk',
      reminderAt: '2026-06-15T18:00:00.000Z',
    });

    const result = await scheduleReminder(todo);
    expect(result).toBe('notification-1');
    expect(scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: 'Todo reminder',
          body: 'Buy milk',
          data: { todoId: 'todo-1', listId: 'inbox' },
        }),
      })
    );
  });
});
