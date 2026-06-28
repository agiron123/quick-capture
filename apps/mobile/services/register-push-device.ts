import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { isAuthConfigured } from '@/services/auth-client';
import { ensureNotificationPermissions } from '@/services/reminder-scheduler';
import { registerDeviceOnApi } from '@/services/sync-api-client';

export async function registerExpoPushDevice(): Promise<void> {
  if (!isAuthConfigured()) return;

  const granted = await ensureNotificationPermissions();
  if (!granted) return;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.projectId;

  if (!projectId) {
    console.warn('Expo push token skipped: missing EAS projectId');
    return;
  }

  const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId });
  const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';

  await registerDeviceOnApi({
    platform,
    pushProvider: 'expo',
    pushToken: tokenResult.data,
    deviceName: `${Platform.OS} device`,
  });
}
