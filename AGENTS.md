# Quick Capture — Agent Guide

Quick Capture is a Turborepo monorepo for capturing notes (camera, voice, manual entry) and turning them into todos via AI extraction and a review step before save.

**Before writing mobile code:** Read the versioned Expo docs at https://docs.expo.dev/versions/v56.0.0/ — this project uses **Expo SDK 56**.

## Project overview

| Package | Path | Purpose |
| --- | --- | --- |
| `@quick-capture/mobile` | `apps/mobile/` | Expo React Native app (Expo Router) |
| `@quick-capture/api` | `apps/api/` | Hono TypeScript API (Railway in prod) |
| `@quick-capture/shared` | `packages/shared/` | Shared types + Zod schemas |
| `@quick-capture/typescript-config` | `packages/typescript-config/` | Shared tsconfig bases |
| Native (future) | `native/watch/`, `native/wear/` | Apple Watch / Wear OS companions |

**Roadmap:** [PLAN.md](./PLAN.md)  
**Architecture:** [docs/architecture.md](./docs/architecture.md)  
**Monorepo commands:** [docs/monorepo.md](./docs/monorepo.md)  
**Feature specs:** [docs/features/](./docs/features/)

## Commands (run from repo root)

```bash
npm install                  # Install all workspaces
npm run dev:mobile           # Expo dev server
npm run dev:api              # API at http://localhost:3000
npm run dev                  # Mobile + API in parallel
npm run build                # Build shared + api (turbo cache)
npm run typecheck            # Typecheck all packages
```

Copy `.env.example` to `.env` for local env vars. Mobile env uses `EXPO_PUBLIC_*` prefix.

## Core product flows

1. **Manual todo** — Todos tab → Add → modal → save locally
2. **Camera capture** — Capture tab → photo → AI extract → review modal → save
3. **Voice capture** (planned) — mic button → record → transcribe + extract → review → save
4. **Cloud sync** (planned) — auth in `apps/api`, sync todos/captures when logged in

All AI-generated todos go through **review before save**. Never skip the review step for capture flows.

## Code conventions

### Monorepo boundaries

- **Routes only** in `apps/mobile/app/` — no components, hooks, or utils co-located there
- **Shared types/schemas** live in `packages/shared/` — update Zod + TypeScript together
- **Mobile imports:** `@/` → `apps/mobile/*`; cross-package → `@quick-capture/shared`
- **Native watch/wear** code goes in `native/`, not npm workspaces

### Mobile (`apps/mobile`)

- Kebab-case filenames (`capture-camera.tsx`, `add-todo-form.tsx`)
- Use `PlatformColor` for system-aware styling; `contentInsetAdjustmentBehavior="automatic"` on scroll lists
- `expo-camera`, `expo-audio` (not legacy `expo-av`); `expo-sqlite` for local persistence
- `TodoSource`: `manual` | `capture` | `voice` | `watch` (defined in shared)
- Metro monorepo config: `apps/mobile/metro.config.js` — rebuild shared before testing workspace imports:
  `npm run build --workspace=@quick-capture/shared`

### API (`apps/api`)

- Hono + ESM (`"type": "module"`)
- Validate request bodies with Zod schemas from `@quick-capture/shared`
- Auth (username/password, Google, GitHub) and capture CRUD are planned — see Phase 3 in PLAN.md

### When adding a feature

1. Check [PLAN.md](./PLAN.md) for phase and priority
2. Read or create `docs/features/<feature>.md`
3. Add types/schemas to `packages/shared` if used by mobile + API
4. Update PLAN.md when shipping

## Key files

| Area | Files |
| --- | --- |
| Todo state | `apps/mobile/hooks/use-todos.ts`, `apps/mobile/utils/db.ts`, `todo-repository.ts`, `todo-store.ts` |
| AI extraction | `apps/mobile/services/ai-extract-todos.ts` |
| Review modal | `apps/mobile/app/review-todos.tsx` |
| Shared types | `packages/shared/src/todo.ts`, `api-schemas.ts` |
| API entry | `apps/api/src/index.ts` |
| Tab layout | `apps/mobile/app/(tabs)/_layout.tsx` |

