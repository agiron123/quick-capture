'use client';

import { Monitor, Smartphone, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { deleteDevice, fetchDevices, type UserDeviceRecord } from '@/lib/api-client-client';

function platformLabel(device: UserDeviceRecord): string {
  if (device.deviceName) return device.deviceName;
  if (device.platform === 'web') return 'Web browser';
  if (device.platform === 'ios') return 'iPhone / iPad';
  return 'Android';
}

function PlatformIcon({ platform }: { platform: UserDeviceRecord['platform'] }) {
  if (platform === 'web') return <Monitor className="size-5" />;
  return <Smartphone className="size-5" />;
}

export function DevicesPageClient() {
  const [devices, setDevices] = useState<UserDeviceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const loadDevices = useCallback(async () => {
    setIsLoading(true);
    try {
      setDevices(await fetchDevices());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load devices');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDevices();
  }, [loadDevices]);

  async function handleRevoke(deviceId: string) {
    setRevokingId(deviceId);
    try {
      await deleteDevice(deviceId);
      setDevices((current) => current.filter((device) => device.id !== deviceId));
      toast.success('Device removed');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove device');
    } finally {
      setRevokingId(null);
    }
  }

  return (
    <AppShell showMicFab={false}>
      <div className="mx-auto w-full max-w-lg p-4">
        <Card>
          <CardHeader>
            <CardTitle>Signed-in devices</CardTitle>
            <CardDescription>
              Reminders are sent to every active device. Remove devices you no longer use.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </>
            ) : devices.length === 0 ? (
              <p className="text-muted-foreground text-sm">No devices registered yet.</p>
            ) : (
              devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between gap-3 rounded-lg border px-3 py-3">
                  <div className="flex items-center gap-3">
                    <PlatformIcon platform={device.platform} />
                    <div>
                      <p className="font-medium">{platformLabel(device)}</p>
                      <p className="text-muted-foreground text-xs">
                        Last seen {new Date(device.lastSeenAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove device"
                    disabled={revokingId === device.id}
                    onClick={() => void handleRevoke(device.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
