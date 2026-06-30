import type { TodoPriority } from './todo';

export const TODO_PRIORITIES: TodoPriority[] = ['low', 'medium', 'high'];

export const PRIORITY_LABELS: Record<TodoPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export function formatPriorityLabel(priority: TodoPriority): string {
  return `${PRIORITY_LABELS[priority]} priority`;
}
