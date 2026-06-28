import { cancelReminder, reconcileAllReminders, rescheduleReminder } from '@/services/reminder-scheduler';
import {
  createTodoOnApi,
  createTodosBatchOnApi,
  deleteTodoOnApi,
  reorderTodosOnApi,
  updateTodoOnApi,
  updateTodoReminderOnApi,
} from '@/services/sync-api-client';
import { isServerRemindersEnabled } from '@/services/sync-mode';
import type { Todo } from '@/types/todo';
import { getDatabase } from '@/utils/db';
import { initListStore } from '@/utils/list-store';
import * as todoRepository from '@/utils/todo-repository';

type Listener = () => void;

let cache: Todo[] = [];
let initialized = false;
let initPromise: Promise<void> | null = null;
const listeners = new Set<Listener>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

function nextSortOrders(count: number, listId: string): number[] {
  const listTodos = cache.filter((todo) => todo.listId === listId);
  const minOrder =
    listTodos.length > 0 ? Math.min(...listTodos.map((todo) => todo.sortOrder)) : 0;
  return Array.from({ length: count }, (_, index) => minOrder - count + index);
}

export function subscribeTodos(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTodosSnapshot(): Todo[] {
  return cache;
}

async function syncNotificationId(todoId: string, notificationId: string | null): Promise<void> {
  await todoRepository.updateTodoNotificationId(todoId, notificationId);
  cache = cache.map((todo) =>
    todo.id === todoId ? { ...todo, notificationId: notificationId ?? undefined } : todo
  );
}

export async function initTodoStore(): Promise<void> {
  if (initialized) return;
  if (!initPromise) {
    initPromise = (async () => {
      await getDatabase();
      await initListStore();
      cache = await todoRepository.fetchAllTodos();
      await reconcileAllReminders(cache, syncNotificationId);
      initialized = true;
      notifyListeners();
    })();
  }
  await initPromise;
}

export async function addTodoToStore(todo: Todo): Promise<void> {
  if (isServerRemindersEnabled()) {
    const created = await createTodoOnApi({
      title: todo.title,
      source: todo.source,
      listId: todo.listId,
      sortOrder: todo.sortOrder,
      clientId: todo.id,
      transcript: todo.transcript,
      reminderAt: todo.reminderAt,
    });
    await todoRepository.insertTodo({ ...created, noteImageUri: todo.noteImageUri, noteAudioUri: todo.noteAudioUri });
    cache = [{ ...created, noteImageUri: todo.noteImageUri, noteAudioUri: todo.noteAudioUri }, ...cache];
  } else {
    await todoRepository.insertTodo(todo);
    cache = [todo, ...cache];
  }
  notifyListeners();
}

export async function addTodosToStore(todos: Todo[]): Promise<void> {
  if (todos.length === 0) return;

  if (isServerRemindersEnabled()) {
    const listId = todos[0].listId;
    const created = await createTodosBatchOnApi(
      listId,
      todos.map((todo) => ({
        title: todo.title,
        source: todo.source,
        clientId: todo.id,
        transcript: todo.transcript,
      }))
    );
    const merged = created.map((todo, index) => ({
      ...todo,
      noteImageUri: todos[index]?.noteImageUri,
      noteAudioUri: todos[index]?.noteAudioUri,
    }));
    await todoRepository.insertTodos(merged);
    cache = [...merged, ...cache];
  } else {
    await todoRepository.insertTodos(todos);
    cache = [...todos, ...cache];
  }
  notifyListeners();
}

export async function toggleTodoInStore(id: string): Promise<void> {
  const todo = cache.find((item) => item.id === id);
  if (!todo) return;
  const completed = !todo.completed;

  if (isServerRemindersEnabled()) {
    await updateTodoOnApi(id, { completed });
  }

  if (completed) {
    if (todo.notificationId) {
      await cancelReminder(todo.notificationId);
    }
    await todoRepository.updateTodoCompleted(id, true);
    await todoRepository.clearTodoReminder(id);
  } else {
    await todoRepository.updateTodoCompleted(id, false);
  }

  cache = cache.map((item) =>
    item.id === id
      ? {
          ...item,
          completed,
          reminderAt: completed ? undefined : item.reminderAt,
          notificationId: completed ? undefined : item.notificationId,
        }
      : item
  );
  notifyListeners();
}

export async function deleteTodoFromStore(id: string): Promise<void> {
  const todo = cache.find((item) => item.id === id);
  if (todo?.notificationId) {
    await cancelReminder(todo.notificationId);
  }

  if (isServerRemindersEnabled()) {
    await deleteTodoOnApi(id);
  }

  await todoRepository.deleteTodoById(id);
  cache = cache.filter((item) => item.id !== id);
  notifyListeners();
}

export async function setReminderInStore(id: string, reminderAt: string | null): Promise<boolean> {
  const todo = cache.find((item) => item.id === id);
  if (!todo) return false;

  if (todo.notificationId) {
    await cancelReminder(todo.notificationId);
  }

  if (isServerRemindersEnabled()) {
    try {
      await updateTodoReminderOnApi(id, reminderAt);
    } catch (error) {
      console.error('Failed to sync reminder to API', error);
      return false;
    }

    await todoRepository.updateTodoReminder(id, reminderAt, null);
    cache = cache.map((item) =>
      item.id === id
        ? {
            ...item,
            reminderAt: reminderAt ?? undefined,
            notificationId: undefined,
          }
        : item
    );
    notifyListeners();
    return Boolean(reminderAt);
  }

  let notificationId: string | undefined;
  if (reminderAt) {
    const scheduledId = await rescheduleReminder({
      ...todo,
      reminderAt,
      notificationId: undefined,
    });
    notificationId = scheduledId ?? undefined;
  }

  await todoRepository.updateTodoReminder(id, reminderAt, notificationId ?? null);

  cache = cache.map((item) =>
    item.id === id
      ? {
          ...item,
          reminderAt: reminderAt ?? undefined,
          notificationId,
        }
      : item
  );
  notifyListeners();

  return Boolean(reminderAt && notificationId);
}

export async function reorderTodosInStore(listId: string, todos: Todo[]): Promise<void> {
  const reordered = todos.map((todo, index) => ({ ...todo, sortOrder: index, listId }));

  if (isServerRemindersEnabled()) {
    await reorderTodosOnApi(
      listId,
      reordered.map((todo) => todo.id)
    );
  }

  await todoRepository.updateTodosOrder(reordered);
  const otherTodos = cache.filter((todo) => todo.listId !== listId);
  cache = [...otherTodos, ...reordered];
  notifyListeners();
}

export function createSortOrdersForNewTodos(count: number, listId: string): number[] {
  return nextSortOrders(count, listId);
}

export async function refreshTodosFromDb(): Promise<void> {
  cache = await todoRepository.fetchAllTodos();
  notifyListeners();
}
