# Quick Capture — Product Plan

Quick Capture turns messy inputs (handwritten notes, voice, manual entry) into actionable todos. This document is the living roadmap. Detailed specs live in [`docs/`](./docs/).

## Current state (v0.4)

| Feature | Status | Spec |
| --- | --- | --- |
| Turborepo monorepo | ✅ Shipped | [docs/monorepo.md](./docs/monorepo.md) |
| Todo list (complete, delete, persist) | ✅ Shipped | [docs/features/todo-list.md](./docs/features/todo-list.md) |
| Manual todo entry | ✅ Shipped | [docs/features/manual-entry.md](./docs/features/manual-entry.md) |
| Camera capture → AI → review → save | ✅ Shipped | [docs/features/camera-capture.md](./docs/features/camera-capture.md) |
| Voice capture → AI → review → save | ✅ Shipped | [docs/features/voice-capture.md](./docs/features/voice-capture.md) |
| Server-side AI (OpenAI + MiniMax) | ✅ Shipped | [docs/features/ai-backend.md](./docs/features/ai-backend.md) |
| Multiple todo lists | ✅ Shipped | [docs/features/todo-list.md](./docs/features/todo-list.md) |
| Scheduled reminders | ✅ Shipped | [docs/features/scheduled-reminders.md](./docs/features/scheduled-reminders.md) |
| API scaffold (`apps/api`) | ✅ Shipped | [docs/monorepo.md](./docs/monorepo.md) |

## Vision

One tap from any screen to capture a thought. The app handles transcription, extraction, and review — the user only confirms what to keep.

```
Input (voice / photo / text)
        ↓
   AI extraction
        ↓
   Review & edit
        ↓
   Todo list (persisted locally / synced via API)
```

## Roadmap

### Phase 0 — Monorepo foundation

- [x] Turborepo + npm workspaces
- [x] Move Expo to `apps/mobile`
- [x] Create `packages/shared` and `packages/typescript-config`
- [x] Scaffold `apps/api` (Hono)
- [x] Document dev workflow in [docs/monorepo.md](./docs/monorepo.md)

### Phase 1 — Core capture

- [x] Local todo storage
- [x] Manual todos
- [x] Camera → vision AI → review modal
- [x] Voice → transcription AI → review modal

### Phase 2 — Capture UX polish

- [x] Center tab bar microphone button (primary quick-capture affordance)
- [ ] Unified review modal for all capture sources
- [x] Capture history / source preview on todo items (voice + camera labels)
- [x] Haptic + visual recording feedback (start/stop pulse, timer)

### Phase 2.5 — Scheduled reminders

- [x] Per-todo reminder date/time (local push notifications)
- [x] Bell affordance + set-reminder modal with presets
- [x] Cancel reminder on complete/delete; reconcile on app launch
- [x] Sync-ready schema (`reminderAt` synced; `notificationId` device-local)
- [x] Spec: [docs/features/scheduled-reminders.md](./docs/features/scheduled-reminders.md)

### Phase 3 — Cloud backend, sync, and push

- [ ] **[Neon Auth](https://neon.com/docs/auth/overview)** — managed auth on Neon Postgres ([spec](./docs/features/auth.md))
  - [ ] Email/password + Google + GitHub (Neon Console / branch config)
  - [ ] Mobile + web clients: Neon Auth SDK; API: JWT verification via JWKS in Hono
  - [ ] Branch-aware auth for preview/staging environments
- [ ] Neon Postgres + todo REST API and sync from `apps/mobile` / `apps/web`
- [x] Server-side AI (OpenAI + MiniMax providers)
- [ ] Todo sync including `reminderAt` (Postgres)
- [ ] **API-backed push notifications** — multi-device + web ([spec](./docs/features/push-notifications.md))
  - [ ] Device registration (`POST /api/devices/register`) — Expo tokens + Web Push
  - [ ] Reminder worker — server fires at `reminderAt`, sends to all user devices
  - [ ] Mobile: register Expo push token after auth; server replaces local schedule when synced
  - [ ] Web app (`apps/web`) — Web Push via service worker
- [ ] Due dates, priority, tags, subtasks

### Phase 4 — Beyond todos

- [ ] Search and filter
- [ ] Export / share
- [ ] Widget or shortcut for instant capture

### Phase 5 — Wearable capture

- [ ] Apple Watch companion (`native/watch/`)
- [ ] Wear OS module (`native/wear/`) — not CMF Watch
- [ ] CMF Android phone shortcuts

## Next up: Phase 3 — sync and API push

Phase 2.5 local reminders are shipped. Next priorities:

1. **Neon Auth + todo sync** — account-backed todos in Neon Postgres (`reminderAt` included)
2. **API-backed push** — server sends reminders to all devices (mobile + future web)
3. **Unified review modal** — one component for camera and voice params

Specs:
- [docs/features/auth.md](./docs/features/auth.md)
- [docs/features/push-notifications.md](./docs/features/push-notifications.md)
- [docs/features/scheduled-reminders.md](./docs/features/scheduled-reminders.md)

## How to use this plan

1. Read **PLAN.md** for priorities and phase context.
2. Open the linked **docs/features/** spec before implementing a feature.
3. Update both the spec and this file when scope changes or work ships.

## Conventions

- **Monorepo:** `apps/mobile` (Expo), `apps/api` (Hono), `apps/web` (planned), `packages/shared` (types + Zod)
- **Routes** in `apps/mobile/app/` only; components, hooks, services in `apps/mobile/`
- **Capture sources** in `@quick-capture/shared`: `manual` | `capture` | `voice` | `watch`
- **Review before save** for all AI-generated todos

See [docs/architecture.md](./docs/architecture.md) and [docs/monorepo.md](./docs/monorepo.md).
