import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { extractTodosFromTranscript } from '@/services/ai-extract-todos-from-text';

type ChatThreadScreenProps = {
  threadId?: string;
};

export function ChatThreadScreen({ threadId }: ChatThreadScreenProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [isExtractingTodos, setIsExtractingTodos] = useState(false);
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

  const handleAddAsTodos = useCallback(async (assistantContent: string) => {
    setIsExtractingTodos(true);
    try {
      const todos = await extractTodosFromTranscript(assistantContent);
      router.push({
        pathname: '/review-todos',
        params: {
          source: 'manual',
          todos: JSON.stringify(todos),
        },
      });
      if (todos.length === 0) {
        Alert.alert('No todos extracted', 'Edit lines manually before saving.');
      }
    } catch (extractError) {
      Alert.alert(
        'Could not extract todos',
        extractError instanceof Error ? extractError.message : 'Something went wrong'
      );
    } finally {
      setIsExtractingTodos(false);
    }
  }, []);

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
        <ChatMessageList
          messages={messages}
          isLoading={isLoading}
          onAddAsTodos={(content) => void handleAddAsTodos(content)}
          isExtractingTodos={isExtractingTodos}
        />
        {isExtractingTodos ? (
          <View style={styles.extractingRow}>
            <ActivityIndicator size="small" />
            <Text style={styles.extractingText}>Extracting todos…</Text>
          </View>
        ) : null}
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
  extractingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  extractingText: {
    fontSize: 14,
    color: PlatformColor('secondaryLabel'),
  },
});
