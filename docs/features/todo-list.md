# Todo list

**Status:** Shipped  
**Phase:** 1

## Problem

Users need a single place to see, complete, and remove todos from every capture method.

## User flow

1. Open app → **Todos** tab (default)
2. See open/done counts and list
3. Tap checkbox → toggle complete
4. Tap **Delete** → remove todo
5. Tap **Add** (header) → manual add modal

## UI

- **Route:** `apps/mobile/app/(tabs)/index.tsx`
- **Components:** `todo-list.tsx`, `todo-item.tsx`
- Empty state prompts camera or manual capture

## Data

- **Hook:** `hooks/use-todos.ts`
- **Storage:** SQLite via `utils/db.ts` + `utils/todo-repository.ts`
- **Types:** `packages/shared` (via `@/types/todo`)

## Acceptance criteria

- [x] Todos persist across app restarts
- [x] Complete and delete work immediately
- [x] Source label shown (`From note capture` / `Added manually`)

## Phase 3 — Cloud sync

When signed in (Neon Auth), todos sync to Postgres via `apps/api`:

- **Mobile:** SQLite remains local cache; CRUD mirrors to API; pull on sign-in
- **Web:** Server-only at `apps/web` (no local DB)
- **Lists:** Multiple lists with picker, manage dialog, reorder (mobile + web)
- **Due dates:** Optional `dueAt` per todo (calendar affordance; synced)
- **Priority:** Optional `low` / `medium` / `high` (flag affordance; synced)
- **Default list:** `list-inbox` (Inbox)

See [auth.md](./auth.md) and [web-app.md](./web-app.md).
