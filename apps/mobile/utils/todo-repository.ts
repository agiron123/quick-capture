import type { Todo, TodoPriority, TodoSource } from '@/types/todo';
import { getDatabase } from '@/utils/db';

type TodoRow = {
  id: string;
  title: string;
  completed: number;
  source: string;
  list_id: string;
  created_at: string;
  updated_at: string | null;
  due_at: string | null;
  priority: string | null;
  sort_order: number;
  reminder_at: string | null;
  notification_id: string | null;
  note_image_uri: string | null;
  note_audio_uri: string | null;
  transcript: string | null;
};

function parsePriority(value: string | null): TodoPriority | undefined {
  if (value === 'low' || value === 'medium' || value === 'high') return value;
  return undefined;
}

function rowToTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed === 1,
    source: row.source as TodoSource,
    listId: row.list_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
    dueAt: row.due_at ?? undefined,
    priority: parsePriority(row.priority),
    sortOrder: row.sort_order,
    reminderAt: row.reminder_at ?? undefined,
    notificationId: row.notification_id ?? undefined,
    noteImageUri: row.note_image_uri ?? undefined,
    noteAudioUri: row.note_audio_uri ?? undefined,
    transcript: row.transcript ?? undefined,
  };
}

export async function fetchAllTodos(): Promise<Todo[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TodoRow>(
    'SELECT * FROM todos ORDER BY sort_order ASC, created_at DESC'
  );
  return rows.map(rowToTodo);
}

export async function insertTodo(todo: Todo): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO todos (
      id, title, completed, source, list_id, created_at, updated_at, due_at, priority, sort_order,
      reminder_at, notification_id,
      note_image_uri, note_audio_uri, transcript
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      todo.id,
      todo.title,
      todo.completed ? 1 : 0,
      todo.source,
      todo.listId,
      todo.createdAt,
      todo.updatedAt ?? todo.createdAt,
      todo.dueAt ?? null,
      todo.priority ?? null,
      todo.sortOrder,
      todo.reminderAt ?? null,
      todo.notificationId ?? null,
      todo.noteImageUri ?? null,
      todo.noteAudioUri ?? null,
      todo.transcript ?? null,
    ]
  );
}

export async function insertTodos(todos: Todo[]): Promise<void> {
  if (todos.length === 0) return;
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (const todo of todos) {
      await db.runAsync(
        `INSERT INTO todos (
          id, title, completed, source, list_id, created_at, updated_at, due_at, priority, sort_order,
          reminder_at, notification_id,
          note_image_uri, note_audio_uri, transcript
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          todo.id,
          todo.title,
          todo.completed ? 1 : 0,
          todo.source,
          todo.listId,
          todo.createdAt,
          todo.updatedAt ?? todo.createdAt,
          todo.dueAt ?? null,
          todo.priority ?? null,
          todo.sortOrder,
          todo.reminderAt ?? null,
          todo.notificationId ?? null,
          todo.noteImageUri ?? null,
          todo.noteAudioUri ?? null,
          todo.transcript ?? null,
        ]
      );
    }
  });
}

export async function updateTodoPriority(id: string, priority: string | null): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE todos SET priority = ? WHERE id = ?', [priority, id]);
}

export async function updateTodoDueAt(id: string, dueAt: string | null): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE todos SET due_at = ? WHERE id = ?', [dueAt, id]);
}

export async function updateTodoUpdatedAt(id: string, updatedAt: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE todos SET updated_at = ? WHERE id = ?', [updatedAt, id]);
}

export async function updateTodoCompleted(id: string, completed: boolean): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE todos SET completed = ? WHERE id = ?', [completed ? 1 : 0, id]);
}

export async function updateTodoReminder(
  id: string,
  reminderAt: string | null,
  notificationId: string | null
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE todos SET reminder_at = ?, notification_id = ? WHERE id = ?',
    [reminderAt, notificationId, id]
  );
}

export async function updateTodoNotificationId(
  id: string,
  notificationId: string | null
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE todos SET notification_id = ? WHERE id = ?', [notificationId, id]);
}

export async function clearTodoReminder(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE todos SET reminder_at = NULL, notification_id = NULL WHERE id = ?',
    [id]
  );
}

export async function updateTodosOrder(todos: Todo[]): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (let index = 0; index < todos.length; index++) {
      await db.runAsync('UPDATE todos SET sort_order = ? WHERE id = ?', [index, todos[index].id]);
    }
  });
}

export async function deleteTodoById(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM todos WHERE id = ?', [id]);
}

export async function deleteTodosByListId(listId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM todos WHERE list_id = ?', [listId]);
}

export async function replaceAllTodos(todos: Todo[]): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM todos');
    for (const todo of todos) {
      await db.runAsync(
        `INSERT INTO todos (
          id, title, completed, source, list_id, created_at, updated_at, due_at, priority, sort_order,
          reminder_at, notification_id,
          note_image_uri, note_audio_uri, transcript
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          todo.id,
          todo.title,
          todo.completed ? 1 : 0,
          todo.source,
          todo.listId,
          todo.createdAt,
          todo.updatedAt ?? todo.createdAt,
          todo.dueAt ?? null,
          todo.priority ?? null,
          todo.sortOrder,
          todo.reminderAt ?? null,
          todo.notificationId ?? null,
          todo.noteImageUri ?? null,
          todo.noteAudioUri ?? null,
          todo.transcript ?? null,
        ]
      );
    }
  });
}
