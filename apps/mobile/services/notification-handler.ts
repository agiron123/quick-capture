import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

import { configureNotificationHandler } from '@/services/reminder-scheduler';
import { setNotificationTarget } from '@/services/notification-target';

let initialized = false;

export function initNotificationHandlers(): void {
  if (initialized) return;
  initialized = true;

  configureNotificationHandler();

  Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    const todoId = data?.todoId;
    if (typeof todoId !== 'string') return;

    setNotificationTarget({
      todoId,
      listId: typeof data?.listId === 'string' ? data.listId : undefined,
    });
    router.push('/(tabs)');
  });
}
