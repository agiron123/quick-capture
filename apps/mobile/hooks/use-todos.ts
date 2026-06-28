import { useCallback, useSyncExternalStore } from 'react';

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

export function useTodos(): {
  todos: Todo[];
  addTodo: (title: string, source?: TodoSource, noteImageUri?: string) => void;
  addTodos: (items: AddTodoItem[]) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  reorderTodos: (todos: Todo[]) => void;
} {
  const todos = useSyncExternalStore(subscribeTodos, getTodosSnapshot, getTodosSnapshot);

  const addTodo = useCallback(
    (title: string, source: TodoSource = 'manual', noteImageUri?: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;

      const [sortOrder] = createSortOrdersForNewTodos(1);
      const todo: Todo = {
        id: createId(),
        title: trimmed,
        completed: false,
        source,
        createdAt: new Date().toISOString(),
        sortOrder,
        noteImageUri,
      };

      void addTodoToStore(todo);
    },
    []
  );

  const addTodos = useCallback((items: AddTodoItem[]) => {
    const sortOrders = createSortOrdersForNewTodos(items.length);
    const created = items
      .map((item, index) => ({
        id: createId(),
        title: item.title.trim(),
        completed: false,
        source: item.source ?? 'capture',
        createdAt: new Date().toISOString(),
        sortOrder: sortOrders[index],
        noteImageUri: item.noteImageUri,
        noteAudioUri: item.noteAudioUri,
        transcript: item.transcript,
      }))
      .filter((todo) => todo.title);

    if (created.length === 0) return;
    void addTodosToStore(created);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    void toggleTodoInStore(id);
  }, []);

  const deleteTodo = useCallback((id: string) => {
    void deleteTodoFromStore(id);
  }, []);

  const reorderTodos = useCallback((nextTodos: Todo[]) => {
    void reorderTodosInStore(nextTodos);
  }, []);

  return { todos, addTodo, addTodos, toggleTodo, deleteTodo, reorderTodos };
}
