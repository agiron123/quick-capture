import { todoTagsEqual } from '@quick-capture/shared';

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
import { SyncConflictError } from '@/services/sync-conflict';
import * as listRepository from '@/utils/list-repository';
import { refreshListsFromDb } from '@/utils/list-store';
import * as todoRepository from '@/utils/todo-repository';
import { refreshTodosFromDb } from '@/utils/todo-store';

async function fetchAllServerTodos(
  serverLists: { id: string }[]
): Promise<Map<string, Todo>> {
  const map = new Map<string, Todo>();
  for (const list of serverLists) {
    const todos = await fetchTodosFromApi(list.id);
    for (const todo of todos) {
      map.set(todo.id, todo);
    }
  }
  return map;
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

function localTodoDiffers(local: Todo, server: Todo, mappedListId: string): boolean {
  return (
    local.title !== server.title ||
    local.completed !== server.completed ||
    (local.dueAt ?? null) !== (server.dueAt ?? null) ||
    (local.priority ?? null) !== (server.priority ?? null) ||
    !todoTagsEqual(local.tags, server.tags) ||
    (local.reminderAt ?? null) !== (server.reminderAt ?? null) ||
    mappedListId !== server.listId ||
    local.sortOrder !== server.sortOrder
  );
}

async function pushNewTodosForList(listId: string, todos: Todo[]): Promise<void> {
  if (todos.length === 0) return;

  await createTodosBatchOnApi(
    listId,
    todos.map((todo) => ({
      title: todo.title,
      source: todo.source,
      clientId: todo.id,
      transcript: todo.transcript,
      reminderAt: todo.reminderAt,
      dueAt: todo.dueAt,
      priority: todo.priority,
      tags: todo.tags,
      parentId: todo.parentId,
      sortOrder: todo.sortOrder,
    }))
  );

  await Promise.all(
    todos.map(async (todo) => {
      if (!todo.completed && !todo.reminderAt && !todo.dueAt && !todo.priority && !todo.tags?.length) return;

      const patch: {
        completed?: boolean;
        reminderAt?: string | null;
        dueAt?: string | null;
        priority?: Todo['priority'] | null;
        tags?: string[];
        baseUpdatedAt?: string;
      } = {};
      if (todo.completed) patch.completed = true;
      if (todo.reminderAt) patch.reminderAt = todo.reminderAt;
      if (todo.dueAt) patch.dueAt = todo.dueAt;
      if (todo.priority) patch.priority = todo.priority;
      if (todo.tags?.length) patch.tags = todo.tags;

      await updateTodoOnApi(todo.id, patch);
    })
  );
}

async function pushExistingTodoChanges(
  local: Todo,
  server: Todo,
  mappedListId: string
): Promise<void> {
  if (!localTodoDiffers(local, server, mappedListId)) return;

  try {
    await updateTodoOnApi(local.id, {
      title: local.title,
      completed: local.completed,
      dueAt: local.dueAt ?? null,
      priority: local.priority ?? null,
      tags: local.tags ?? [],
      reminderAt: local.reminderAt ?? null,
      listId: mappedListId,
      sortOrder: local.sortOrder,
      baseUpdatedAt: local.updatedAt ?? server.updatedAt,
    });
  } catch (error) {
    if (error instanceof SyncConflictError) {
      console.warn(`Sync conflict for todo ${local.id}; server version wins`);
      return;
    }
    throw error;
  }
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

  const serverTodoMap = await fetchAllServerTodos(serverLists);

  const newTodos: Todo[] = [];
  for (const local of localTodos) {
    if (!serverTodoMap.has(local.id)) {
      newTodos.push(local);
    }
  }

  const newTodosByList = new Map<string, Todo[]>();
  for (const todo of newTodos) {
    const serverListId = listIdMap.get(todo.listId) ?? DEFAULT_LIST_ID;
    const group = newTodosByList.get(serverListId) ?? [];
    group.push(todo);
    newTodosByList.set(serverListId, group);
  }

  for (const [listId, todos] of newTodosByList) {
    await pushNewTodosForList(listId, todos);
  }

  await Promise.all(
    localTodos.map(async (local) => {
      const server = serverTodoMap.get(local.id);
      if (!server) return;
      const mappedListId = listIdMap.get(local.listId) ?? local.listId;
      await pushExistingTodoChanges(local, server, mappedListId);
    })
  );
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
