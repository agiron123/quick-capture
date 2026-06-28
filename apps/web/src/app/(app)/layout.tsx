import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quick Capture',
  description: 'Web companion for Quick Capture todos',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-full flex-1">{children}</div>;
}
