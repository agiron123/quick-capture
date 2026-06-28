'use client';

import type { Todo } from '@quick-capture/shared';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { REMINDER_PRESETS } from '@/lib/constants';
import { formatReminderLabel } from '@/lib/format-reminder';

type SetReminderDialogProps = {
  todo: Todo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (todoId: string, reminderAt: string | null) => Promise<void>;
};

function toDatetimeLocalValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function SetReminderDialog({ todo, open, onOpenChange, onSave }: SetReminderDialogProps) {
  const [selected, setSelected] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open || !todo) return;
    if (todo.reminderAt) {
      const existing = new Date(todo.reminderAt);
      if (!Number.isNaN(existing.getTime())) {
        setSelected(toDatetimeLocalValue(existing));
        return;
      }
    }
    setSelected(toDatetimeLocalValue(REMINDER_PRESETS[0].getDate()));
  }, [open, todo]);

  if (!todo) return null;

  const handleSave = async () => {
    const date = new Date(selected);
    if (Number.isNaN(date.getTime())) return;
    if (date.getTime() <= Date.now()) {
      window.alert('Pick a future time.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(todo.id, date.toISOString());
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    setIsSaving(true);
    try {
      await onSave(todo.id, null);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reminder</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">{todo.title}</p>

        {todo.reminderAt ? (
          <p className="text-sm text-orange-600">{formatReminderLabel(todo.reminderAt)}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {REMINDER_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelected(toDatetimeLocalValue(preset.getDate()))}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reminder-at">Date and time</Label>
          <Input
            id="reminder-at"
            type="datetime-local"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
          />
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {todo.reminderAt ? (
            <Button type="button" variant="destructive" onClick={() => void handleClear()} disabled={isSaving}>
              Clear reminder
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={() => void handleSave()} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save reminder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
