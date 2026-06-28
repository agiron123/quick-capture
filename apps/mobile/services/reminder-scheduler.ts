import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { REMINDER_CHANNEL_ID } from '@/constants/reminders';
import { isServerRemindersEnabled } from '@/services/sync-mode';
import type { Todo } from '@/types/todo';

export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Todo reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
}

export async function cancelReminder(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Notification may already have fired or been cleared.
  }
}

export async function scheduleReminder(todo: Todo): Promise<string | null> {
  if (isServerRemindersEnabled()) return null;
  if (!todo.reminderAt || todo.completed) return null;

  const triggerDate = new Date(todo.reminderAt);
  if (triggerDate.getTime() <= Date.now()) return null;

  const granted = await ensureNotificationPermissions();
  if (!granted) return null;

  await ensureAndroidChannel();

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Todo reminder',
      body: todo.title,
      data: { todoId: todo.id, listId: todo.listId },
      ...(Platform.OS === 'android' ? { channelId: REMINDER_CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}

export async function rescheduleReminder(todo: Todo): Promise<string | null> {
  if (todo.notificationId) {
    await cancelReminder(todo.notificationId);
  }
  return scheduleReminder(todo);
}

export async function reconcileAllReminders(
  todos: Todo[],
  onNotificationIdUpdated: (todoId: string, notificationId: string | null) => Promise<void>
): Promise<void> {
  if (isServerRemindersEnabled()) return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
  }

  for (const todo of todos) {
    if (!todo.reminderAt || todo.completed) {
      if (todo.notificationId) {
        await onNotificationIdUpdated(todo.id, null);
      }
      continue;
    }

    const notificationId = await scheduleReminder(todo);
    if (notificationId !== (todo.notificationId ?? null)) {
      await onNotificationIdUpdated(todo.id, notificationId);
    }
  }
}

export async function clearAllLocalReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
  }
}
