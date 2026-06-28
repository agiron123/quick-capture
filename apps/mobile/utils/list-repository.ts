import type { TodoListRecord } from '@/types/list';
import { getDatabase } from '@/utils/db';

type ListRow = {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
};

function rowToList(row: ListRow): TodoListRecord {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export async function fetchAllLists(): Promise<TodoListRecord[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ListRow>(
    'SELECT * FROM todo_lists ORDER BY sort_order ASC, created_at ASC'
  );
  return rows.map(rowToList);
}

export async function insertList(list: TodoListRecord): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO todo_lists (id, name, sort_order, created_at) VALUES (?, ?, ?, ?)',
    [list.id, list.name, list.sortOrder, list.createdAt]
  );
}

export async function updateListName(id: string, name: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE todo_lists SET name = ? WHERE id = ?', [name, id]);
}

export async function deleteListById(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM todo_lists WHERE id = ?', [id]);
}

export async function moveTodosToList(fromListId: string, toListId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE todos SET list_id = ? WHERE list_id = ?', [toListId, fromListId]);
}

export async function countLists(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM todo_lists');
  return row?.count ?? 0;
}

export async function countTodosInList(listId: string): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM todos WHERE list_id = ?',
    [listId]
  );
  return row?.count ?? 0;
}

export async function replaceAllLists(lists: TodoListRecord[]): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM todo_lists');
    for (const list of lists) {
      await db.runAsync(
        'INSERT INTO todo_lists (id, name, sort_order, created_at) VALUES (?, ?, ?, ?)',
        [list.id, list.name, list.sortOrder, list.createdAt]
      );
    }
  });
}
