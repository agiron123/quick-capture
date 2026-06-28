# Subtasks

One-level parent/child todos. A top-level todo can have subtasks; subtasks cannot have their own children.

## Data model

| Field | Type | Notes |
| --- | --- | --- |
| `parentId` | `string?` | Set on subtasks only; references parent todo id |

- Postgres: `parent_id` self-reference with `ON DELETE CASCADE`
- SQLite (mobile): `parent_id TEXT` column
- Shared helpers: `groupSubtasksByParent`, `getTopLevelTodos`, `flattenTodosWithSubtasks` in `@quick-capture/shared`

## Behavior

- **Reorder** applies to top-level todos only (`parentId` null). Subtasks keep sibling order under their parent.
- **Delete parent** cascades to subtasks (API + local SQLite).
- **Add subtask** — top-level rows only; opens add-subtask modal/dialog.
- **Sync** — `parentId` included in create/push payloads and conflict diff.

## UI

| Platform | Entry | Display |
| --- | --- | --- |
| Mobile | `add-subtask` modal from parent row (+) | Nested under parent, indented |
| Web | Add subtask dialog | Nested under parent, indented |

## API

- `POST /api/todos` — optional `parentId` on create; validates parent exists and is top-level
- `PUT /api/todos/reorder` — `todoIds` must match all top-level todos in the list
- `DELETE /api/todos/:id` — cascade deletes children via FK

## Migration

```bash
npm run db:migrate --workspace=@quick-capture/api
```

Applies `0005_todos_parent_id.sql`.
