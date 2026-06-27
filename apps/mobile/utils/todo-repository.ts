import type { Todo, TodoSource } from '@/types/todo';
import { getDatabase } from '@/utils/db';

type TodoRow = {
  id: string;
  title: string;
  completed: number;
  source: string;
  created_at: string;
  note_image_uri: string | null;
  note_audio_uri: string | null;
  transcript: string | null;
};

function rowToTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed === 1,
    source: row.source as TodoSource,
    createdAt: row.created_at,
    noteImageUri: row.note_image_uri ?? undefined,
    noteAudioUri: row.note_audio_uri ?? undefined,
    transcript: row.transcript ?? undefined,
  };
}

export async function fetchAllTodos(): Promise<Todo[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TodoRow>(
    'SELECT * FROM todos ORDER BY created_at DESC'
  );
  return rows.map(rowToTodo);
}

export async function insertTodo(todo: Todo): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO todos (
      id, title, completed, source, created_at,
      note_image_uri, note_audio_uri, transcript
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      todo.id,
      todo.title,
      todo.completed ? 1 : 0,
      todo.source,
      todo.createdAt,
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
          id, title, completed, source, created_at,
          note_image_uri, note_audio_uri, transcript
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          todo.id,
          todo.title,
          todo.completed ? 1 : 0,
          todo.source,
          todo.createdAt,
          todo.noteImageUri ?? null,
          todo.noteAudioUri ?? null,
          todo.transcript ?? null,
        ]
      );
    }
  });
}

export async function updateTodoCompleted(id: string, completed: boolean): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE todos SET completed = ? WHERE id = ?', [completed ? 1 : 0, id]);
}

export async function deleteTodoById(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM todos WHERE id = ?', [id]);
}
