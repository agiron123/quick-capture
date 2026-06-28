'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    createTodo,
    createTodosBatch,
    deleteTodo,
    fetchTodos,
    reorderTodos,
    updateTodo,
    type CreateTodoItemInput,
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
    mutationFn: ({ title, parentId }: { title: string; parentId?: string }) =>
      createTodo(title, listId, parentId ? { parentId } : undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos', listId] }),
  });

  const addBatchMutation = useMutation({
    mutationFn: (items: CreateTodoItemInput[]) => createTodosBatch(listId, items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos', listId] }),
  });

  const reorderMutation = useMutation({
    mutationFn: (todoIds: string[]) => reorderTodos(listId, todoIds),
    onSuccess: (todos) => {
      queryClient.setQueryData(['todos', listId], todos);
    },
  });

  const reminderMutation = useMutation({
    mutationFn: ({ id, reminderAt }: { id: string; reminderAt: string | null }) =>
      updateTodo(id, { reminderAt }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos', listId] }),
  });

  const dueDateMutation = useMutation({
    mutationFn: ({ id, dueAt }: { id: string; dueAt: string | null }) =>
      updateTodo(id, { dueAt }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos', listId] }),
  });

  const priorityMutation = useMutation({
    mutationFn: ({
      id,
      priority,
    }: {
      id: string;
      priority: import('@quick-capture/shared').TodoPriority | null;
    }) => updateTodo(id, { priority }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos', listId] }),
  });

  const tagsMutation = useMutation({
    mutationFn: ({ id, tags }: { id: string; tags: string[] }) => updateTodo(id, { tags }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos', listId] }),
  });

  return {
    todos: todosQuery.data ?? [],
    isLoading: todosQuery.isLoading,
    refetch: todosQuery.refetch,
    toggleTodo: async (id: string) => {
      const todo = todosQuery.data?.find((item) => item.id === id);
      if (!todo) return;
      await toggleMutation.mutateAsync({ id, completed: !todo.completed });
    },
    deleteTodo: deleteMutation.mutateAsync,
    addTodo: async (title: string) => {
      await addMutation.mutateAsync({ title });
    },
    addSubtask: async (parentId: string, title: string) => {
      await addMutation.mutateAsync({ title, parentId });
    },
    addTodos: addBatchMutation.mutateAsync,
    reorderTodos: reorderMutation.mutateAsync,
    setReminder: async (id: string, reminderAt: string | null) => {
      await reminderMutation.mutateAsync({ id, reminderAt });
    },
    setDueDate: async (id: string, dueAt: string | null) => {
      await dueDateMutation.mutateAsync({ id, dueAt });
    },
    setPriority: async (id: string, priority: import('@quick-capture/shared').TodoPriority | null) => {
      await priorityMutation.mutateAsync({ id, priority });
    },
    setTags: async (id: string, tags: string[]) => {
      await tagsMutation.mutateAsync({ id, tags });
    },
  };
}
