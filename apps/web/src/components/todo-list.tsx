'use client';

import type { Todo } from '@quick-capture/shared';

import { TodoItem } from '@/components/todo-item';

type TodoListProps = {
  listName?: string;
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export function TodoList({ listName, todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
        <h2 className="text-xl font-semibold">
          {listName ? `No todos in ${listName}` : 'No todos yet'}
        </h2>
        <p className="max-w-md text-muted-foreground">
          Capture a note, record a voice memo, or add a todo manually to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </div>
  );
}
