export const REMINDER_CHANNEL_ID = 'todo-reminders';

export type ReminderPreset = {
  label: string;
  getDate: () => Date;
};

function tonightAt(hour: number, minute = 0): Date {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  if (date.getTime() <= Date.now()) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

function tomorrowAt(hour: number, minute = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(hour, minute, 0, 0);
  return date;
}

export const REMINDER_PRESETS: ReminderPreset[] = [
  {
    label: 'In 1 hour',
    getDate: () => new Date(Date.now() + 60 * 60 * 1000),
  },
  {
    label: 'Tonight at 6 PM',
    getDate: () => tonightAt(18),
  },
  {
    label: 'Tomorrow at 9 AM',
    getDate: () => tomorrowAt(9),
  },
];
