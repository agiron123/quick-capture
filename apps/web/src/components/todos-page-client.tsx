'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AppShell, HeaderAddButton } from '@/components/app-shell';
import { ManageListsDialog } from '@/components/manage-lists-dialog';
import { SetDueDateDialog } from '@/components/set-due-date-dialog';
import { SetPriorityDialog } from '@/components/set-priority-dialog';
import { SetTagsDialog } from '@/components/set-tags-dialog';
import { SetReminderDialog } from '@/components/set-reminder-dialog';
import { TodoList } from '@/components/todo-list';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useLists } from '@/hooks/use-lists';
import { useNotificationHighlight } from '@/hooks/use-notification-highlight';
import { useTodos } from '@/hooks/use-todos';
import type { Todo } from '@quick-capture/shared';

export function TodosPageClient() {
  const { lists, activeListId, setActiveListId, isLoading: listsLoading } = useLists();
  const highlightTodoId = useNotificationHighlight(setActiveListId);
  const {
    todos,
    isLoading,
    toggleTodo,
    deleteTodo,
    addTodo,
    reorderTodos,
    setReminder,
    setDueDate,
    setPriority,
    setTags,
  } = useTodos(activeListId);

  const [addOpen, setAddOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [reminderTodo, setReminderTodo] = useState<Todo | null>(null);
  const [dueDateTodo, setDueDateTodo] = useState<Todo | null>(null);
  const [priorityTodo, setPriorityTodo] = useState<Todo | null>(null);
  const [tagsTodo, setTagsTodo] = useState<Todo | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const activeList = useMemo(
    () => lists.find((list) => list.id === activeListId),
    [lists, activeListId]
  );

  const pendingCount = todos.filter((todo) => !todo.completed).length;

  const handleAddTodo = async () => {
    const title = newTitle.trim();
    if (!title) return;

    try {
      await addTodo(title);
      setNewTitle('');
      setAddOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not add todo');
    }
  };

  return (
    <>
      <AppShell
        onManageLists={() => setManageOpen(true)}
        headerRight={<HeaderAddButton onClick={() => setAddOpen(true)} />}
      >
        {todos.length > 0 ? (
          <p className="px-4 pt-3 text-sm text-muted-foreground">
            {pendingCount} open · {todos.length - pendingCount} done
          </p>
        ) : null}

        {isLoading || listsLoading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <TodoList
            listName={activeList?.name}
            todos={todos}
            highlightTodoId={highlightTodoId}
            onToggle={(id) => void toggleTodo(id)}
            onDelete={(id) => void deleteTodo(id)}
            onSetReminder={setReminderTodo}
            onSetDueDate={setDueDateTodo}
            onSetPriority={setPriorityTodo}
            onSetTags={setTagsTodo}
            onReorder={(todoIds) => void reorderTodos(todoIds)}
          />
        )}
      </AppShell>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add todo</DialogTitle>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="What needs to be done?"
            onKeyDown={(event) => {
              if (event.key === 'Enter') void handleAddTodo();
            }}
          />
          <DialogFooter>
            <Button onClick={() => void handleAddTodo()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ManageListsDialog open={manageOpen} onOpenChange={setManageOpen} />

      <SetReminderDialog
        todo={reminderTodo}
        open={Boolean(reminderTodo)}
        onOpenChange={(open) => {
          if (!open) setReminderTodo(null);
        }}
        onSave={setReminder}
      />

      <SetDueDateDialog
        todo={dueDateTodo}
        open={Boolean(dueDateTodo)}
        onOpenChange={(open) => {
          if (!open) setDueDateTodo(null);
        }}
        onSave={setDueDate}
      />

      <SetPriorityDialog
        todo={priorityTodo}
        open={Boolean(priorityTodo)}
        onOpenChange={(open) => {
          if (!open) setPriorityTodo(null);
        }}
        onSave={setPriority}
      />

      <SetTagsDialog
        todo={tagsTodo}
        open={Boolean(tagsTodo)}
        onOpenChange={(open) => {
          if (!open) setTagsTodo(null);
        }}
        onSave={setTags}
      />
    </>
  );
}
