'use client';

import { useEffect, useRef } from 'react';

import { registerDevice } from '@/lib/api-client-client';
import { getDeviceName, isWebPushSupported, subscribeToWebPush } from '@/lib/push-notifications';

export function PushRegistration() {
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) return;
    if (!isWebPushSupported()) return;

    attemptedRef.current = true;

    void (async () => {
      try {
        const subscription = await subscribeToWebPush();
        if (!subscription) return;

        await registerDevice({
          platform: 'web',
          pushProvider: 'web-push',
          pushToken: JSON.stringify(subscription.toJSON()),
          deviceName: getDeviceName(),
        });
      } catch (error) {
        console.warn('Web push registration failed:', error);
      }
    })();
  }, []);

  return null;
}
