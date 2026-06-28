'use client';

import { Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { copyTodosAsText, downloadTodosAsJson } from '@/lib/export-todos';
import type { Todo } from '@quick-capture/shared';

type ExportTodosMenuProps = {
  todos: Todo[];
  listName?: string;
};

export function ExportTodosMenu({ todos, listName }: ExportTodosMenuProps) {
  const disabled = todos.length === 0;

  const handleCopy = async () => {
    try {
      await copyTodosAsText(todos, listName);
      toast.success('Copied todo list to clipboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not copy todos');
    }
  };

  const handleDownload = () => {
    try {
      downloadTodosAsJson(todos, listName);
      toast.success('Downloaded todo list as JSON');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not download todos');
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => void handleCopy()}
      >
        <Share2 className="mr-1.5 size-4" />
        Copy text
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={handleDownload}
      >
        <Download className="mr-1.5 size-4" />
        JSON
      </Button>
    </div>
  );
}
