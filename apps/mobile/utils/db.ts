import * as SQLite from 'expo-sqlite';

import { ACTIVE_LIST_SETTING_KEY, DEFAULT_LIST_ID, DEFAULT_LIST_NAME } from '@/constants/lists';

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

    CREATE TABLE IF NOT EXISTS todo_lists (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL,
      list_id TEXT NOT NULL DEFAULT '${DEFAULT_LIST_ID}',
      created_at TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      note_image_uri TEXT,
      note_audio_uri TEXT,
      transcript TEXT,
      reminder_at TEXT,
      notification_id TEXT,
      FOREIGN KEY (list_id) REFERENCES todo_lists(id)
    );
  `);

  await migrateSortOrderColumn(db);
  await migrateListIdColumn(db);
  await migrateReminderColumns(db);
  await migrateUpdatedAtColumn(db);
  await migrateDueAtColumn(db);
  await migratePriorityColumn(db);
  await ensureDefaultList(db);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_todos_sort_order ON todos (sort_order ASC);
    CREATE INDEX IF NOT EXISTS idx_todos_list_id ON todos (list_id ASC);
    CREATE INDEX IF NOT EXISTS idx_todo_lists_sort_order ON todo_lists (sort_order ASC);
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

async function migrateReminderColumns(db: SQLite.SQLiteDatabase): Promise<void> {
  let columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(todos)');
  if (!columns.some((column) => column.name === 'reminder_at')) {
    await db.execAsync('ALTER TABLE todos ADD COLUMN reminder_at TEXT');
  }
  columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(todos)');
  if (!columns.some((column) => column.name === 'notification_id')) {
    await db.execAsync('ALTER TABLE todos ADD COLUMN notification_id TEXT');
  }
}

async function migrateUpdatedAtColumn(db: SQLite.SQLiteDatabase): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(todos)');
  if (columns.some((column) => column.name === 'updated_at')) return;

  await db.execAsync('ALTER TABLE todos ADD COLUMN updated_at TEXT');
  await db.runAsync('UPDATE todos SET updated_at = created_at WHERE updated_at IS NULL');
}

async function migrateDueAtColumn(db: SQLite.SQLiteDatabase): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(todos)');
  if (columns.some((column) => column.name === 'due_at')) return;

  await db.execAsync('ALTER TABLE todos ADD COLUMN due_at TEXT');
}

async function migratePriorityColumn(db: SQLite.SQLiteDatabase): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(todos)');
  if (columns.some((column) => column.name === 'priority')) return;

  await db.execAsync('ALTER TABLE todos ADD COLUMN priority TEXT');
}

async function migrateListIdColumn(db: SQLite.SQLiteDatabase): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(todos)');
  if (columns.some((column) => column.name === 'list_id')) return;

  await ensureDefaultList(db);
  await db.execAsync(`ALTER TABLE todos ADD COLUMN list_id TEXT NOT NULL DEFAULT '${DEFAULT_LIST_ID}'`);
  await db.runAsync('UPDATE todos SET list_id = ? WHERE list_id IS NULL OR list_id = ?', [
    DEFAULT_LIST_ID,
    '',
  ]);
}

async function ensureDefaultList(db: SQLite.SQLiteDatabase): Promise<void> {
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM todo_lists WHERE id = ?',
    [DEFAULT_LIST_ID]
  );

  if (!existing) {
    await db.runAsync(
      'INSERT INTO todo_lists (id, name, sort_order, created_at) VALUES (?, ?, 0, ?)',
      [DEFAULT_LIST_ID, DEFAULT_LIST_NAME, new Date().toISOString()]
    );
  }

  await db.runAsync('INSERT OR IGNORE INTO app_settings (key, value) VALUES (?, ?)', [
    ACTIVE_LIST_SETTING_KEY,
    DEFAULT_LIST_ID,
  ]);
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

    await ensureDefaultList(db);

    const legacyTodos = JSON.parse(raw) as Array<{
      id: string;
      title: string;
      completed: boolean;
      source: string;
      createdAt: string;
      sortOrder?: number;
      listId?: string;
      noteImageUri?: string;
      noteAudioUri?: string;
      transcript?: string;
    }>;

    if (!Array.isArray(legacyTodos) || legacyTodos.length === 0) return;

    await db.withTransactionAsync(async () => {
      for (const [index, todo] of legacyTodos.entries()) {
        await db.runAsync(
          `INSERT INTO todos (
            id, title, completed, source, list_id, created_at, sort_order,
            note_image_uri, note_audio_uri, transcript
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            todo.id,
            todo.title,
            todo.completed ? 1 : 0,
            todo.source,
            todo.listId ?? DEFAULT_LIST_ID,
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

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    [key]
  );
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, value]
  );
}
