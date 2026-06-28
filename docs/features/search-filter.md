# Search and filter

Client-side search and filters on the active todo list (mobile + web).

## Scope

| Feature | Behavior |
| --- | --- |
| Text search | Case-insensitive match on todo title (includes subtasks) |
| Status filter | All · Open · Done |
| Due filter | Any due · Overdue · Today · No date |
| Priority filter | Any · Low · Medium · High |
| Tag filter | All tags · per-tag chips (when list has tags) |
| Subtasks | Shown when parent matches, or when subtask matches |

## Implementation

- Shared: `filterTodos`, `collectTodoTags` in `@quick-capture/shared`
- Mobile: filter bar on Todos tab
- Web: filter bar on todos page

All filtering is client-side against the loaded list (no API changes).
