import * as QuickActions from 'expo-quick-actions';
import type { RouterAction } from 'expo-quick-actions/router';
import { Platform } from 'react-native';

const CAPTURE_SHORTCUTS: RouterAction[] = [
  {
    id: 'voice',
    title: 'Record voice',
    subtitle: 'Speak todos to capture',
    icon: Platform.OS === 'ios' ? 'symbol:mic.fill' : 'audio',
    params: { href: '/voice-record' },
  },
  {
    id: 'camera',
    title: 'Scan note',
    subtitle: 'Photo to todos',
    icon: Platform.OS === 'ios' ? 'symbol:camera.fill' : 'capturePhoto',
    params: { href: '/capture' },
  },
  {
    id: 'add-todo',
    title: 'Add todo',
    subtitle: 'Quick manual entry',
    icon: Platform.OS === 'ios' ? 'symbol:plus.circle.fill' : 'add',
    params: { href: '/add-todo' },
  },
];

export async function configureCaptureQuickActions(): Promise<void> {
  const supported = await QuickActions.isSupported();
  if (!supported) return;

  await QuickActions.setItems(CAPTURE_SHORTCUTS);
}
