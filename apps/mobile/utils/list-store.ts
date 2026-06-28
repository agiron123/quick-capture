import { ACTIVE_LIST_SETTING_KEY, DEFAULT_LIST_ID } from '@/constants/lists';
import type { TodoListRecord } from '@/types/list';
import { getSetting, setSetting } from '@/utils/db';
import * as listRepository from '@/utils/list-repository';

type Listener = () => void;

let listsCache: TodoListRecord[] = [];
let activeListId = DEFAULT_LIST_ID;
let initialized = false;
let initPromise: Promise<void> | null = null;
const listeners = new Set<Listener>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeLists(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getListsSnapshot(): TodoListRecord[] {
  return listsCache;
}

export function getActiveListIdSnapshot(): string {
  return activeListId;
}

export function getActiveListSnapshot(): TodoListRecord | undefined {
  return listsCache.find((list) => list.id === activeListId);
}

export async function initListStore(): Promise<void> {
  if (initialized) return;
  if (!initPromise) {
    initPromise = (async () => {
      listsCache = await listRepository.fetchAllLists();
      const savedActiveListId = await getSetting(ACTIVE_LIST_SETTING_KEY);
      if (savedActiveListId && listsCache.some((list) => list.id === savedActiveListId)) {
        activeListId = savedActiveListId;
      } else if (listsCache.length > 0) {
        activeListId = listsCache[0].id;
        await setSetting(ACTIVE_LIST_SETTING_KEY, activeListId);
      }
      initialized = true;
      notifyListeners();
    })();
  }
  await initPromise;
}

export async function setActiveListInStore(listId: string): Promise<void> {
  if (!listsCache.some((list) => list.id === listId)) return;
  activeListId = listId;
  await setSetting(ACTIVE_LIST_SETTING_KEY, listId);
  notifyListeners();
}

export async function createListInStore(name: string): Promise<TodoListRecord> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('List name is required');
  }

  const minOrder =
    listsCache.length > 0 ? Math.max(...listsCache.map((list) => list.sortOrder)) + 1 : 0;

  const list: TodoListRecord = {
    id: `list-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: trimmed,
    sortOrder: minOrder,
    createdAt: new Date().toISOString(),
  };

  await listRepository.insertList(list);
  listsCache = [...listsCache, list];
  activeListId = list.id;
  await setSetting(ACTIVE_LIST_SETTING_KEY, list.id);
  notifyListeners();
  return list;
}

export async function deleteListFromStore(listId: string): Promise<void> {
  if (listId === DEFAULT_LIST_ID) {
    throw new Error('The Inbox list cannot be deleted');
  }

  const listCount = await listRepository.countLists();
  if (listCount <= 1) {
    throw new Error('You need at least one list');
  }

  await listRepository.moveTodosToList(listId, DEFAULT_LIST_ID);
  await listRepository.deleteListById(listId);
  listsCache = listsCache.filter((list) => list.id !== listId);

  if (activeListId === listId) {
    activeListId = DEFAULT_LIST_ID;
    await setSetting(ACTIVE_LIST_SETTING_KEY, DEFAULT_LIST_ID);
  }

  notifyListeners();
}

export async function renameListInStore(listId: string, name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('List name is required');
  }

  await listRepository.updateListName(listId, trimmed);
  listsCache = listsCache.map((list) => (list.id === listId ? { ...list, name: trimmed } : list));
  notifyListeners();
}

export function getTodoCountForList(listId: string, todos: { listId: string }[]): number {
  return todos.filter((todo) => todo.listId === listId).length;
}
