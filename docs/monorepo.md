# Monorepo

Quick Capture uses [Turborepo](https://turbo.build) with npm workspaces.

## Layout

```
apps/
  mobile/     @quick-capture/mobile   Expo React Native app
  api/        @quick-capture/api      Hono API (Railway in production)
  web/        @quick-capture/web      Next.js web companion (Neon Auth)
packages/
  shared/     @quick-capture/shared   Types + Zod schemas
  typescript-config/                    Shared tsconfig bases
native/
  wear/       Wear OS module (future)
  watch/      Apple Watch target (future)
```

## Commands

Run from the repo root:

| Command | Description |
| --- | --- |
| `npm install` | Install all workspace dependencies |
| `npm run dev` | Start mobile + API in parallel |
| `npm run dev:mobile` | Expo dev server only |
| `npm run dev:api` | API dev server only (`http://localhost:3000`) |
| `npm run dev:web` | Next.js web companion (`http://localhost:3001`) |
| `npm run dev:web-api` | API + web in parallel (no mobile) |
| `npm run docker:dev` | API + web + whisper via Docker Compose (see [docker-dev.md](./docker-dev.md)) |
| `npm run docker:dev:tls` | Same stack with Caddy + Let's Encrypt (requires `DEV_DOMAIN` in `.env`) |
| `npm run docker:down` | Stop Docker Compose stack |
| `npm run docker:dev:worktree` | Compose stack for current linked worktree (see [worktree-dev.md](./features/worktree-dev.md)) |
| `npm run docker:down:worktree` | Stop worktree Compose project only |
| `npm run worktree:bootstrap` | Neon branch + `.env.worktree` + migrate (linked worktrees) |
| `npm run worktree:create` | New worktree: `git worktree add` + install + bootstrap |
| `npm run worktree:teardown` | Stop worktree stack; optional `-- --delete-neon-branch` |
| `npm run worktree:list` | List bootstrapped worktrees, ports, and URLs |
| `npm run worktree:portless` | Register Portless aliases for Docker hybrid URLs |
| `npm run dev:portless` | Native dev via Portless (Option B — no Compose for web/api) |
| `npm run portless:trust` | One-time local CA trust for Portless HTTPS |
| `npm run build` | Build all packages (respects dependency order) |
| `npm run typecheck` | Typecheck all packages |

## Adding a package

1. Create `packages/<name>/` or `apps/<name>/` with a `package.json` named `@quick-capture/<name>`.
2. Add `"@quick-capture/<name>": "*"` as a dependency where needed.
3. Shared types and API schemas belong in `@quick-capture/shared`.
4. Run `npm install` from the root.

## Mobile monorepo notes

- Metro config: [apps/mobile/metro.config.js](../apps/mobile/metro.config.js)
- Build `@quick-capture/shared` before relying on workspace imports: `npm run build --workspace=@quick-capture/shared`
- Run EAS builds from `apps/mobile/` or set `workingDirectory` in `eas.json`.

## API local development

```bash
cp .env.example .env
# Edit .env: set AI_PROVIDER, OPENAI_API_KEY, and/or MINIMAX_API_KEY

npm run dev:api
curl http://localhost:3000/health
curl http://localhost:3000/api/ai/status
```

Environment variables load from the repo root `.env` (see [`.env.example`](../.env.example)).

### AI backend setup

1. Copy `.env.example` → `.env` at the repo root.
2. Choose a chat provider:
   - **OpenAI:** `AI_PROVIDER=openai` + `OPENAI_API_KEY`
   - **MiniMax:** `AI_PROVIDER=minimax` + `MINIMAX_API_KEY`
3. Choose a transcription provider for voice capture:
   - **OpenAI Whisper (default):** `TRANSCRIPTION_PROVIDER=openai` + `OPENAI_API_KEY`
   - **Local whisper.cpp:** `TRANSCRIPTION_PROVIDER=whisper-cpp` + `WHISPER_CPP_BASE_URL=http://127.0.0.1:8080` (no OpenAI key needed for STT)
4. Set mobile vars: `EXPO_PUBLIC_API_URL=http://localhost:3000`, `EXPO_PUBLIC_USE_MOCK_AI=false`
5. Run `npm run dev` (API + Expo together), or `npm run docker:dev` for the full web stack in Docker.
6. On a physical device, use your machine's LAN IP instead of `localhost` for `EXPO_PUBLIC_API_URL`.

Spec: [features/ai-backend.md](./features/ai-backend.md)

### Neon Auth + sync setup (Phase 3)

1. Create a Neon project and enable **Auth** on your branch (Neon Console → Auth).
2. Configure sign-in providers (email/password shipped; Google, GitHub optional).
3. Set in `.env`:
   - `DATABASE_URL`, `NEON_AUTH_URL` (API JWKS)
   - `EXPO_PUBLIC_NEON_AUTH_URL` (mobile)
   - `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `NEXT_PUBLIC_NEON_AUTH_URL` (web)
   - `NEXT_PUBLIC_API_URL=http://localhost:3000`, `CORS_ORIGINS=http://localhost:3001,http://localhost:8081`
4. Run migrations: `npm run db:migrate --workspace=@quick-capture/api`
5. For Web Push reminders: `npx web-push generate-vapid-keys` → set `VAPID_*` and `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
6. Hono verifies client JWTs via JWKS; see [features/auth.md](./features/auth.md).

## Parallel git worktrees

Use multiple linked worktrees when working on several features at once. Each worktree gets its own Neon branch, Docker Compose project, and port block.

```bash
# From main repo (recommended)
npm run worktree:create -- ../quick-capture-feat-x -b feat/x
cd ../quick-capture-feat-x
npm run docker:dev:worktree
npm run worktree:list
```

Or manually:

```bash
git worktree add ../quick-capture-feat-x -b feat/x
cd ../quick-capture-feat-x
npm install
npm run worktree:bootstrap
npm run docker:dev:worktree
npm run worktree:list
```

Main checkout behavior is unchanged (`npm run docker:dev`). Full spec: [features/worktree-dev.md](./features/worktree-dev.md).
