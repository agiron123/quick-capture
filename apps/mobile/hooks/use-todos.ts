import { useCallback, useSyncExternalStore } from 'react';

import type { Todo, TodoSource } from '@/types/todo';
import { createId } from '@/utils/id';
import {
    addTodoToStore,
    addTodosToStore,
    deleteTodoFromStore,
    getTodosSnapshot,
    subscribeTodos,
    toggleTodoInStore,
} from '@/utils/todo-store';

export function useTodos(): {
  todos: Todo[];
  addTodo: (title: string, source?: TodoSource, noteImageUri?: string) => void;
  addTodos: (items: { title: string; source?: TodoSource; noteImageUri?: string }[]) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
} {
  const todos = useSyncExternalStore(subscribeTodos, getTodosSnapshot, getTodosSnapshot);

  const addTodo = useCallback(
    (title: string, source: TodoSource = 'manual', noteImageUri?: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;

      const todo: Todo = {
        id: createId(),
        title: trimmed,
        completed: false,
        source,
        createdAt: new Date().toISOString(),
        noteImageUri,
      };

      void addTodoToStore(todo);
    },
    []
  );

  const addTodos = useCallback(
    (items: { title: string; source?: TodoSource; noteImageUri?: string }[]) => {
      const created = items
        .map((item) => ({
          id: createId(),
          title: item.title.trim(),
          completed: false,
          source: item.source ?? 'capture',
          createdAt: new Date().toISOString(),
          noteImageUri: item.noteImageUri,
        }))
        .filter((todo) => todo.title);

      if (created.length === 0) return;
      void addTodosToStore(created);
    },
    []
  );

  const toggleTodo = useCallback((id: string) => {
    void toggleTodoInStore(id);
  }, []);

  const deleteTodo = useCallback((id: string) => {
    void deleteTodoFromStore(id);
  }, []);

  return { todos, addTodo, addTodos, toggleTodo, deleteTodo };
}
