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

function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 0, 0);
  return next;
}

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return endOfDay(date);
}

export const DUE_DATE_PRESETS = [
  { label: 'Today', getDate: () => endOfDay(new Date()) },
  { label: 'Tomorrow', getDate: () => daysFromNow(1) },
  { label: 'Next week', getDate: () => daysFromNow(7) },
] as const;

export function dateToDueAt(date: Date): string {
  return endOfDay(date).toISOString();
}

function toDateInputValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function dueAtToDateInputValue(dueAt: string): string {
  const date = new Date(dueAt);
  if (Number.isNaN(date.getTime())) return toDateInputValue(new Date());
  return toDateInputValue(date);
}

export function dateInputValueToDueAt(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return dateToDueAt(date);
}
