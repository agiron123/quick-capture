'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useNotificationHighlight(setActiveListId: (listId: string) => void): string | null {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [highlightTodoId, setHighlightTodoId] = useState<string | null>(null);

  useEffect(() => {
    const todoId = searchParams.get('highlight');
    if (!todoId) return;

    const listId = searchParams.get('listId');
    if (listId) {
      setActiveListId(listId);
    }

    setHighlightTodoId(todoId);
    router.replace('/', { scroll: false });

    const timer = setTimeout(() => setHighlightTodoId(null), 4000);
    return () => clearTimeout(timer);
  }, [searchParams, setActiveListId, router]);

  return highlightTodoId;
}