## Testing changes

```bash
npm run typecheck                                    # All packages
npm run build --workspace=@quick-capture/shared      # After shared changes
curl http://localhost:3000/health                    # API health
```

Run Expo from root via `npm run dev:mobile` or from `apps/mobile/` with `npx expo start`. Try **Expo Go** first; use dev client / EAS only when native modules require it.

## Recommended skills

Use these **existing skills** (install or enable in Cursor) when working in the matching area:

### Mobile / Expo (use frequently)

| Skill | When to use |
| --- | --- |
| `building-native-ui` | Expo Router, tabs, camera, storage, styling, navigation patterns |
| `vercel-react-native-skills` | React Native performance, lists, gestures |
| `expo-dev-client` | Custom native builds, TestFlight dev clients |
| `expo-deployment` | EAS Build, store submission |
| `expo-cicd-workflows` | CI/CD for Expo |
| `upgrading-expo` | SDK upgrades |

### Backend / infra (Phase 3+)

| Skill | When to use |
| --- | --- |
| Vercel `auth` plugin skill | Auth patterns (Better Auth setup in Hono) |
| Vercel `vercel-functions` / `runtime-cache` | If adding edge/serverless endpoints |
| `deploy-on-aws` `deploy` skill | Alternative hosting; primary target is **Railway + Neon** |

### Quality / workflow

| Skill | When to use |
| --- | --- |
| `create-skill` | Adding project-specific skills below |
| `split-to-prs` | Large changes spanning mobile + api + shared |
| `review-bugbot` | PR review before merge |
| `review-security` | Auth, API keys, OAuth, upload endpoints |
| `gh-fix-ci` | Fixing GitHub Actions failures |

### Wearables (Phase 5)

| Skill | When to use |
| --- | --- |
| `building-native-ui` (media + storage refs) | Audio recording patterns |
| `@bacons/apple-targets` docs | Apple Watch SwiftUI companion in `native/watch/` |

**Note:** Nothing CMF Watch Pro does **not** support third-party watch apps — use Android phone shortcuts instead (see planned `docs/features/cmf-watch-android-shortcuts.md`).

## Suggested project skills to create

Create these under `.cursor/skills/` in this repo so all contributors get the same context:

| Skill name | Purpose |
| --- | --- |
| `quick-capture-feature` | Read PLAN.md + `docs/features/` before implementing; update specs when done |
| `quick-capture-shared` | How to add types + Zod schemas in `packages/shared` and rebuild |
| `quick-capture-capture-flow` | Camera/voice → AI service → review modal → `useTodos` pipeline |
| `quick-capture-api` | Hono route patterns, shared validation, planned Better Auth + Drizzle |
| `quick-capture-monorepo` | Turbo filters, workspace deps, Metro gotchas |

Use the `create-skill` skill to scaffold these. Each should link to the relevant `docs/features/*.md` spec.

## Do not

- Put components or business logic inside `apps/mobile/app/` (routes only)
- Commit `.env` or API keys; use `.env.example` as template
- Skip review modal for AI-extracted todos
- Use `AsyncStorage` or legacy `expo-av` — use `expo-sqlite` and `expo-audio`
- Edit `.cursor/plans/*.plan.md` unless explicitly asked — update [PLAN.md](./PLAN.md) and `docs/` instead
- Assume Wear OS apps run on Nothing CMF Watch (proprietary OS, no app store)

## Current priority

**Phase 1:** Voice capture — see [docs/features/voice-capture.md](./docs/features/voice-capture.md)

**Phase 3 (next major):** Backend auth + sync in `apps/api` — username/password, Google, GitHub; move AI keys server-side.
