import { useCallback, useMemo, useSyncExternalStore } from 'react';

import { useActiveListId } from '@/hooks/use-lists';
import type { Todo, TodoSource } from '@/types/todo';
import { createId } from '@/utils/id';
import {
  addTodoToStore,
  addTodosToStore,
  createSortOrdersForNewTodos,
  deleteTodoFromStore,
  getTodosSnapshot,
  reorderTodosInStore,
  subscribeTodos,
  toggleTodoInStore,
} from '@/utils/todo-store';

type AddTodoItem = {
  title: string;
  source?: TodoSource;
  noteImageUri?: string;
  noteAudioUri?: string;
  transcript?: string;
};

function subscribeTodosAndLists(onStoreChange: () => void): () => void {
  const unsubscribeTodos = subscribeTodos(onStoreChange);
  return unsubscribeTodos;
}

export function useTodos(): {
  todos: Todo[];
  addTodo: (title: string, source?: TodoSource, noteImageUri?: string) => void;
  addTodos: (items: AddTodoItem[]) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  reorderTodos: (todos: Todo[]) => void;
} {
  const activeListId = useActiveListId();
  const allTodos = useSyncExternalStore(
    subscribeTodosAndLists,
    getTodosSnapshot,
    getTodosSnapshot
  );

  const todos = useMemo(
    () =>
      allTodos
        .filter((todo) => todo.listId === activeListId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [allTodos, activeListId]
  );

  const addTodo = useCallback(
    (title: string, source: TodoSource = 'manual', noteImageUri?: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;

      const [sortOrder] = createSortOrdersForNewTodos(1, activeListId);
      const todo: Todo = {
        id: createId(),
        title: trimmed,
        completed: false,
        source,
        listId: activeListId,
        createdAt: new Date().toISOString(),
        sortOrder,
        noteImageUri,
      };

      void addTodoToStore(todo);
    },
    [activeListId]
  );

  const addTodos = useCallback(
    (items: AddTodoItem[]) => {
      const sortOrders = createSortOrdersForNewTodos(items.length, activeListId);
      const created = items
        .map((item, index) => ({
          id: createId(),
          title: item.title.trim(),
          completed: false,
          source: item.source ?? 'capture',
          listId: activeListId,
          createdAt: new Date().toISOString(),
          sortOrder: sortOrders[index],
          noteImageUri: item.noteImageUri,
          noteAudioUri: item.noteAudioUri,
          transcript: item.transcript,
        }))
        .filter((todo) => todo.title);

      if (created.length === 0) return;
      void addTodosToStore(created);
    },
    [activeListId]
  );

  const toggleTodo = useCallback((id: string) => {
    void toggleTodoInStore(id);
  }, []);

  const deleteTodo = useCallback((id: string) => {
    void deleteTodoFromStore(id);
  }, []);

  const reorderTodos = useCallback(
    (nextTodos: Todo[]) => {
      void reorderTodosInStore(activeListId, nextTodos);
    },
    [activeListId]
  );

  return { todos, addTodo, addTodos, toggleTodo, deleteTodo, reorderTodos };
}
