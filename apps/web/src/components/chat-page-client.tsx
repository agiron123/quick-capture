'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { AppShell } from '@/components/app-shell';
import { ChatConversation } from '@/components/chat-conversation';
import { ChatThreadSidebar } from '@/components/chat-thread-sidebar';
import { useChatThreads } from '@/hooks/use-chat-threads';

type ChatPageClientProps = {
  threadId?: string | null;
};

export function ChatPageClient({ threadId = null }: ChatPageClientProps) {
  const router = useRouter();
  const { refetch } = useChatThreads();

  const handleNewChat = useCallback(() => {
    router.push('/chat');
  }, [router]);

  const handleThreadCreated = useCallback(
    (newThreadId: string) => {
      router.replace(`/chat/${newThreadId}`);
    },
    [router]
  );

  const handleMessageSent = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <AppShell showMicFab={false}>
      <div className="flex min-h-[calc(100dvh-8rem)] flex-col md:flex-row">
        <ChatThreadSidebar activeThreadId={threadId} onNewChat={handleNewChat} />
        <ChatConversation
          threadId={threadId}
          onThreadCreated={handleThreadCreated}
          onMessageSent={handleMessageSent}
        />
      </div>
    </AppShell>
  );
}
