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
import {
  DUE_DATE_PRESETS,
  dateInputValueToDueAt,
  dueAtToDateInputValue,
  formatDueDateLabel,
} from '@/lib/format-due-date';

type SetDueDateDialogProps = {
  todo: Todo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (todoId: string, dueAt: string | null) => Promise<void>;
};

export function SetDueDateDialog({ todo, open, onOpenChange, onSave }: SetDueDateDialogProps) {
  const [selected, setSelected] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open || !todo) return;
    if (todo.dueAt) {
      setSelected(dueAtToDateInputValue(todo.dueAt));
      return;
    }
    setSelected(dueAtToDateInputValue(DUE_DATE_PRESETS[0].getDate().toISOString()));
  }, [open, todo]);

  if (!todo) return null;

  const handleSave = async () => {
    if (!selected) return;
    setIsSaving(true);
    try {
      await onSave(todo.id, dateInputValueToDueAt(selected));
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
          <DialogTitle>Due date</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">{todo.title}</p>

        {todo.dueAt ? (
          <p className="text-sm text-blue-600">{formatDueDateLabel(todo.dueAt, todo.completed)}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {DUE_DATE_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelected(dueAtToDateInputValue(preset.getDate().toISOString()))}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="due-at">Date</Label>
          <Input
            id="due-at"
            type="date"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
          />
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {todo.dueAt ? (
            <Button type="button" variant="destructive" onClick={() => void handleClear()} disabled={isSaving}>
              Clear due date
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={() => void handleSave()} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save due date'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
