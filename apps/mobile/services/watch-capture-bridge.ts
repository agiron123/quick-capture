import { ExtensionStorage } from '@bacons/apple-targets';
import { type Href, router } from 'expo-router';
import { AppState, Platform } from 'react-native';

import { IOS_APP_GROUP, WATCH_PENDING_CAPTURE_KEY } from '@/constants/app-group';

export function initWatchCaptureBridge(): () => void {
  if (Platform.OS !== 'ios') return () => {};

  const storage = new ExtensionStorage(IOS_APP_GROUP);

  const handlePendingCapture = () => {
    const pending = storage.get(WATCH_PENDING_CAPTURE_KEY);
    if (pending === 'voice') {
      storage.remove(WATCH_PENDING_CAPTURE_KEY);
      router.push({ pathname: '/voice-record', params: { origin: 'watch' } } as Href);
    }
  };

  handlePendingCapture();

  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') handlePendingCapture();
  });

  return () => subscription.remove();
}
