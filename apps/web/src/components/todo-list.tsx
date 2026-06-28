'use client';

import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Todo } from '@quick-capture/shared';
import { GripVertical } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { TodoItem } from '@/components/todo-item';

type TodoListProps = {
  listName?: string;
  todos: Todo[];
  highlightTodoId?: string | null;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSetReminder: (todo: Todo) => void;
  onSetDueDate: (todo: Todo) => void;
  onSetPriority: (todo: Todo) => void;
  onSetTags: (todo: Todo) => void;
  onReorder: (todoIds: string[]) => void;
};

function SortableTodoRow({
  todo,
  highlighted,
  onToggle,
  onDelete,
  onSetReminder,
  onSetDueDate,
  onSetPriority,
  onSetTags,
}: {
  todo: Todo;
  highlighted: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSetReminder: (todo: Todo) => void;
  onSetDueDate: (todo: Todo) => void;
  onSetPriority: (todo: Todo) => void;
  onSetTags: (todo: Todo) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
  });

  useEffect(() => {
    if (!highlighted) return;
    rowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlighted]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
  };

  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    rowRef.current = node;
  };

  return (
    <div ref={setRefs} style={style} className="flex items-stretch gap-1">
      <button
        type="button"
        className="mt-4 flex shrink-0 touch-none items-start px-1 text-muted-foreground"
        {...attributes}
        {...listeners}
        aria-label="Reorder todo"
      >
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <TodoItem
          todo={todo}
          highlighted={highlighted}
          onToggle={onToggle}
          onDelete={onDelete}
          onSetReminder={onSetReminder}
          onSetDueDate={onSetDueDate}
          onSetPriority={onSetPriority}
          onSetTags={onSetTags}
        />
      </div>
    </div>
  );
}

export function TodoList({
  listName,
  todos,
  highlightTodoId,
  onToggle,
  onDelete,
  onSetReminder,
  onSetDueDate,
  onSetPriority,
  onSetTags,
  onReorder,
}: TodoListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = todos.findIndex((todo) => todo.id === active.id);
    const newIndex = todos.findIndex((todo) => todo.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(todos, oldIndex, newIndex);
    onReorder(reordered.map((todo) => todo.id));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={todos.map((todo) => todo.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 p-4">
          {todos.map((todo) => (
            <SortableTodoRow
              key={todo.id}
              todo={todo}
              highlighted={todo.id === highlightTodoId}
              onToggle={onToggle}
              onDelete={onDelete}
              onSetReminder={onSetReminder}
              onSetDueDate={onSetDueDate}
              onSetPriority={onSetPriority}
              onSetTags={onSetTags}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
