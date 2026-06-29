import type { ChatMessage } from '@quick-capture/shared';
import { ActivityIndicator, PlatformColor, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';

type ChatMessageListProps = {
  messages: (ChatMessage & { streaming?: boolean })[];
  isLoading?: boolean;
  onAddAsTodos?: (assistantContent: string) => void;
  isExtractingTodos?: boolean;
};

export function ChatMessageList({
  messages,
  isLoading,
  onAddAsTodos,
  isExtractingTodos = false,
}: ChatMessageListProps) {
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (messages.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>How can I help you today?</Text>
        <Text style={styles.emptySubtitle}>
          Chat with the Quick Capture assistant powered by MiniMax.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {messages.map((message) => {
        const isUser = message.role === 'user';
        return (
          <View
            key={message.id}
            style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${isUser ? 'You' : 'Assistant'}: ${message.content || (message.streaming ? 'Thinking' : '')}`}
          >
            <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
              <Text
                style={[styles.label, isUser ? styles.labelUser : styles.labelAssistant]}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                {isUser ? 'You' : 'Assistant'}
              </Text>
              <Text
                style={[styles.content, isUser ? styles.contentUser : styles.contentAssistant]}
                accessibilityElementsHidden
                importantForAccessibility="no"
              >
                {message.content}
                {message.streaming && !message.content ? 'Thinking…' : ''}
              </Text>
            </View>
            {!isUser && !message.streaming && message.content.trim() && onAddAsTodos ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add assistant message as todos"
                disabled={isExtractingTodos}
                onPress={() => onAddAsTodos(message.content)}
                style={styles.addTodosButton}>
                <Text style={styles.addTodosLabel}>Add as todos</Text>
              </Pressable>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
    padding: 16,
  },
  row: {
    width: '100%',
  },
  rowUser: {
    alignItems: 'flex-end',
  },
  rowAssistant: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  bubbleUser: {
    backgroundColor: PlatformColor('systemBlue'),
  },
  bubbleAssistant: {
    backgroundColor: PlatformColor('secondarySystemBackground'),
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.8,
  },
  labelUser: {
    color: '#fff',
  },
  labelAssistant: {
    color: PlatformColor('secondaryLabel'),
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
  },
  contentUser: {
    color: '#fff',
  },
  contentAssistant: {
    color: PlatformColor('label'),
  },
  addTodosButton: {
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  addTodosLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: PlatformColor('systemBlue'),
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    opacity: 0.7,
    textAlign: 'center',
  },
});
