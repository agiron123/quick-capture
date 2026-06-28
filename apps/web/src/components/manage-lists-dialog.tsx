'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useLists } from '@/hooks/use-lists';
import { DEFAULT_LIST_ID } from '@/lib/constants';

type ManageListsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ManageListsDialog({ open, onOpenChange }: ManageListsDialogProps) {
  const { lists, activeListId, setActiveListId, createList, deleteList } = useLists();
  const [newListName, setNewListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    const trimmed = newListName.trim();
    if (!trimmed) return;

    setIsCreating(true);
    try {
      await createList(trimmed);
      setNewListName('');
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create list');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (listId: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? Todos will move to Inbox.`)) return;

    try {
      await deleteList(listId);
      if (activeListId === listId) {
        setActiveListId(DEFAULT_LIST_ID);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete list');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage lists</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">New list</p>
          <div className="flex gap-2">
            <Input
              value={newListName}
              onChange={(event) => setNewListName(event.target.value)}
              placeholder="List name"
              onKeyDown={(event) => {
                if (event.key === 'Enter') void handleCreate();
              }}
            />
            <Button onClick={() => void handleCreate()} disabled={isCreating || !newListName.trim()}>
              Add
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Your lists</p>
          {lists.map((list) => {
            const isActive = list.id === activeListId;
            const canDelete = list.id !== DEFAULT_LIST_ID;

            return (
              <div
                key={list.id}
                className="flex items-center gap-3 rounded-xl border bg-card p-3"
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => {
                    setActiveListId(list.id);
                    onOpenChange(false);
                  }}
                >
                  <p className="font-medium">{list.name}</p>
                </button>
                {isActive ? <span className="text-sm text-primary">Active</span> : null}
                {canDelete ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => void handleDelete(list.id, list.name)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
