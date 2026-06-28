import {
    boolean,
    index,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core';

export const todoLists = pgTable(
  'todo_lists',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    name: text('name').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('idx_todo_lists_user_id').on(table.userId)]
);

export const captures = pgTable(
  'captures',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    source: text('source').notNull(),
    transcript: text('transcript'),
    mediaKey: text('media_key'),
    mediaMimeType: text('media_mime_type'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('idx_captures_user_id').on(table.userId)]
);

export const todos = pgTable(
  'todos',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    listId: text('list_id')
      .notNull()
      .references(() => todoLists.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    completed: boolean('completed').notNull().default(false),
    source: text('source').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    dueAt: timestamp('due_at', { withTimezone: true, mode: 'string' }),
    reminderAt: timestamp('reminder_at', { withTimezone: true, mode: 'string' }),
    reminderSentAt: timestamp('reminder_sent_at', {
      withTimezone: true,
      mode: 'string',
    }),
    transcript: text('transcript'),
    captureId: uuid('capture_id').references(() => captures.id, {
      onDelete: 'set null',
    }),
  },
  (table) => [
    index('idx_todos_user_id').on(table.userId),
    index('idx_todos_list_id').on(table.listId),
    index('idx_todos_sort_order').on(table.sortOrder),
  ]
);

export const userDevices = pgTable(
  'user_devices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    platform: text('platform').notNull(),
    pushToken: text('push_token').notNull(),
    pushProvider: text('push_provider').notNull(),
    deviceName: text('device_name'),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('idx_user_devices_user_id').on(table.userId)]
);
