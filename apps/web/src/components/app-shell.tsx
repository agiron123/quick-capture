'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { AppSidebar } from '@/components/app-sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth/client';

type AppShellProps = {
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  showMicFab?: boolean;
  onManageLists?: () => void;
};

export function AppShell({
  children,
  headerRight,
  showMicFab: _showMicFab = true,
  onManageLists,
}: AppShellProps) {
  const router = useRouter();
  const [signingOut, startSignOut] = useTransition();

  const handleSignOut = () => {
    startSignOut(async () => {
      if (authClient) {
        await authClient.signOut();
      }
      router.push('/auth/sign-in');
      router.refresh();
    });
  };

  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <AppSidebar onManageLists={onManageLists} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger aria-label="Toggle navigation" />
          <div className="ml-auto flex items-center gap-2">
            {headerRight}
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              type="button"
              disabled={signingOut}
              onClick={handleSignOut}
            >
              {signingOut ? 'Signing out…' : 'Sign out'}
            </Button>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="flex min-h-0 flex-1 flex-col outline-none">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
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
