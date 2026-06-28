import type { TodoPriority } from '@quick-capture/shared';

export const TODO_PRIORITIES: TodoPriority[] = ['low', 'medium', 'high'];

export const PRIORITY_LABELS: Record<TodoPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export function formatPriorityLabel(priority: TodoPriority): string {
  return `${PRIORITY_LABELS[priority]} priority`;
}

export function priorityBadgeClass(priority: TodoPriority): string {
  switch (priority) {
    case 'high':
      return 'text-destructive';
    case 'medium':
      return 'text-orange-600';
    case 'low':
      return 'text-muted-foreground';
  }
}

export function priorityIconClass(priority: TodoPriority): string {
  switch (priority) {
    case 'high':
      return 'text-destructive';
    case 'medium':
      return 'text-orange-600';
    case 'low':
      return 'text-muted-foreground';
  }
}
