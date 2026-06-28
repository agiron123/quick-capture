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

export async function initTodoStore(): Promise<void> {
  if (initialized) return;
  if (!initPromise) {
    initPromise = (async () => {
      await getDatabase();
      await initListStore();
      cache = await todoRepository.fetchAllTodos();
      initialized = true;
      notifyListeners();
    })();
  }
  await initPromise;
}

export async function addTodoToStore(todo: Todo): Promise<void> {
  await todoRepository.insertTodo(todo);
  cache = [todo, ...cache];
  notifyListeners();
}

export async function addTodosToStore(todos: Todo[]): Promise<void> {
  if (todos.length === 0) return;
  await todoRepository.insertTodos(todos);
  cache = [...todos, ...cache];
  notifyListeners();
}

export async function toggleTodoInStore(id: string): Promise<void> {
  const todo = cache.find((item) => item.id === id);
  if (!todo) return;
  const completed = !todo.completed;
  await todoRepository.updateTodoCompleted(id, completed);
  cache = cache.map((item) => (item.id === id ? { ...item, completed } : item));
  notifyListeners();
}

export async function deleteTodoFromStore(id: string): Promise<void> {
  await todoRepository.deleteTodoById(id);
  cache = cache.filter((item) => item.id !== id);
  notifyListeners();
}

export async function reorderTodosInStore(listId: string, todos: Todo[]): Promise<void> {
  const reordered = todos.map((todo, index) => ({ ...todo, sortOrder: index, listId }));
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
