import { Suspense } from 'react';

import { TodosPageClient } from '@/components/todos-page-client';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3 p-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      }
    >
      <TodosPageClient />
    </Suspense>
  );
}
