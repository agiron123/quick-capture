# Sync conflict resolution

When a user edits the same todo on multiple devices while offline (or before sync), Quick Capture uses **optimistic concurrency** on `updatedAt` so one side does not silently overwrite the other.

## Model

| Field | Role |
| --- | --- |
| `updatedAt` | Server-owned version timestamp; bumped on every successful `PATCH` |
| `baseUpdatedAt` | Optional client field on `PATCH` — last known server `updatedAt` |

If `baseUpdatedAt` is sent and does not match the row in Postgres, the API returns **409 Conflict** with the current server todo. The client treats the server copy as authoritative on the next pull.

## API

- `todos.updated_at` column (Drizzle migration `0001_todos_updated_at.sql`)
- `PATCH /api/todos/:id` accepts `baseUpdatedAt` plus title, completed, reminder, list, sort order
- `409` body: `{ error: "Conflict", todo: <server todo> }`

## Mobile sync (`syncOnSignIn`)

1. **Push new todos** — batch create for IDs not on the server
2. **Push edits** — for todos that exist on both sides, compare fields; if local differs, `PATCH` with `baseUpdatedAt: local.updatedAt ?? server.updatedAt`
3. **On 409** — log warning; skip (pull replaces local with server)
4. **Pull** — replace local SQLite from server (server wins)

Local SQLite stores `updated_at` for conflict checks. It is updated after successful API responses and on pull — not bumped on purely local edits before sync.

## Real-time CRUD

When signed in, `todo-store` sends `baseUpdatedAt` on toggle and reminder changes and persists the new `updatedAt` from the API response.

## Out of scope (v1)

- Field-level merge / CRDTs
- Offline mutation queue with retry
- Web client `baseUpdatedAt` on every edit (web is online-first today)

## Related

- [auth.md](./auth.md) — sign-in and sync overview
- [todo-list.md](./todo-list.md) — todo fields
