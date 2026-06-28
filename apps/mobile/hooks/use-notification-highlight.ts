import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { consumeNotificationTarget } from '@/services/notification-target';
import { useLists } from '@/hooks/use-lists';

export function useNotificationHighlight(): string | null {
  const { setActiveList } = useLists();
  const [highlightTodoId, setHighlightTodoId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const target = consumeNotificationTarget();
      if (!target) return;

      if (target.listId) {
        setActiveList(target.listId);
      }

      setHighlightTodoId(target.todoId);
      const timer = setTimeout(() => setHighlightTodoId(null), 4000);
      return () => clearTimeout(timer);
    }, [setActiveList])
  );

  return highlightTodoId;
}
