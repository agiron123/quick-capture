import { router } from 'expo-router';
import { Pressable } from 'react-native';

import { Text } from '@/components/Themed';
import { useAuth } from '@/contexts/auth-provider';

export function AccountHeaderButton() {
  const { session, isConfigured, signOut } = useAuth();

  if (!isConfigured) return null;

  if (session) {
    return (
      <Pressable
        onPress={() => {
          void signOut();
        }}
        style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
        <Text style={{ fontSize: 15, color: '#007AFF' }}>Sign out</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => router.push('/sign-in')}
      style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
      <Text style={{ fontSize: 15, color: '#007AFF' }}>Sign in</Text>
    </Pressable>
  );
}
