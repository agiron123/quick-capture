import type { ChatThread } from '@quick-capture/shared';
import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  PlatformColor,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { Text } from '@/components/Themed';
import { useAuth } from '@/contexts/auth-provider';
import { deleteChatThread, fetchChatThreads } from '@/services/chat-api-client';

export default function ChatTabScreen() {
  const { session, isLoading: authLoading, isConfigured } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadThreads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchChatThreads();
      setThreads(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      void loadThreads();
    } else {
      setThreads([]);
    }
  }, [session, loadThreads]);

  if (!isConfigured) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Chat unavailable</Text>
        <Text style={styles.subtitle}>Set EXPO_PUBLIC_NEON_AUTH_URL to enable chat.</Text>
      </View>
    );
  }

  if (authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Sign in to chat</Text>
        <Text style={styles.subtitle}>
          Chat history syncs across devices when you are signed in.
        </Text>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/sign-in' as Href)}>
          <Text style={styles.primaryButtonText}>Sign in</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push('/chat/new' as Href)}>
          <Text style={styles.primaryButtonText}>New chat</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => void loadThreads()}>
            <Text style={styles.linkText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={threads}
          keyExtractor={(item) => item.id}
          contentInsetAdjustmentBehavior="automatic"
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.subtitle}>No chats yet. Start a new conversation.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.threadRow}
              onPress={() => router.push(`/chat/${item.id}` as Href)}
              onLongPress={() => {
                Alert.alert(item.title, undefined, [
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                      void deleteChatThread(item.id)
                        .then(() => loadThreads())
                        .catch((deleteError) => {
                          Alert.alert(
                            'Delete failed',
                            deleteError instanceof Error ? deleteError.message : 'Try again.'
                          );
                        });
                    },
                  },
                  { text: 'Cancel', style: 'cancel' },
                ]);
              }}>
              <Text style={styles.threadTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PlatformColor('separator'),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.7,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: PlatformColor('systemBlue'),
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  threadRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PlatformColor('separator'),
  },
  threadTitle: {
    fontSize: 16,
  },
  errorText: {
    color: PlatformColor('systemRed'),
    textAlign: 'center',
  },
  linkText: {
    color: PlatformColor('systemBlue'),
    fontWeight: '600',
  },
});
