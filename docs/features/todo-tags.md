# Todo tags

**Status:** Shipped  
**Phase:** 3

## Problem

Users need lightweight labels on todos for grouping and future filtering — separate from priority and lists.

## Field

| Field | Type | Synced |
| --- | --- | --- |
| `tags` | `string[]` (optional) | Yes |

Rules (enforced in `packages/shared/src/todo-tags.ts`):

- Lowercase, trimmed, deduplicated
- Max **20** tags per todo, **40** characters each

## User flow

1. Tap the **tags** affordance (# icon) on a todo
2. Type a tag → **Add** (or Enter on web)
3. Tap a chip to remove; **Save tags**
4. Tags show on the row as `#work #errands`

## Implementation

| Layer | Notes |
| --- | --- |
| `packages/shared` | `normalizeTodoTags`, `todoTagsEqual`, `todoTagsSchema` |
| `apps/api` | `todos.tags` `text[]`; migration `0004_todos_tags.sql` |
| `apps/mobile` | JSON in SQLite `tags` column; `set-tags` modal |
| `apps/web` | `SetTagsDialog` |

## Out of scope (later)

- Subtasks (parent/child todos)
- Filter/search by tag (Phase 4)
- AI tag suggestions from capture

## Related

- [todo-priority.md](./todo-priority.md)
- [todo-list.md](./todo-list.md)
