export function formatReminderLabel(reminderAt: string): string {
  const date = new Date(reminderAt);
  if (Number.isNaN(date.getTime())) return 'Reminder set';

  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate();

  const time = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (date.getTime() <= now.getTime()) {
    return `Reminder passed · ${time}`;
  }
  if (isToday) return `Reminder · Today ${time}`;
  if (isTomorrow) return `Reminder · Tomorrow ${time}`;

  const day = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  return `Reminder · ${day} ${time}`;
}

export function isReminderInFuture(reminderAt: string): boolean {
  return new Date(reminderAt).getTime() > Date.now();
}

export const REMINDER_PRESETS = [
  {
    label: 'In 1 hour',
    getDate: () => new Date(Date.now() + 60 * 60 * 1000),
  },
  {
    label: 'Tonight at 6 PM',
    getDate: () => {
      const date = new Date();
      date.setHours(18, 0, 0, 0);
      if (date.getTime() <= Date.now()) date.setDate(date.getDate() + 1);
      return date;
    },
  },
  {
    label: 'Tomorrow at 9 AM',
    getDate: () => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      date.setHours(9, 0, 0, 0);
      return date;
    },
  },
] as const;

export const MAX_RECORDING_MS = 60_000;
export const MIN_RECORDING_MS = 1_000;

export const DEFAULT_LIST_ID = 'list-inbox';
