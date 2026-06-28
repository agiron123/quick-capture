import type { TodoPriority } from '@/types/todo';

import { PRIORITY_LABELS } from '@/constants/priority';

export function formatPriorityLabel(priority: TodoPriority): string {
  return `${PRIORITY_LABELS[priority]} priority`;
}

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
