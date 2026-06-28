'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    createTodo,
    deleteTodo,
    fetchTodos,
    updateTodo,
} from '@/lib/api-client-client';

export function useTodos(listId: string) {
  const queryClient = useQueryClient();

  const todosQuery = useQuery({
    queryKey: ['todos', listId],
    queryFn: () => fetchTodos(listId),
    enabled: Boolean(listId),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateTodo(id, { completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos', listId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos', listId] }),
  });

  const addMutation = useMutation({
    mutationFn: (title: string) => createTodo(title, listId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos', listId] }),
  });

  return {
    todos: todosQuery.data ?? [],
    isLoading: todosQuery.isLoading,
    toggleTodo: async (id: string) => {
      const todo = todosQuery.data?.find((item) => item.id === id);
      if (!todo) return;
      await toggleMutation.mutateAsync({ id, completed: !todo.completed });
    },
    deleteTodo: deleteMutation.mutateAsync,
    addTodo: addMutation.mutateAsync,
  };
}
