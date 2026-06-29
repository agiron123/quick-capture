import type { ChatMessage } from '@quick-capture/shared';
import { useCallback, useState } from 'react';

import {
  fetchChatMessages,
  streamChatMessage,
} from '@/services/chat-api-client';

type DisplayMessage = ChatMessage & { streaming?: boolean };

export function useChatConversation(threadId: string | null) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(threadId);

  const loadMessages = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchChatMessages(id);
      setMessages(result.messages);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (text: string, onThreadCreated?: (threadId: string) => void) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return null;

      setError(null);
      setLastFailedMessage(null);
      setIsStreaming(true);

      const optimisticUser: DisplayMessage = {
        id: `temp-user-${Date.now()}`,
        threadId: activeThreadId ?? 'pending',
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      setMessages((current) => [...current, optimisticUser]);

      let resolvedThreadId = activeThreadId;
      let streamingAssistantId: string | null = null;

      try {
        await streamChatMessage(
          { threadId: activeThreadId ?? undefined, message: trimmed },
          (event) => {
            if (event.type === 'thread') {
              resolvedThreadId = event.threadId;
              setActiveThreadId(event.threadId);
              onThreadCreated?.(event.threadId);
              return;
            }

            if (event.type === 'user-message') {
              setMessages((current) =>
                current.map((message) =>
                  message.id === optimisticUser.id ? event.message : message
                )
              );
              return;
            }

            if (event.type === 'assistant-start') {
              streamingAssistantId = event.messageId;
              setMessages((current) => [
                ...current,
                {
                  id: event.messageId,
                  threadId: resolvedThreadId ?? 'pending',
                  role: 'assistant',
                  content: '',
                  createdAt: new Date().toISOString(),
                  streaming: true,
                },
              ]);
              return;
            }

            if (event.type === 'text-delta') {
              if (!streamingAssistantId) return;
              setMessages((current) =>
                current.map((message) =>
                  message.id === streamingAssistantId
                    ? { ...message, content: message.content + event.delta }
                    : message
                )
              );
              return;
            }

            if (event.type === 'assistant-end') {
              streamingAssistantId = null;
              setMessages((current) =>
                current.map((message) =>
                  message.id === event.message.id
                    ? { ...event.message, streaming: false }
                    : message
                )
              );
              return;
            }

            if (event.type === 'error') {
              setError(event.error);
              setLastFailedMessage(trimmed);
            }
          }
        );
      } catch (sendError) {
        setError(sendError instanceof Error ? sendError.message : 'Failed to send message');
        setLastFailedMessage(trimmed);
        setMessages((current) => current.filter((message) => message.id !== optimisticUser.id));
      } finally {
        setIsStreaming(false);
      }

      return resolvedThreadId;
    },
    [activeThreadId, isStreaming]
  );

  const resetConversation = useCallback(() => {
    setActiveThreadId(null);
    setMessages([]);
    setError(null);
  }, []);

  const setThread = useCallback(
    (id: string | null) => {
      setActiveThreadId(id);
      if (id) {
        void loadMessages(id);
      } else {
        setMessages([]);
      }
    },
    [loadMessages]
  );

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    lastFailedMessage,
    activeThreadId,
    sendMessage,
    resetConversation,
    setThread,
    loadMessages,
  };
}
