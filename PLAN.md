# Quick Capture — Product Plan

Quick Capture turns messy inputs (handwritten notes, voice, manual entry) into actionable todos. This document is the living roadmap. Detailed specs live in [`docs/`](./docs/).

## Current state (v0.2)

| Feature | Status | Spec |
| --- | --- | --- |
| Turborepo monorepo | ✅ Shipped | [docs/monorepo.md](./docs/monorepo.md) |
| Todo list (complete, delete, persist) | ✅ Shipped | [docs/features/todo-list.md](./docs/features/todo-list.md) |
| Manual todo entry | ✅ Shipped | [docs/features/manual-entry.md](./docs/features/manual-entry.md) |
| Camera capture → AI → review → save | ✅ Shipped | [docs/features/camera-capture.md](./docs/features/camera-capture.md) |
| API scaffold (`apps/api`) | ✅ Shipped | [docs/monorepo.md](./docs/monorepo.md) |
| Voice capture → AI → review → save | 📋 Planned | [docs/features/voice-capture.md](./docs/features/voice-capture.md) |

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

### Phase 1 — Core capture (current)

- [x] Local todo storage
- [x] Manual todos
- [x] Camera → vision AI → review modal
- [ ] **Voice → transcription AI → review modal** ← next up

### Phase 2 — Capture UX polish

- [ ] Center tab bar microphone button (primary quick-capture affordance)
- [ ] Unified review modal for all capture sources
- [ ] Capture history / source preview on todo items
- [ ] Haptic + visual recording feedback

### Phase 3 — Cloud backend and sync

- [ ] Auth (username/password + Google + GitHub) in `apps/api`
- [ ] Capture + todo REST API and sync from `apps/mobile`
- [ ] Server-side AI (remove client API keys)
- [ ] Due dates, priority, tags, subtasks

### Phase 4 — Beyond todos

- [ ] Search and filter
- [ ] Export / share
- [ ] Widget or shortcut for instant capture

### Phase 5 — Wearable capture

- [ ] Apple Watch companion (`native/watch/`)
- [ ] Wear OS module (`native/wear/`) — not CMF Watch
- [ ] CMF Android phone shortcuts

## Next feature: Voice capture

**Goal:** A microphone button at the center of the tab bar for one-tap voice notes that become todos.

Full spec: [docs/features/voice-capture.md](./docs/features/voice-capture.md)

## How to use this plan

1. Read **PLAN.md** for priorities and phase context.
2. Open the linked **docs/features/** spec before implementing a feature.
3. Update both the spec and this file when scope changes or work ships.

## Conventions

- **Monorepo:** `apps/mobile` (Expo), `apps/api` (Hono), `packages/shared` (types + Zod)
- **Routes** in `apps/mobile/app/` only; components, hooks, services in `apps/mobile/`
- **Capture sources** in `@quick-capture/shared`: `manual` | `capture` | `voice` | `watch`
- **Review before save** for all AI-generated todos

See [docs/architecture.md](./docs/architecture.md) and [docs/monorepo.md](./docs/monorepo.md).
