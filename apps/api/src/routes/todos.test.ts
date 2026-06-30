import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Hono } from 'hono';

import type { AuthVariables } from '../middleware/auth.js';
import { todoRoutes } from './todos.js';

type TodoRow = {
  id: string;
  userId: string;
  listId: string;
  parentId: string | null;
  title: string;
  completed: boolean;
  source: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  dueAt: string | null;
  priority: string | null;
  tags: string[] | null;
  reminderAt: string | null;
  reminderSentAt: string | null;
  transcript: string | null;
  captureId: string | null;
};

let todoRow: TodoRow | undefined;

function createSelectChain() {
  return {
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        limit: vi.fn(async () => (todoRow ? [todoRow] : [])),
        orderBy: vi.fn(async () => (todoRow ? [todoRow] : [])),
      })),
      orderBy: vi.fn(() => ({
        limit: vi.fn(async () => []),
      })),
    })),
  };
}

const mockDb = {
  select: vi.fn(() => createSelectChain()),
  update: vi.fn(() => ({
    set: vi.fn((updates: Partial<TodoRow>) => ({
      where: vi.fn(async () => {
        if (todoRow) {
          todoRow = { ...todoRow, ...updates };
        }
      }),
    })),
  })),
};

vi.mock('../db/client.js', () => ({
  isDatabaseConfigured: () => true,
  getDatabase: () => mockDb,
}));

vi.mock('../services/lists.js', () => ({
  ensureDefaultList: vi.fn(async () => undefined),
  getUserList: vi.fn(async () => ({ id: 'inbox', name: 'Inbox', sortOrder: 0, createdAt: '' })),
}));

vi.mock('../middleware/auth.js', () => ({
  authMiddleware: async (c: { set: (key: 'userId', value: string) => void }, next: () => Promise<void>) => {
    c.set('userId', 'test-user');
    await next();
  },
}));

describe('PATCH /:id conflict handling', () => {
  beforeEach(() => {
    todoRow = {
      id: 'todo-1',
      userId: 'test-user',
      listId: 'inbox',
      parentId: null,
      title: 'Server title',
      completed: false,
      source: 'manual',
      sortOrder: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      dueAt: null,
      priority: null,
      tags: null,
      reminderAt: null,
      reminderSentAt: null,
      transcript: null,
      captureId: null,
    };
    mockDb.select.mockClear();
    mockDb.update.mockClear();
  });

  it('returns 409 when baseUpdatedAt does not match', async () => {
    const app = new Hono<{ Variables: AuthVariables }>();
    app.route('/api/todos', todoRoutes);

    const response = await app.request('/api/todos/todo-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Local edit',
        baseUpdatedAt: '2026-01-01T00:00:00.000Z',
      }),
    });

    expect(response.status).toBe(409);
    const body = (await response.json()) as { error: string; todo: { title: string } };
    expect(body.error).toBe('Conflict');
    expect(body.todo.title).toBe('Server title');
    expect(mockDb.update).not.toHaveBeenCalled();
  });

  it('updates todo when baseUpdatedAt matches', async () => {
    const app = new Hono<{ Variables: AuthVariables }>();
    app.route('/api/todos', todoRoutes);

    const response = await app.request('/api/todos/todo-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Updated title',
        baseUpdatedAt: '2026-01-02T00:00:00.000Z',
      }),
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as { todo: { title: string } };
    expect(body.todo.title).toBe('Updated title');
    expect(mockDb.update).toHaveBeenCalled();
  });

  it('returns 400 for invalid payload', async () => {
    const app = new Hono<{ Variables: AuthVariables }>();
    app.route('/api/todos', todoRoutes);

    const response = await app.request('/api/todos/todo-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '' }),
    });

    expect(response.status).toBe(400);
  });
});
