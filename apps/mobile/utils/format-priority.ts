import type { TodoPriority } from '@quick-capture/shared';
import { formatPriorityLabel } from '@quick-capture/shared';

export { formatPriorityLabel };

export function priorityAccentColor(priority: TodoPriority): string {
  switch (priority) {
    case 'high':
      return '#FF3B30';
    case 'medium':
      return '#FF9500';
    case 'low':
      return '#8E8E93';
    default:
      return '#8E8E93';
  }
}
