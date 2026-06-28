'use client';

import { Mic, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { signOutAction } from '@/app/auth/actions';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useLists } from '@/hooks/use-lists';

type AppShellProps = {
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  showMicFab?: boolean;
  onManageLists?: () => void;
};

export function AppShell({
  children,
  headerRight,
  showMicFab = true,
  onManageLists,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { lists, activeListId, setActiveListId, isLoading: listsLoading } = useLists();

  const activeList = lists.find((list) => list.id === activeListId);

  return (
    <div className="flex min-h-full flex-col pb-20">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
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
                {onManageLists ? (
                  <DropdownMenuItem onClick={onManageLists}>Manage lists…</DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="flex items-center gap-2">
          {headerRight}
          <ThemeToggle />
          <form action={signOutAction}>
            <Button variant="ghost" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </header>

      <nav className="flex items-center gap-2 border-b px-4 py-2">
        <Button asChild variant={pathname === '/' ? 'secondary' : 'ghost'} size="sm">
          <Link href="/">Todos</Link>
        </Button>
        <Button asChild variant={pathname === '/capture' ? 'secondary' : 'ghost'} size="sm">
          <Link href="/capture">Capture</Link>
        </Button>
        <Button asChild variant={pathname === '/voice' ? 'secondary' : 'ghost'} size="sm">
          <Link href="/voice">Voice</Link>
        </Button>
        <Button asChild variant={pathname === '/devices' ? 'secondary' : 'ghost'} size="sm">
          <Link href="/devices">Devices</Link>
        </Button>
      </nav>

      {children}

      {showMicFab ? (
        <Button
          className="fixed bottom-6 left-1/2 size-14 -translate-x-1/2 rounded-full shadow-lg"
          onClick={() => router.push('/voice')}
          aria-label="Record voice note"
        >
          <Mic className="size-6" />
        </Button>
      ) : null}
    </div>
  );
}

export function HeaderAddButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      <Plus className="mr-1 size-4" />
      Add
    </Button>
  );
}
