# Quick Capture — Product Plan

Quick Capture turns messy inputs (handwritten notes, voice, manual entry) into actionable todos. This document is the living roadmap. Detailed specs live in [`docs/`](./docs/).

## Current state (v0.5)

| Feature | Status | Spec |
| --- | --- | --- |
| Turborepo monorepo | ✅ Shipped | [docs/monorepo.md](./docs/monorepo.md) |
| Todo list (complete, delete, persist) | ✅ Shipped | [docs/features/todo-list.md](./docs/features/todo-list.md) |
| Manual todo entry | ✅ Shipped | [docs/features/manual-entry.md](./docs/features/manual-entry.md) |
| Camera capture → AI → review → save | ✅ Shipped | [docs/features/camera-capture.md](./docs/features/camera-capture.md) |
| Voice capture → AI → review → save | ✅ Shipped | [docs/features/voice-capture.md](./docs/features/voice-capture.md) |
| Server-side AI (OpenAI + MiniMax) | ✅ Shipped | [docs/features/ai-backend.md](./docs/features/ai-backend.md) |
| Multiple todo lists | ✅ Shipped | [docs/features/todo-list.md](./docs/features/todo-list.md) |
| Scheduled reminders (local) | ✅ Shipped | [docs/features/scheduled-reminders.md](./docs/features/scheduled-reminders.md) |
| API + Neon Postgres sync | ✅ Shipped | [docs/features/auth.md](./docs/features/auth.md) |
| Web companion (`apps/web`) | ✅ Shipped | [docs/features/web-app.md](./docs/features/web-app.md) |
| Neon Auth (web + mobile) | ✅ Shipped | [docs/features/auth.md](./docs/features/auth.md) |
| API-backed push reminders | ✅ Shipped | [docs/features/push-notifications.md](./docs/features/push-notifications.md) |
| Mobile cloud sync | ✅ Shipped | [docs/features/auth.md](./docs/features/auth.md) |
| Sync conflict resolution | ✅ Shipped | [docs/features/sync-conflicts.md](./docs/features/sync-conflicts.md) |
| Due dates (`dueAt`) | ✅ Shipped | [docs/features/due-dates.md](./docs/features/due-dates.md) |
| Todo priority | ✅ Shipped | [docs/features/todo-priority.md](./docs/features/todo-priority.md) |
| Todo tags | ✅ Shipped | [docs/features/todo-tags.md](./docs/features/todo-tags.md) |
| Subtasks | ✅ Shipped | [docs/features/subtasks.md](./docs/features/subtasks.md) |
| Export / share | ✅ Shipped | [docs/features/export-share.md](./docs/features/export-share.md) |
| Instant capture shortcuts | ✅ Shipped | [docs/features/instant-capture-shortcuts.md](./docs/features/instant-capture-shortcuts.md) |
| CMF Watch phone shortcuts | ✅ Shipped | [docs/features/cmf-watch-android-shortcuts.md](./docs/features/cmf-watch-android-shortcuts.md) |
| Apple Watch companion (scaffold) | ✅ Shipped | [docs/features/apple-watch.md](./docs/features/apple-watch.md) |

## Vision

One tap from any screen to capture a thought. The app handles transcription, extraction, and review — the user only confirms what to keep.

```
Input (voice / photo / text)
        ↓
   AI extraction
        ↓
   Review & edit
        ↓
   Todo list (local SQLite offline / synced via API when signed in)
```

## Roadmap

### Phase 0 — Monorepo foundation

- [x] Turborepo + npm workspaces
- [x] Move Expo to `apps/mobile`
- [x] Create `packages/shared` and `packages/typescript-config`
- [x] Scaffold `apps/api` (Hono)
- [x] Document dev workflow in [docs/monorepo.md](./docs/monorepo.md)
- [x] Root `dev:web-api` script — run API (`:3000`) + web (`:3001`) together without mobile (`npm run dev:web-api`)

### Phase 1 — Core capture

- [x] Local todo storage
- [x] Manual todos
- [x] Camera → vision AI → review modal
- [x] Voice → transcription AI → review modal

### Phase 2 — Capture UX polish

- [x] Center tab bar microphone button (primary quick-capture affordance)
- [x] Unified review modal for all capture sources (`review-todos-form.tsx`)
- [x] Capture history / source preview on todo items (voice + camera labels)
- [x] Haptic + visual recording feedback (start/stop pulse, timer)

### Phase 2.5 — Scheduled reminders

- [x] Per-todo reminder date/time (local push notifications)
- [x] Bell affordance + set-reminder modal with presets
- [x] Cancel reminder on complete/delete; reconcile on app launch
- [x] Sync-ready schema (`reminderAt` synced; `notificationId` device-local)
- [x] Spec: [docs/features/scheduled-reminders.md](./docs/features/scheduled-reminders.md)

