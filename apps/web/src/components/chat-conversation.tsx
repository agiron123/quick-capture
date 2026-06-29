'use client';

import type { ChatMessage } from '@quick-capture/shared';
import { Bot, ListPlus, User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { Marker, MarkerContent } from '@/components/ui/marker';
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from '@/components/ui/message';
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchChatMessages, streamChatMessage } from '@/lib/chat-client';

const SUGGESTED_PROMPTS = [
  'Help me plan my day',
  'Break down a project into todos',
  'How does Quick Capture work?',
];

type ChatConversationProps = {
  threadId: string | null;
  onThreadCreated: (threadId: string) => void;
  onMessageSent?: () => void;
  onAddAsTodos?: (assistantContent: string) => void;
  isExtractingTodos?: boolean;
};

type DisplayMessage = ChatMessage & { streaming?: boolean };

export function ChatConversation({
  threadId,
  onThreadCreated,
  onMessageSent,
  onAddAsTodos,
  isExtractingTodos = false,
}: ChatConversationProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(threadId);
  const streamingAssistantIdRef = useRef<string | null>(null);

  useEffect(() => {
    setActiveThreadId(threadId);
  }, [threadId]);

  useEffect(() => {
    if (!activeThreadId) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setIsLoadingMessages(true);
    setStreamError(null);

    void fetchChatMessages(activeThreadId)
      .then((result) => {
        if (!cancelled) {
          setMessages(result.messages);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setStreamError(error instanceof Error ? error.message : 'Failed to load messages');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingMessages(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeThreadId]);

  const lastUserMessageId = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index]?.role === 'user') {
        return messages[index]?.id;
      }
    }
    return null;
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      setDraft('');
      setStreamError(null);
      setRetryMessage(null);
      setIsStreaming(true);

      const optimisticUser: DisplayMessage = {
        id: `temp-user-${Date.now()}`,
        threadId: activeThreadId ?? 'pending',
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      setMessages((current) => [...current, optimisticUser]);

      try {
        await streamChatMessage(
          { threadId: activeThreadId ?? undefined, message: trimmed },
          (event) => {
            if (event.type === 'thread') {
              if (!activeThreadId) {
                setActiveThreadId(event.threadId);
                onThreadCreated(event.threadId);
              }
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
              streamingAssistantIdRef.current = event.messageId;
              setMessages((current) => [
                ...current,
                {
                  id: event.messageId,
                  threadId: activeThreadId ?? 'pending',
                  role: 'assistant',
                  content: '',
                  createdAt: new Date().toISOString(),
                  streaming: true,
                },
              ]);
              return;
            }

            if (event.type === 'text-delta') {
              const assistantId = streamingAssistantIdRef.current;
              if (!assistantId) return;
              setMessages((current) =>
                current.map((message) =>
                  message.id === assistantId
                    ? { ...message, content: message.content + event.delta }
                    : message
                )
              );
              return;
            }

            if (event.type === 'assistant-end') {
              streamingAssistantIdRef.current = null;
              setMessages((current) =>
                current.map((message) =>
                  message.id === event.message.id
                    ? { ...event.message, streaming: false }
                    : message
                )
              );
              onMessageSent?.();
              return;
            }

            if (event.type === 'error') {
              setStreamError(event.error);
              setRetryMessage(trimmed);
            }
          }
        );
      } catch (error) {
        setStreamError(error instanceof Error ? error.message : 'Failed to send message');
        setRetryMessage(trimmed);
        setMessages((current) => current.filter((message) => message.id !== optimisticUser.id));
      } finally {
        setIsStreaming(false);
        streamingAssistantIdRef.current = null;
      }
    },
    [activeThreadId, isStreaming, onMessageSent, onThreadCreated]
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void sendMessage(draft);
  };

  const showEmptyState = !activeThreadId && messages.length === 0 && !isLoadingMessages;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MessageScrollerProvider autoScroll defaultScrollPosition="last-anchor">
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport aria-label="Chat messages">
            <MessageScrollerContent className="px-4 py-6">
              {isLoadingMessages ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-2/3" />
                  <Skeleton className="ml-auto h-12 w-1/2" />
                </div>
              ) : null}

              {showEmptyState ? (
                <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
                  <div>
                    <h2 className="text-lg font-medium">How can I help you today?</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Chat with the Quick Capture assistant powered by MiniMax.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <Button
                        key={prompt}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void sendMessage(prompt)}
                        disabled={isStreaming}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}

              {messages.map((message) => (
                <MessageScrollerItem
                  key={message.id}
                  messageId={message.id}
                  scrollAnchor={message.id === lastUserMessageId || message.streaming}
                >
                  <Message align={message.role === 'user' ? 'end' : 'start'}>
                    <MessageAvatar className="size-8" aria-hidden>
                      {message.role === 'user' ? (
                        <User className="size-4" aria-hidden />
                      ) : (
                        <Bot className="size-4" aria-hidden />
                      )}
                    </MessageAvatar>
                    <MessageContent>
                      <MessageHeader>
                        {message.role === 'user' ? 'You' : 'Assistant'}
                      </MessageHeader>
                      <Bubble
                        variant={message.role === 'user' ? 'default' : 'secondary'}
                        align={message.role === 'user' ? 'end' : 'start'}
                      >
                        <BubbleContent>
                          <span
                            className="whitespace-pre-wrap"
                            aria-live={message.streaming ? 'polite' : undefined}
                            aria-busy={message.streaming && !message.content ? true : undefined}
                          >
                            {message.content}
                            {message.streaming && !message.content ? (
                              <span className="shimmer motion-reduce:animate-none text-muted-foreground">
                                Thinking…
                              </span>
                            ) : null}
                          </span>
                        </BubbleContent>
                      </Bubble>
                      {message.role === 'assistant' &&
                      !message.streaming &&
                      message.content.trim() &&
                      onAddAsTodos ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-1 h-8 px-2 text-muted-foreground"
                          disabled={isExtractingTodos || isStreaming}
                          onClick={() => onAddAsTodos(message.content)}
                        >
                          <ListPlus className="mr-1 size-4" aria-hidden />
                          Add as todos
                        </Button>
                      ) : null}
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              ))}

              {streamError ? (
                <MessageScrollerItem messageId="stream-error">
                  <Marker variant="border" role="alert">
                    <MarkerContent>{streamError}</MarkerContent>
                    {retryMessage ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="ml-auto shrink-0"
                        onClick={() => void sendMessage(retryMessage)}
                        disabled={isStreaming}
                      >
                        Retry
                      </Button>
                    ) : null}
                  </Marker>
                </MessageScrollerItem>
              ) : null}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton direction="end" />
        </MessageScroller>
      </MessageScrollerProvider>

      <form
        onSubmit={handleSubmit}
        className="border-t bg-background p-4"
        aria-label="Send a chat message"
      >
        <div className="mx-auto flex max-w-3xl gap-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void sendMessage(draft);
              }
            }}
            placeholder="Message the assistant…"
            aria-label="Message the assistant"
            rows={2}
            disabled={isStreaming}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[44px] flex-1 resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button
            type="submit"
            disabled={isStreaming || !draft.trim()}
            aria-busy={isStreaming}
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
