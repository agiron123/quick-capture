'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { createList, fetchLists } from '@/lib/api-client-client';

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

  return {
    lists: listsQuery.data ?? [],
    activeListId,
    setActiveListId,
    isLoading: listsQuery.isLoading,
    createList: createListMutation.mutateAsync,
  };
}
