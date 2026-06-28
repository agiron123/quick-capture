export function formatDueDateLabel(dueAt: string, completed = false): string {
  const date = new Date(dueAt);
  if (Number.isNaN(date.getTime())) return 'Due date set';

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDue = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((startOfDue.getTime() - startOfToday.getTime()) / (24 * 60 * 60 * 1000));

  const day = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  if (!completed && startOfDue.getTime() < startOfToday.getTime()) {
    return `Overdue · ${day}`;
  }
  if (dayDiff === 0) return 'Due today';
  if (dayDiff === 1) return 'Due tomorrow';
  return `Due ${day}`;
}

export function isDueOverdue(dueAt: string, completed = false): boolean {
  if (completed) return false;
  const date = new Date(dueAt);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDue = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return startOfDue.getTime() < startOfToday.getTime();
}
