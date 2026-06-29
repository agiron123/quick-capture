'use client';

import { MessageSquarePlus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useChatThreads } from '@/hooks/use-chat-threads';
import { cn } from '@/lib/utils';

type ChatThreadSidebarProps = {
  activeThreadId: string | null;
  onNewChat: () => void;
};

export function ChatThreadSidebar({ activeThreadId, onNewChat }: ChatThreadSidebarProps) {
  const { threads, isLoading, deleteThread, isDeleting } = useChatThreads();
  const [search, setSearch] = useState('');

  const filteredThreads = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return threads;
    return threads.filter((thread) => thread.title.toLowerCase().includes(query));
  }, [search, threads]);

  return (
    <aside className="flex w-full flex-col border-r md:w-72 lg:w-80">
      <div className="space-y-2 border-b p-3">
        <Button className="w-full justify-start" variant="outline" onClick={onNewChat}>
          <MessageSquarePlus className="mr-2 size-4" />
          New chat
        </Button>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search chats…"
            className="pl-8"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="space-y-2 p-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredThreads.length === 0 ? (
          <p className="text-muted-foreground p-3 text-sm">No chats yet.</p>
        ) : (
          <ul className="space-y-1">
            {filteredThreads.map((thread) => (
              <li key={thread.id} className="group flex items-center gap-1">
                <Button
                  asChild
                  variant={activeThreadId === thread.id ? 'secondary' : 'ghost'}
                  className={cn('h-auto min-h-10 flex-1 justify-start px-3 py-2 text-left')}
                >
                  <Link href={`/chat/${thread.id}`}>
                    <span className="line-clamp-2 text-sm">{thread.title}</span>
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 group-hover:opacity-100"
                  disabled={isDeleting}
                  aria-label={`Delete ${thread.title}`}
                  onClick={() => void deleteThread(thread.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
