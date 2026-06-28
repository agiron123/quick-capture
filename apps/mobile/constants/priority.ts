import type { TodoPriority } from '@quick-capture/shared';

export const TODO_PRIORITIES: TodoPriority[] = ['low', 'medium', 'high'];

export const PRIORITY_LABELS: Record<TodoPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};
