import type { TodoPriority } from '@quick-capture/shared';

export {
  formatPriorityLabel,
  PRIORITY_LABELS,
  TODO_PRIORITIES,
} from '@quick-capture/shared';

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
