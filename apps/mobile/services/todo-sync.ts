import { DEFAULT_LIST_ID } from '@/constants/lists';
import type { Todo } from '@/types/todo';
import {
  createListOnApi,
  createTodosBatchOnApi,
  fetchListsFromApi,
  fetchTodosFromApi,
  updateTodoOnApi,
} from '@/services/sync-api-client';
import { isServerRemindersEnabled } from '@/services/sync-mode';
import * as listRepository from '@/utils/list-repository';
import { refreshListsFromDb } from '@/utils/list-store';
import * as todoRepository from '@/utils/todo-repository';
import { refreshTodosFromDb } from '@/utils/todo-store';

async function fetchAllServerTodoIds(serverLists: { id: string }[]): Promise<Set<string>> {
  const ids = new Set<string>();
  for (const list of serverLists) {
    const todos = await fetchTodosFromApi(list.id);
    for (const todo of todos) {
      ids.add(todo.id);
    }
  }
  return ids;
}

function buildListIdMap(
  localLists: Awaited<ReturnType<typeof listRepository.fetchAllLists>>,
  serverLists: Awaited<ReturnType<typeof fetchListsFromApi>>
): Map<string, string> {
  const map = new Map<string, string>();
  const serverByName = new Map(serverLists.map((list) => [list.name, list.id]));

  for (const list of localLists) {
    if (serverLists.some((serverList) => serverList.id === list.id)) {
      map.set(list.id, list.id);
      continue;
    }

    const matchedByName = serverByName.get(list.name);
    if (matchedByName) {
      map.set(list.id, matchedByName);
      continue;
    }

    map.set(list.id, list.id);
  }

  return map;
}

async function ensureServerLists(
  localLists: Awaited<ReturnType<typeof listRepository.fetchAllLists>>,
  listIdMap: Map<string, string>,
  serverLists: Awaited<ReturnType<typeof fetchListsFromApi>>
): Promise<Awaited<ReturnType<typeof fetchListsFromApi>>> {
  const nextServerLists = [...serverLists];
  const serverIds = new Set(serverLists.map((list) => list.id));

  for (const list of localLists) {
    const targetId = listIdMap.get(list.id);
    if (!targetId || serverIds.has(targetId)) continue;

    const created = await createListOnApi(list.name);
    listIdMap.set(list.id, created.id);
    nextServerLists.push(created);
    serverIds.add(created.id);
  }

  return nextServerLists;
}

async function pushTodosForList(listId: string, todos: Todo[]): Promise<void> {
  if (todos.length === 0) return;

  await createTodosBatchOnApi(
    listId,
    todos.map((todo) => ({
      title: todo.title,
      source: todo.source,
      clientId: todo.id,
      transcript: todo.transcript,
      reminderAt: todo.reminderAt,
      sortOrder: todo.sortOrder,
    }))
  );

  await Promise.all(
    todos.map(async (todo) => {
      if (!todo.completed && !todo.reminderAt) return;

      const patch: { completed?: boolean; reminderAt?: string | null } = {};
      if (todo.completed) patch.completed = true;
      if (todo.reminderAt) patch.reminderAt = todo.reminderAt;

      await updateTodoOnApi(todo.id, patch);
    })
  );
}

export async function pushLocalToServer(): Promise<void> {
  if (!isServerRemindersEnabled()) return;

  const localLists = await listRepository.fetchAllLists();
  const localTodos = await todoRepository.fetchAllTodos();
  const hasOnlyDefaultList =
    localLists.length === 1 && localLists[0]?.id === DEFAULT_LIST_ID;

  if (localTodos.length === 0 && hasOnlyDefaultList) return;

  let serverLists = await fetchListsFromApi();
  const listIdMap = buildListIdMap(localLists, serverLists);
  serverLists = await ensureServerLists(localLists, listIdMap, serverLists);

  const serverTodoIds = await fetchAllServerTodoIds(serverLists);
  const todosToPush = localTodos.filter((todo) => !serverTodoIds.has(todo.id));
  if (todosToPush.length === 0) return;

  const todosByServerList = new Map<string, Todo[]>();
  for (const todo of todosToPush) {
    const serverListId = listIdMap.get(todo.listId) ?? DEFAULT_LIST_ID;
    const group = todosByServerList.get(serverListId) ?? [];
    group.push(todo);
    todosByServerList.set(serverListId, group);
  }

  for (const [listId, todos] of todosByServerList) {
    await pushTodosForList(listId, todos);
  }
}

export async function pullTodosFromServer(): Promise<void> {
  if (!isServerRemindersEnabled()) return;

  const lists = await fetchListsFromApi();
  await listRepository.replaceAllLists(lists);

  const allTodos: Todo[] = [];
  for (const list of lists) {
    const todos = await fetchTodosFromApi(list.id);
    allTodos.push(...todos);
  }

  await todoRepository.replaceAllTodos(allTodos);
  await refreshListsFromDb();
  await refreshTodosFromDb();
}

export async function syncOnSignIn(): Promise<void> {
  await pushLocalToServer();
  await pullTodosFromServer();
}