### Phase 3 — Cloud backend, sync, and push

- [x] **[Neon Auth](https://neon.com/docs/auth/overview)** — managed auth on Neon Postgres ([spec](./docs/features/auth.md))
  - [x] Email/password sign-in (web + mobile)
  - [ ] Google + GitHub OAuth (configure in Neon Console)
  - [x] Mobile + web clients: Neon Auth SDK; API: JWT verification via JWKS in Hono
  - [x] Branch-aware auth for preview/staging environments ([auth.md](./docs/features/auth.md#preview--staging-branches))
- [x] Neon Postgres + Drizzle migrations (`todo_lists`, `todos`, `captures`, `user_devices`)
- [x] Lists + todos REST API (`apps/api`)
- [x] Capture upload API (local disk; R2 planned for production)
- [x] **Web companion** (`apps/web`) — Neon Auth, todos, capture, voice, reminders, dark mode
- [x] **Mobile sync** — sign-in, push local todos before pull, CRUD sync to API
- [x] Todo sync including `reminderAt` (Postgres)
- [x] **API-backed push notifications** — multi-device + web ([spec](./docs/features/push-notifications.md))
  - [x] Device registration (`POST /api/devices/register`) — Expo tokens + Web Push
  - [x] Reminder worker — server fires at `reminderAt`, sends to all user devices
  - [x] Mobile: register Expo push token after auth; server replaces local schedule when synced
  - [x] Web: service worker + Web Push via VAPID
  - [x] Device management UI on web (`/devices`)
- [x] Object storage (R2 / S3-compatible) for capture media in production
- [x] Notification tap deep links (mobile + web)
- [x] Sync conflict resolution (same todo edited offline on two devices) — [spec](./docs/features/sync-conflicts.md)
- [x] Due dates (`dueAt`) — [spec](./docs/features/due-dates.md)
- [x] Priority (`low` / `medium` / `high`) — [spec](./docs/features/todo-priority.md)
- [x] Tags (`string[]`) — [spec](./docs/features/todo-tags.md)
- [x] Subtasks — [spec](./docs/features/subtasks.md)

### Phase 4 — Beyond todos

- [x] Search and filter (title search + open/done) — [spec](./docs/features/search-filter.md)
- [x] Export / share — [spec](./docs/features/export-share.md)
- [x] Widget or shortcut for instant capture — [spec](./docs/features/instant-capture-shortcuts.md)

### Phase 5 — Wearable capture

- [x] Apple Watch companion (`native/watch/`) — [spec](./docs/features/apple-watch.md) (v1 scaffold)
- [ ] Wear OS module (`native/wear/`) — not CMF Watch
- [x] CMF Android phone shortcuts — [spec](./docs/features/cmf-watch-android-shortcuts.md)

## Next up

Phase 3 core is shipped. Remaining priorities:

1. **OAuth providers** — Google + GitHub in Neon Console
2. **Wear OS module** — `native/wear/`
3. **Apple Watch follow-ups** — `source: watch`, complications

Specs:
- [docs/features/apple-watch.md](./docs/features/apple-watch.md)
- [docs/features/cmf-watch-android-shortcuts.md](./docs/features/cmf-watch-android-shortcuts.md)
- [docs/features/instant-capture-shortcuts.md](./docs/features/instant-capture-shortcuts.md)
- [docs/features/export-share.md](./docs/features/export-share.md)
- [docs/features/search-filter.md](./docs/features/search-filter.md)
- [docs/features/subtasks.md](./docs/features/subtasks.md)
- [docs/features/todo-tags.md](./docs/features/todo-tags.md)
- [docs/features/todo-priority.md](./docs/features/todo-priority.md)
- [docs/features/due-dates.md](./docs/features/due-dates.md)
- [docs/features/auth.md](./docs/features/auth.md)
- [docs/features/sync-conflicts.md](./docs/features/sync-conflicts.md)
- [docs/features/web-app.md](./docs/features/web-app.md)
- [docs/features/push-notifications.md](./docs/features/push-notifications.md)
- [docs/features/scheduled-reminders.md](./docs/features/scheduled-reminders.md)

## How to use this plan

1. Read **PLAN.md** for priorities and phase context.
2. Open the linked **docs/features/** spec before implementing a feature.
3. Update both the spec and this file when scope changes or work ships.

## Conventions

- **Monorepo:** `apps/mobile` (Expo), `apps/api` (Hono), `apps/web` (Next.js), `packages/shared` (types + Zod)
- **Routes** in `apps/mobile/app/` and `apps/web/app/` only; components, hooks, services elsewhere
- **Capture sources** in `@quick-capture/shared`: `manual` | `capture` | `voice` | `watch`
- **Review before save** for all AI-generated todos

See [docs/architecture.md](./docs/architecture.md) and [docs/monorepo.md](./docs/monorepo.md).
