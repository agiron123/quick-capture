import { exportTodosAsText } from '@quick-capture/shared';
import { Share } from 'react-native';

import type { Todo } from '@/types/todo';

export async function shareTodosAsText(todos: Todo[], listName?: string): Promise<void> {
  const message = exportTodosAsText(todos, { listName });
  await Share.share({ message });
}
