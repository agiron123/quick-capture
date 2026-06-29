import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  PlatformColor,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ChatComposer } from '@/components/chat-composer';
import { ChatMessageList } from '@/components/chat-message-list';
import { Text } from '@/components/Themed';
import { useChatConversation } from '@/hooks/use-chat-conversation';

type ChatThreadScreenProps = {
  threadId?: string;
};

export function ChatThreadScreen({ threadId }: ChatThreadScreenProps) {
  const scrollRef = useRef<ScrollView>(null);
  const {
    messages,
    isLoading,
    isStreaming,
    error,
    lastFailedMessage,
    sendMessage,
    setThread,
    resetConversation,
  } = useChatConversation(threadId ?? null);

  useEffect(() => {
    if (threadId) {
      setThread(threadId);
    } else {
      resetConversation();
    }
  }, [threadId, resetConversation, setThread]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = useCallback(
    (text: string) => {
      void sendMessage(text, (newThreadId) => {
        if (!threadId) {
          router.replace(`/chat/${newThreadId}` as Href);
        }
      });
    },
    [sendMessage, threadId]
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled">
        <ChatMessageList messages={messages} isLoading={isLoading} />
        {error ? (
          <View style={styles.errorBox} accessibilityRole="alert">
            <Text style={styles.errorText}>{error}</Text>
            {lastFailedMessage ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retry sending message"
                onPress={() => void sendMessage(lastFailedMessage)}
                disabled={isStreaming}
                style={styles.retryButton}>
                <Text style={styles.retryLabel}>Retry</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
      <ChatComposer onSend={handleSend} disabled={isStreaming} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  errorBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: PlatformColor('systemRed'),
    opacity: 0.15,
  },
  errorText: {
    color: PlatformColor('systemRed'),
    fontWeight: '500',
  },
  retryButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  retryLabel: {
    color: PlatformColor('systemBlue'),
    fontWeight: '600',
  },
});
