# Todo priority

**Status:** Shipped  
**Phase:** 3

## Problem

Users need to mark how urgent a todo is without conflating it with due dates or reminders.

## Field

| Field | Values | Synced |
| --- | --- | --- |
| `priority` | `low` \| `medium` \| `high` (optional) | Yes |

Unset / cleared priority is stored as `null` on the server and omitted locally.

## User flow

1. Tap the **flag** on a todo row
2. Choose Low, Medium, or High (or clear)
3. Label appears on the row with color coding (high = red, medium = orange, low = gray)

## Implementation

| Layer | Notes |
| --- | --- |
| `packages/shared` | `TodoPriority` type + Zod `todoPrioritySchema` |
| `apps/api` | `todos.priority` text column; migration `0003_todos_priority.sql` |
| `apps/mobile` | `set-priority` modal, SQLite `priority`, sync |
| `apps/web` | `SetPriorityDialog` |

## Out of scope (later)

- Tags and subtasks
- Sort/filter by priority (Phase 4)
- AI-inferred priority from capture

## Related

- [due-dates.md](./due-dates.md)
- [todo-list.md](./todo-list.md)
