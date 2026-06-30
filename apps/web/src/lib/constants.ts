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
