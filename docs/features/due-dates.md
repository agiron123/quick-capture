# Due dates

**Status:** Shipped  
**Phase:** 3

## Problem

Todos need a **due date** separate from **reminders**. A due date marks when work should be finished; a reminder fires a notification at a specific time.

## Field

| Field | Synced | Purpose |
| --- | --- | --- |
| `dueAt` | Yes (API + mobile SQLite) | ISO datetime; stored as end of selected local day (23:59) |
| `reminderAt` | Yes | Push notification time (see [scheduled-reminders.md](./scheduled-reminders.md)) |

## User flow

1. Open todo list → tap **calendar** on a todo
2. Pick Today / Tomorrow / Next week or choose a date
3. Save — label shows on the row (`Due today`, `Due Mar 5`, `Overdue · Mar 3`)
4. Clear due date from the same dialog

Reminders use the **bell** affordance; due dates use **calendar**.

## Implementation

| Layer | Notes |
| --- | --- |
| `packages/shared` | `dueAt` on `Todo`; `createTodoSchema` / `updateTodoSchema` |
| `apps/api` | `todos.due_at` column; migration `0002_todos_due_at.sql` |
| `apps/mobile` | `set-due-date` modal, SQLite `due_at`, sync in `todo-sync.ts` |
| `apps/web` | `SetDueDateDialog`, date input + presets |

## Out of scope (later)

- Priority, tags, subtasks
- AI extraction of due dates from capture text
- Sort/filter by due date (Phase 4 search)

## Related

- [todo-list.md](./todo-list.md)
- [scheduled-reminders.md](./scheduled-reminders.md)
- [sync-conflicts.md](./sync-conflicts.md)
