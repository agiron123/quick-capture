import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'quick-capture.db';

let database: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (database) return database;
  if (!initPromise) {
    initPromise = openAndMigrate();
  }
  return initPromise;
}

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL,
      created_at TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      note_image_uri TEXT,
      note_audio_uri TEXT,
      transcript TEXT
    );
  `);

  await migrateSortOrderColumn(db);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_todos_sort_order ON todos (sort_order ASC);
  `);

  await migrateLegacyLocalStorage(db);

  database = db;
  return db;
}

async function migrateSortOrderColumn(db: SQLite.SQLiteDatabase): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(todos)');
  if (columns.some((column) => column.name === 'sort_order')) return;

  await db.execAsync('ALTER TABLE todos ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0');

  const rows = await db.getAllAsync<{ id: string }>(
    'SELECT id FROM todos ORDER BY created_at DESC'
  );

  await db.withTransactionAsync(async () => {
    for (let index = 0; index < rows.length; index++) {
      await db.runAsync('UPDATE todos SET sort_order = ? WHERE id = ?', [index, rows[index].id]);
    }
  });
}

async function migrateLegacyLocalStorage(db: SQLite.SQLiteDatabase): Promise<void> {
  try {
    await import('expo-sqlite/localStorage/install');

    if (typeof globalThis.localStorage === 'undefined') return;

    const legacyKey = 'quick-capture:todos';
    const raw = globalThis.localStorage.getItem(legacyKey);
    if (!raw) return;

    const count = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM todos'
    );
    if ((count?.count ?? 0) > 0) {
      globalThis.localStorage.removeItem(legacyKey);
      return;
    }

    const legacyTodos = JSON.parse(raw) as Array<{
      id: string;
      title: string;
      completed: boolean;
      source: string;
      createdAt: string;
      sortOrder?: number;
      noteImageUri?: string;
      noteAudioUri?: string;
      transcript?: string;
    }>;

    if (!Array.isArray(legacyTodos) || legacyTodos.length === 0) return;

    await db.withTransactionAsync(async () => {
      for (const [index, todo] of legacyTodos.entries()) {
        await db.runAsync(
          `INSERT INTO todos (
            id, title, completed, source, created_at, sort_order,
            note_image_uri, note_audio_uri, transcript
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            todo.id,
            todo.title,
            todo.completed ? 1 : 0,
            todo.source,
            todo.createdAt,
            todo.sortOrder ?? index,
            todo.noteImageUri ?? null,
            todo.noteAudioUri ?? null,
            todo.transcript ?? null,
          ]
        );
      }
    });

    globalThis.localStorage.removeItem(legacyKey);
  } catch {
    // Legacy polyfill unavailable (e.g. some web builds) — skip migration.
  }
}
