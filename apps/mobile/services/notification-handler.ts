import * as Notifications from 'expo-notifications';

import { configureNotificationHandler } from '@/services/reminder-scheduler';

let initialized = false;

export function initNotificationHandlers(): void {
  if (initialized) return;
  initialized = true;

  configureNotificationHandler();

  Notifications.addNotificationResponseReceivedListener((response) => {
    const todoId = response.notification.request.content.data?.todoId;
    if (typeof todoId === 'string') {
      // Deep link routing can be added in Phase B.
      console.log('Notification tapped for todo:', todoId);
    }
  });
}
