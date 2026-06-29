'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { AppShell } from '@/components/app-shell';
import { ChatConversation } from '@/components/chat-conversation';
import { ChatThreadSidebar } from '@/components/chat-thread-sidebar';
import { ReviewTodosDialog, type ReviewSavePayload } from '@/components/review-todos-dialog';
import { useChatThreads } from '@/hooks/use-chat-threads';
import { useLists } from '@/hooks/use-lists';
import { useTodos } from '@/hooks/use-todos';
import { extractTodosFromTranscript } from '@/lib/ai-client';
import { createTodosBatch } from '@/lib/api-client-client';

type ChatPageClientProps = {
  threadId?: string | null;
};

export function ChatPageClient({ threadId = null }: ChatPageClientProps) {
  const router = useRouter();
  const { refetch } = useChatThreads();
  const { activeListId } = useLists();
  const { refetch: refetchTodos } = useTodos(activeListId);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTitles, setReviewTitles] = useState<string[]>([]);
  const [isExtractingTodos, setIsExtractingTodos] = useState(false);

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

  const handleAddAsTodos = useCallback(async (assistantContent: string) => {
    setIsExtractingTodos(true);
    try {
      const todos = await extractTodosFromTranscript(assistantContent);
      setReviewTitles(todos.map((todo) => todo.title));
      setReviewOpen(true);
      if (todos.length === 0) {
        toast.message('No todos extracted — edit lines manually before saving.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not extract todos');
    } finally {
      setIsExtractingTodos(false);
    }
  }, []);

  const handleSaveReview = useCallback(
    async (payload: ReviewSavePayload) => {
      await createTodosBatch(
        activeListId,
        payload.titles.map((title) => ({
          title,
          source: 'manual',
        }))
      );
      await refetchTodos();
      toast.success('Todos saved');
    },
    [activeListId, refetchTodos]
  );

  return (
    <AppShell showMicFab={false}>
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col md:flex-row">
        <ChatThreadSidebar activeThreadId={threadId} onNewChat={handleNewChat} />
        <ChatConversation
          threadId={threadId}
          onThreadCreated={handleThreadCreated}
          onMessageSent={handleMessageSent}
          onAddAsTodos={(content) => void handleAddAsTodos(content)}
          isExtractingTodos={isExtractingTodos}
        />
      </div>

      <ReviewTodosDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        source="manual"
        initialTitles={reviewTitles}
        onSave={handleSaveReview}
      />
    </AppShell>
  );
}
