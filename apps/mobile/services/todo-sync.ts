import { fetchListsFromApi, fetchTodosFromApi } from '@/services/sync-api-client';
import { isServerRemindersEnabled } from '@/services/sync-mode';
import * as listRepository from '@/utils/list-repository';
import { refreshListsFromDb } from '@/utils/list-store';
import * as todoRepository from '@/utils/todo-repository';
import { refreshTodosFromDb } from '@/utils/todo-store';

export async function pullTodosFromServer(): Promise<void> {
  if (!isServerRemindersEnabled()) return;

  const lists = await fetchListsFromApi();
  await listRepository.replaceAllLists(lists);

  const allTodos = [];
  for (const list of lists) {
    const todos = await fetchTodosFromApi(list.id);
    allTodos.push(...todos);
  }

  await todoRepository.replaceAllTodos(allTodos);
  await refreshListsFromDb();
  await refreshTodosFromDb();
}
