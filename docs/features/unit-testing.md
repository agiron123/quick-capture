# Unit testing

Quick Capture uses **[Vitest](https://vitest.dev/)** for unit tests across the monorepo. Tests run locally via `npm test` and in CI (`.github/workflows/ci.yml`).

## Commands

```bash
npm test                                    # All workspaces + worktree script tests
npm test --workspace=@quick-capture/shared  # Shared package only
npm test --workspace=@quick-capture/api
npm test --workspace=@quick-capture/web
npm test --workspace=@quick-capture/mobile
npm run test:worktree                       # scripts/worktree/lib.mjs helpers
npm run test:coverage --workspace=@quick-capture/shared
```

Watch mode (per package): `npm run test:watch --workspace=@quick-capture/shared`

## Layout

| Package | Config | Environment |
| --- | --- | --- |
| `packages/shared` | `vitest.config.ts` | node |
| `apps/api` | `vitest.config.ts` | node |
| `apps/web` | `vitest.config.ts` | jsdom |
| `apps/mobile` | `vitest.config.ts` | node (utils/services) |
| `scripts/worktree` | `vitest.worktree.config.ts` (root) | node |

Co-locate tests as `*.test.ts` next to source (or `*.test.tsx` for React).

## Shared fixtures

`packages/shared/src/test-fixtures.ts` exports `createTestTodo()` and `createTestList()` for use in any workspace:

```ts
import { createTestTodo } from '@quick-capture/shared/test-fixtures';
```

## What to test where

### `packages/shared` (highest priority)

Pure logic and Zod schemas: `todo-filter`, `todo-tree`, `todo-export`, `todo-tags`, `api-schemas`, `chat-schemas`, `ai-schemas`, `capture-deep-links`, and shared formatters (`format-due-date`, `format-reminder`, `format-priority`, `format-tags`).

### `apps/api`

- **Pure:** `lib/serialize`, `lib/todo-conflict`, `lib/chat-title`, `services/chat-rate-limit`, `ai/config`, `ai/prompts`
- **Routes:** Hono `app.request()` with mocked `getDatabase()`, `authMiddleware`, and list services — see `src/routes/todos.test.ts` for sync conflict `409` coverage
- **Auth:** mock `jose.jwtVerify` — see `src/middleware/auth.test.ts`

### `apps/mobile`

Extracted sync helpers (`services/todo-sync-helpers.ts`), `sync-conflict`, `sync-mode`, and `reminder-scheduler` (mocked `expo-notifications`). Repository tests with mocked `expo-sqlite` are future work.

### `apps/web`

Extracted SSE parser (`lib/chat-sse.ts`), `lib/utils` (`cn`), review save logic (`lib/review-todos.ts`), and nav matching (`lib/app-nav.ts`). `todo-filter-bar.test.tsx` is the RTL smoke test.

Full dialog/sidebar RTL mounts may fail until workspace `react` / `react-dom` versions are aligned (19.2.3 mobile vs 19.2.4 web hoisting).

### `scripts/worktree`

`branchToSlug`, port block allocation, compose project naming in `lib.mjs`.

## Conventions

- Behavior-focused test names: `filterTodos includes parent when subtask matches query`
- Freeze time with `vi.useFakeTimers()` / `vi.setSystemTime()` for due dates, reminders, rate limits
- No real network to Neon, OpenAI, or MiniMax in unit tests — use `vi.mock` or env flags like `USE_MOCK_AI`
- Table-driven cases for Zod edge cases
- Reset module state between tests when needed (e.g. `resetChatRateLimitForTests()`)

## Mocking reference

| Dependency | Approach |
| --- | --- |
| Neon / Drizzle | Mock `getDatabase()` return value |
| Neon Auth JWT | Mock `jose.jwtVerify`; stub middleware `userId` |
| AI providers | `USE_MOCK_AI=true`; mock stream completion functions |
| `expo-sqlite` / `expo-notifications` | `vi.mock('expo-…')` |
| Time | `vi.setSystemTime()` |

## CI

The `test` job runs after `typecheck` and executes `npm test`. Turbo caches workspace test runs via the `test` task in `turbo.json` (`dependsOn: ["^build"]`).

## Out of scope (v1)

- E2E (Playwright, Maestro/Detox)
- Integration tests against real Postgres
- Expo device / component snapshot suites

See [PLAN.md](../../PLAN.md) Phase 10 for the full rollout checklist.
