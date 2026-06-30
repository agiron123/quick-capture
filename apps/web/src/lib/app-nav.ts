import type { LucideIcon } from 'lucide-react';

export type AppNavItem = {
  href: string;
  label: string;
  match: (path: string) => boolean;
  icon?: LucideIcon;
};

export const APP_NAV_ITEMS: AppNavItem[] = [
  { href: '/', label: 'Todos', match: (path) => path === '/' },
  { href: '/capture', label: 'Capture', match: (path) => path === '/capture' },
  { href: '/voice', label: 'Voice', match: (path) => path === '/voice' },
  { href: '/chat', label: 'Chat', match: (path) => path.startsWith('/chat') },
  { href: '/devices', label: 'Devices', match: (path) => path === '/devices' },
];

export function getActiveAppNavItem(pathname: string): AppNavItem | undefined {
  return APP_NAV_ITEMS.find((item) => item.match(pathname));
}
