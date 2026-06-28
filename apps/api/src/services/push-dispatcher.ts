import type { Todo } from '@quick-capture/shared';
import type { userDevices } from '../db/schema.js';

type UserDeviceRow = typeof userDevices.$inferSelect;

export type ReminderPayload = {
  title: string;
  body: string;
  data: {
    todoId: string;
    listId: string;
  };
};

export async function sendExpoPush(
  tokens: string[],
  payload: ReminderPayload
): Promise<void> {
  if (tokens.length === 0) return;

  const messages = tokens.map((token) => ({
    to: token,
    sound: 'default',
    title: payload.title,
    body: payload.body,
    data: payload.data,
  }));

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const accessToken = process.env.EXPO_ACCESS_TOKEN?.trim();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers,
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Expo push failed:', text);
  }
}

export async function sendWebPush(
  subscriptions: string[],
  payload: ReminderPayload
): Promise<void> {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim() ?? 'mailto:support@quick-capture.local';

  if (!publicKey || !privateKey) {
    console.warn('Web Push skipped: VAPID keys not configured');
    return;
  }

  const webpush = await import('web-push');
  webpush.setVapidDetails(subject, publicKey, privateKey);

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    data: payload.data,
  });

  await Promise.allSettled(
    subscriptions.map(async (token) => {
      try {
        const subscription = JSON.parse(token) as import('web-push').PushSubscription;
        await webpush.sendNotification(subscription, body);
      } catch (error) {
        console.error('Web push failed:', error);
      }
    })
  );
}

export async function dispatchReminder(
  todo: Pick<Todo, 'id' | 'title' | 'listId'>,
  devices: UserDeviceRow[]
): Promise<void> {
  const payload: ReminderPayload = {
    title: 'Todo reminder',
    body: todo.title,
    data: { todoId: todo.id, listId: todo.listId },
  };

  const expoTokens = devices
    .filter((device) => device.pushProvider === 'expo')
    .map((device) => device.pushToken);

  const webTokens = devices
    .filter((device) => device.pushProvider === 'web-push')
    .map((device) => device.pushToken);

  await Promise.all([sendExpoPush(expoTokens, payload), sendWebPush(webTokens, payload)]);
}
