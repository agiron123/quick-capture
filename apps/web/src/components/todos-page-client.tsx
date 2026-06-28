'use client';

import { Camera, CheckSquare, Mic, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { signOutAction } from '@/app/auth/actions';
import { TodoList } from '@/components/todo-list';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useLists } from '@/hooks/use-lists';
import { useTodos } from '@/hooks/use-todos';

export function TodosPageClient() {
  const router = useRouter();
  const { lists, activeListId, setActiveListId, isLoading: listsLoading } = useLists();
  const { todos, isLoading, toggleTodo, deleteTodo, addTodo } = useTodos(activeListId);
  const [addOpen, setAddOpen] = useState(false);
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
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="size-5" />
          {listsLoading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">{activeList?.name ?? 'Inbox'}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {lists.map((list) => (
                  <DropdownMenuItem key={list.id} onClick={() => setActiveListId(list.id)}>
                    {list.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1 size-4" />
            Add
          </Button>
          <form action={signOutAction}>
            <Button variant="ghost" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </header>

      <nav className="flex items-center gap-2 border-b px-4 py-2">
        <Button asChild variant="secondary" size="sm">
          <Link href="/">
            <CheckSquare className="mr-1 size-4" />
            Todos
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/capture">
            <Camera className="mr-1 size-4" />
            Capture
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/voice">
            <Mic className="mr-1 size-4" />
            Voice
          </Link>
        </Button>
      </nav>

      {todos.length > 0 ? (
        <p className="px-4 pt-3 text-sm text-muted-foreground">
          {pendingCount} open · {todos.length - pendingCount} done
        </p>
      ) : null}

      {isLoading ? (
        <div className="space-y-3 p-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <TodoList
          listName={activeList?.name}
          todos={todos}
          onToggle={(id) => void toggleTodo(id)}
          onDelete={(id) => void deleteTodo(id)}
        />
      )}

      <Button
        className="fixed bottom-6 left-1/2 size-14 -translate-x-1/2 rounded-full shadow-lg"
        onClick={() => router.push('/voice')}
        aria-label="Record voice note"
      >
        <Mic className="size-6" />
      </Button>

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
    </div>
  );
}
