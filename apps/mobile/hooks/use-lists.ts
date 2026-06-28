import { useCallback, useMemo, useSyncExternalStore } from 'react';

import type { TodoListRecord } from '@/types/list';
import {
    createListInStore,
    deleteListFromStore,
    getActiveListIdSnapshot,
    getActiveListSnapshot,
    getListsSnapshot,
    renameListInStore,
    setActiveListInStore,
    subscribeLists,
} from '@/utils/list-store';
import { refreshTodosFromDb } from '@/utils/todo-store';

export function useLists(): {
  lists: TodoListRecord[];
  activeList: TodoListRecord | undefined;
  activeListId: string;
  setActiveList: (listId: string) => void;
  createList: (name: string) => Promise<TodoListRecord>;
  renameList: (listId: string, name: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
} {
  const lists = useSyncExternalStore(subscribeLists, getListsSnapshot, getListsSnapshot);
  const activeListId = useSyncExternalStore(
    subscribeLists,
    getActiveListIdSnapshot,
    getActiveListIdSnapshot
  );

  const activeList = useMemo(
    () => lists.find((list) => list.id === activeListId) ?? getActiveListSnapshot(),
    [lists, activeListId]
  );

  const setActiveList = useCallback((listId: string) => {
    void setActiveListInStore(listId);
  }, []);

  const createList = useCallback(async (name: string) => createListInStore(name), []);

  const renameList = useCallback(
    async (listId: string, name: string) => renameListInStore(listId, name),
    []
  );

  const deleteList = useCallback(async (listId: string) => {
    await deleteListFromStore(listId);
    await refreshTodosFromDb();
  }, []);

  return {
    lists,
    activeList,
    activeListId,
    setActiveList,
    createList,
    renameList,
    deleteList,
  };
}

export function useActiveListId(): string {
  return useSyncExternalStore(subscribeLists, getActiveListIdSnapshot, getActiveListIdSnapshot);
}
