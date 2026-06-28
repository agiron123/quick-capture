export type DueDatePreset = {
  label: string;
  getDate: () => Date;
};

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

export const DUE_DATE_PRESETS: DueDatePreset[] = [
  { label: 'Today', getDate: () => endOfDay(new Date()) },
  { label: 'Tomorrow', getDate: () => daysFromNow(1) },
  { label: 'Next week', getDate: () => daysFromNow(7) },
];

export function dateToDueAt(date: Date): string {
  return endOfDay(date).toISOString();
}
