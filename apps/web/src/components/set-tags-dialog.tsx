'use client';

import { MAX_TAG_LENGTH, MAX_TODO_TAGS, normalizeTodoTags, type Todo } from '@quick-capture/shared';
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
import { formatTagsLabel } from '@/lib/format-tags';

type SetTagsDialogProps = {
  todo: Todo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (todoId: string, tags: string[]) => Promise<void>;
};

export function SetTagsDialog({ todo, open, onOpenChange, onSave }: SetTagsDialogProps) {
  const [draft, setDraft] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open || !todo) return;
    setDraft(todo.tags ?? []);
    setInput('');
  }, [open, todo]);

  if (!todo) return null;

  const addTag = () => {
    const next = normalizeTodoTags([...draft, input]);
    if (next.length === draft.length && input.trim()) return;
    setDraft(next);
    setInput('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(todo.id, draft);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tags</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">{todo.title}</p>

        {todo.tags?.length ? (
          <p className="text-sm text-muted-foreground">Current: {formatTagsLabel(todo.tags)}</p>
        ) : null}

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="work, errands…"
            maxLength={MAX_TAG_LENGTH}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addTag();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addTag}
            disabled={!input.trim() || draft.length >= MAX_TODO_TAGS}
          >
            Add
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Up to {MAX_TODO_TAGS} tags, {MAX_TAG_LENGTH} characters each
        </p>

        {draft.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {draft.map((tag) => (
              <Button
                key={tag}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setDraft(draft.filter((item) => item !== tag))}
              >
                #{tag} ×
              </Button>
            ))}
          </div>
        ) : null}

        <DialogFooter>
          <Button onClick={() => void handleSave()} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save tags'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
