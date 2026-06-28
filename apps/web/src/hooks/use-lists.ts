'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { createList, deleteList, fetchLists, renameList } from '@/lib/api-client-client';

const DEFAULT_LIST_ID = 'list-inbox';
const ACTIVE_LIST_KEY = 'active_list_id';

export function useLists() {
  const queryClient = useQueryClient();
  const [activeListId, setActiveListIdState] = useState(DEFAULT_LIST_ID);

  useEffect(() => {
    const stored = localStorage.getItem(ACTIVE_LIST_KEY);
    if (stored) setActiveListIdState(stored);
  }, []);

  const listsQuery = useQuery({
    queryKey: ['lists'],
    queryFn: fetchLists,
  });

  const setActiveListId = useCallback((listId: string) => {
    localStorage.setItem(ACTIVE_LIST_KEY, listId);
    setActiveListIdState(listId);
  }, []);

  const createListMutation = useMutation({
    mutationFn: createList,
    onSuccess: (list) => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      setActiveListId(list.id);
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: deleteList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const renameListMutation = useMutation({
    mutationFn: ({ listId, name }: { listId: string; name: string }) => renameList(listId, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists'] }),
  });

  return {
    lists: listsQuery.data ?? [],
    activeListId,
    setActiveListId,
    isLoading: listsQuery.isLoading,
    createList: createListMutation.mutateAsync,
    deleteList: deleteListMutation.mutateAsync,
    renameList: renameListMutation.mutateAsync,
  };
}
