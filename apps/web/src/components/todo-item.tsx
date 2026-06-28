'use client';

import type { Todo } from '@quick-capture/shared';
import { Bell, Calendar, Flag, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDueDateLabel, isDueOverdue } from '@/lib/format-due-date';
import { formatPriorityLabel, priorityBadgeClass, priorityIconClass } from '@/lib/format-priority';
import { formatReminderLabel } from '@/lib/format-reminder';

function sourceLabel(source: Todo['source']): string {
  switch (source) {
    case 'capture':
      return 'From note capture';
    case 'voice':
      return 'From voice note';
    default:
      return 'Added manually';
  }
}

type TodoItemProps = {
  todo: Todo;
  highlighted?: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSetReminder: (todo: Todo) => void;
  onSetDueDate: (todo: Todo) => void;
  onSetPriority: (todo: Todo) => void;
};

export function TodoItem({
  todo,
  highlighted = false,
  onToggle,
  onDelete,
  onSetReminder,
  onSetDueDate,
  onSetPriority,
}: TodoItemProps) {
  const dueOverdue = todo.dueAt ? isDueOverdue(todo.dueAt, todo.completed) : false;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border bg-card p-4 ${highlighted ? 'ring-2 ring-orange-500' : ''}`}
    >
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id)}
        aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
      />
      <div className="min-w-0 flex-1 space-y-1">
        <p
          className={`text-base ${todo.completed ? 'text-muted-foreground line-through opacity-70' : ''}`}
        >
          {todo.title}
        </p>
        {todo.priority ? (
          <Badge variant="secondary" className={priorityBadgeClass(todo.priority)}>
            {formatPriorityLabel(todo.priority)}
          </Badge>
        ) : null}
        {todo.dueAt ? (
          <Badge
            variant="secondary"
            className={dueOverdue ? 'text-destructive' : 'text-blue-600'}
          >
            {formatDueDateLabel(todo.dueAt, todo.completed)}
          </Badge>
        ) : null}
        {todo.reminderAt ? (
          <Badge variant="secondary" className="text-orange-600">
            {formatReminderLabel(todo.reminderAt)}
          </Badge>
        ) : null}
        {!todo.priority && !todo.dueAt && !todo.reminderAt ? (
          <p className="text-sm text-muted-foreground">{sourceLabel(todo.source)}</p>
        ) : null}
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label={todo.priority ? 'Edit priority' : 'Set priority'}
        onClick={() => onSetPriority(todo)}
      >
        <Flag
          className={`size-4 ${todo.priority ? priorityIconClass(todo.priority) : ''}`}
        />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={todo.dueAt ? 'Edit due date' : 'Set due date'}
        onClick={() => onSetDueDate(todo)}
      >
        <Calendar className={`size-4 ${todo.dueAt ? (dueOverdue ? 'text-destructive' : 'text-blue-600') : ''}`} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={todo.reminderAt ? 'Edit reminder' : 'Set reminder'}
        onClick={() => onSetReminder(todo)}
      >
        <Bell className={`size-4 ${todo.reminderAt ? 'text-orange-600' : ''}`} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive"
        onClick={() => onDelete(todo.id)}
      >
        <Trash2 className="mr-1 size-4" />
        Delete
      </Button>
    </div>
  );
}
