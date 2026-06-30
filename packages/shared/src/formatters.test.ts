import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  dateInputValueToDueAt,
  dateToDueAt,
  dueAtToDateInputValue,
  formatDueDateLabel,
  isDueOverdue,
} from './format-due-date';
import { formatPriorityLabel } from './format-priority';
import { formatReminderLabel, isReminderInFuture } from './format-reminder';
import { formatTagsLabel } from './format-tags';

describe('formatDueDateLabel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('labels today, tomorrow, and future dates', () => {
    expect(formatDueDateLabel('2026-06-15T23:59:00.000Z')).toBe('Due today');
    expect(formatDueDateLabel('2026-06-16T08:00:00.000Z')).toBe('Due tomorrow');
    expect(formatDueDateLabel('2026-06-20T08:00:00.000Z')).toMatch(/^Due /);
  });

  it('labels overdue todos', () => {
    expect(formatDueDateLabel('2026-06-10T08:00:00.000Z')).toMatch(/^Overdue ·/);
    expect(formatDueDateLabel('2026-06-10T08:00:00.000Z', true)).not.toMatch(/^Overdue/);
  });

  it('detects overdue state', () => {
    expect(isDueOverdue('2026-06-10T08:00:00.000Z')).toBe(true);
    expect(isDueOverdue('2026-06-10T08:00:00.000Z', true)).toBe(false);
  });
});

describe('due date conversions', () => {
  it('round-trips date input values', () => {
    const dueAt = dateInputValueToDueAt('2026-06-20');
    expect(dueAtToDateInputValue(dueAt)).toBe('2026-06-20');
    expect(dateToDueAt(new Date('2026-06-20T10:00:00.000Z'))).toContain('2026-06-20');
  });
});

describe('formatReminderLabel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('labels today and passed reminders', () => {
    expect(formatReminderLabel('2026-06-15T18:00:00.000Z')).toMatch(/^Reminder · Today/);
    expect(formatReminderLabel('2026-06-15T08:00:00.000Z')).toMatch(/^Reminder passed/);
  });

  it('detects future reminders', () => {
    expect(isReminderInFuture('2026-06-15T18:00:00.000Z')).toBe(true);
    expect(isReminderInFuture('2026-06-15T08:00:00.000Z')).toBe(false);
  });
});

describe('formatPriorityLabel', () => {
  it('formats priority labels', () => {
    expect(formatPriorityLabel('high')).toBe('High priority');
  });
});

describe('formatTagsLabel', () => {
  it('prefixes tags with hash', () => {
    expect(formatTagsLabel(['work', 'home'])).toBe('#work #home');
  });
});
