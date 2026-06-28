'use client';

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
import type { Todo } from '@quick-capture/shared';

type AddSubtaskDialogProps = {
  parent: Todo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (parentId: string, title: string) => Promise<void>;
};

export function AddSubtaskDialog({ parent, open, onOpenChange, onSave }: AddSubtaskDialogProps) {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (!open) {
      setTitle('');
    }
  }, [open]);

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed || !parent) return;
    await onSave(parent.id, trimmed);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add subtask</DialogTitle>
        </DialogHeader>
        {parent ? (
          <p className="text-sm text-muted-foreground">For: {parent.title}</p>
        ) : null}
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Subtask title"
          onKeyDown={(event) => {
            if (event.key === 'Enter') void handleSave();
          }}
        />
        <DialogFooter>
          <Button onClick={() => void handleSave()} disabled={!title.trim()}>
            Add subtask
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
