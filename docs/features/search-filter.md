# Search and filter

Client-side search and status filter on the active todo list (mobile + web).

## Scope (v1)

| Feature | Behavior |
| --- | --- |
| Text search | Case-insensitive match on todo title (includes subtasks) |
| Status filter | All · Open · Done |
| Subtasks | Shown when parent matches, or when subtask title matches |

Priority, tag, and due-date filters are follow-ups (see todo-tags, todo-priority, due-dates specs).

## Implementation

- Shared: `filterTodos(todos, options)` in `@quick-capture/shared`
- Mobile: search field + segmented control on Todos tab
- Web: search input + filter tabs on todos page

All filtering is client-side against the loaded list (no API changes).
