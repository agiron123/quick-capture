'use client';

import type { Todo, TodoPriority } from '@quick-capture/shared';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PRIORITY_LABELS, priorityBadgeClass, TODO_PRIORITIES } from '@/lib/format-priority';

type SetPriorityDialogProps = {
  todo: Todo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (todoId: string, priority: TodoPriority | null) => Promise<void>;
};

export function SetPriorityDialog({ todo, open, onOpenChange, onSave }: SetPriorityDialogProps) {
  if (!todo) return null;

  const handleSave = async (priority: TodoPriority | null) => {
    await onSave(todo.id, priority);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Priority</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">{todo.title}</p>

        {todo.priority ? (
          <p className={`text-sm font-medium ${priorityBadgeClass(todo.priority)}`}>
            Current: {PRIORITY_LABELS[todo.priority]}
          </p>
        ) : null}

        <div className="flex flex-col gap-2">
          {TODO_PRIORITIES.map((priority) => (
            <Button
              key={priority}
              type="button"
              variant={todo.priority === priority ? 'default' : 'outline'}
              onClick={() => void handleSave(priority)}
            >
              {PRIORITY_LABELS[priority]}
            </Button>
          ))}
        </div>

        <DialogFooter>
          {todo.priority ? (
            <Button type="button" variant="destructive" onClick={() => void handleSave(null)}>
              Clear priority
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
