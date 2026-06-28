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
