import { type Href, router } from 'expo-router';
import { AppState, NativeModules, Platform } from 'react-native';

type WearCaptureBridgeModule = {
  getPendingCapture: () => Promise<string | null>;
  clearPendingCapture: () => Promise<void>;
};

const WearCaptureBridge = NativeModules.WearCaptureBridge as WearCaptureBridgeModule | undefined;

export function initWearCaptureBridge(): () => void {
  if (Platform.OS !== 'android' || !WearCaptureBridge) return () => {};

  const handlePendingCapture = async () => {
    try {
      const pending = await WearCaptureBridge.getPendingCapture();
      if (pending === 'voice') {
        await WearCaptureBridge.clearPendingCapture();
        router.push('/voice-record' as Href);
      }
    } catch (error) {
      console.warn('Wear capture bridge failed to read pending capture', error);
    }
  };

  void handlePendingCapture();

  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') void handlePendingCapture();
  });

  return () => subscription.remove();
}
