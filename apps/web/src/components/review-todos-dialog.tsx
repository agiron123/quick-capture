'use client';

import type { TodoSource } from '@quick-capture/shared';
import { Plus, X } from 'lucide-react';
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
import { buildReviewSavePayload, type ReviewSavePayload } from '@/lib/review-todos';

export type { ReviewSavePayload };

type ReviewTodosDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: TodoSource;
  initialTitles: string[];
  transcript?: string;
  previewUrl?: string;
  captureId?: string;
  onSave: (payload: ReviewSavePayload) => Promise<void>;
};

export function ReviewTodosDialog({
  open,
  onOpenChange,
  source,
  initialTitles,
  transcript,
  previewUrl,
  captureId,
  onSave,
}: ReviewTodosDialogProps) {
  const [titles, setTitles] = useState<string[]>(initialTitles);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitles(initialTitles.length > 0 ? initialTitles : ['']);
    }
  }, [open, initialTitles]);

  const updateTitle = (index: number, value: string) => {
    setTitles((current) => current.map((title, i) => (i === index ? value : title)));
  };

  const removeTitle = (index: number) => {
    setTitles((current) => current.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const payload = buildReviewSavePayload({
      titles,
      source,
      captureId,
      transcript,
    });
    if (!payload) return;

    setIsSaving(true);
    try {
      await onSave(payload);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Review todos</DialogTitle>
        </DialogHeader>

        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Capture preview" className="max-h-48 w-full rounded-lg object-cover" />
        ) : null}

        {transcript ? (
          <div className="space-y-1 rounded-lg bg-muted p-3">
            <Label className="text-xs text-muted-foreground">Transcript</Label>
            <p className="text-sm leading-relaxed">{transcript}</p>
          </div>
        ) : null}

        <p className="text-sm text-muted-foreground">Edit the extracted todos before saving.</p>

        <div className="space-y-2">
          {titles.map((title, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={title}
                onChange={(event) => updateTitle(index, event.target.value)}
                placeholder="Todo title"
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeTitle(index)}>
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button type="button" variant="link" className="px-0" onClick={() => setTitles((c) => [...c, ''])}>
          <Plus className="mr-1 size-4" />
          Add another
        </Button>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
