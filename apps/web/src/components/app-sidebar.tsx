'use client';

import {
  Camera,
  CheckSquare,
  List,
  MessageSquare,
  Mic,
  Smartphone,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { useLists } from '@/hooks/use-lists';
import { APP_NAV_ITEMS } from '@/lib/app-nav';

const NAV_ITEMS = APP_NAV_ITEMS.map((item) => ({
  ...item,
  icon:
    item.href === '/'
      ? CheckSquare
      : item.href === '/capture'
        ? Camera
        : item.href === '/voice'
          ? Mic
          : item.href === '/chat'
            ? MessageSquare
            : Smartphone,
}));

type AppSidebarProps = {
  onManageLists?: () => void;
};

export function AppSidebar({ onManageLists }: AppSidebarProps) {
  const pathname = usePathname();
  const { lists, activeListId, setActiveListId, isLoading: listsLoading } = useLists();

  const activeList = lists.find((list) => list.id === activeListId);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-2">
        <p className="truncate px-2 py-1 text-sm font-semibold group-data-[collapsible=icon]:hidden">
          Quick Capture
        </p>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigate</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={match(pathname)} tooltip={label}>
                    <Link href={href} aria-current={match(pathname) ? 'page' : undefined}>
                      <Icon aria-hidden />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>List</SidebarGroupLabel>
          <SidebarGroupContent className="px-2 group-data-[collapsible=icon]:px-0">
            {listsLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-2"
                    aria-label={`Active list: ${activeList?.name ?? 'Inbox'}`}
                  >
                    <List className="size-4 shrink-0 group-data-[collapsible=icon]:mx-auto" aria-hidden />
                    <span className="truncate group-data-[collapsible=icon]:sr-only">
                      {activeList?.name ?? 'Inbox'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Record voice note">
              <Link href="/voice">
                <Mic aria-hidden />
                <span>Quick capture</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
