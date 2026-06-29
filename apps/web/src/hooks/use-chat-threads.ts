'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createChatThread,
  deleteChatThread,
  fetchChatThreads,
  updateChatThread,
} from '@/lib/chat-client';

export function useChatThreads() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['chat-threads'],
    queryFn: fetchChatThreads,
  });

  const createMutation = useMutation({
    mutationFn: createChatThread,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['chat-threads'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ threadId, title }: { threadId: string; title: string }) =>
      updateChatThread(threadId, { title }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['chat-threads'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteChatThread,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['chat-threads'] });
    },
  });

  return {
    threads: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createThread: createMutation.mutateAsync,
    updateThread: updateMutation.mutateAsync,
    deleteThread: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
