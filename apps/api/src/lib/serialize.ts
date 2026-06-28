import type { Todo, TodoListRecord, TodoSource } from '@quick-capture/shared';

import type { captures, todoLists, todos } from '../db/schema.js';

type TodoListRow = typeof todoLists.$inferSelect;
type TodoRow = typeof todos.$inferSelect;
type CaptureRow = typeof captures.$inferSelect;

export function serializeList(row: TodoListRow): TodoListRecord {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
  };
}

export function serializeTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    source: row.source as TodoSource,
    listId: row.listId,
    createdAt: row.createdAt,
    sortOrder: row.sortOrder,
    reminderAt: row.reminderAt ?? undefined,
    transcript: row.transcript ?? undefined,
    captureId: row.captureId ?? undefined,
  };
}

export type SerializedCapture = {
  id: string;
  userId: string;
  source: TodoSource;
  transcript?: string;
  mediaKey?: string;
  mediaMimeType?: string;
  createdAt: string;
  updatedAt: string;
};

export function serializeCapture(row: CaptureRow): SerializedCapture {
  return {
    id: row.id,
    userId: row.userId,
    source: row.source as TodoSource,
    transcript: row.transcript ?? undefined,
    mediaKey: row.mediaKey ?? undefined,
    mediaMimeType: row.mediaMimeType ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
