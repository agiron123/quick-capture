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
2. Choose a provider:
   - **OpenAI:** `AI_PROVIDER=openai` + `OPENAI_API_KEY`
   - **MiniMax:** `AI_PROVIDER=minimax` + `MINIMAX_API_KEY` (+ `OPENAI_API_KEY` for voice transcription)
3. Set mobile vars: `EXPO_PUBLIC_API_URL=http://localhost:3000`, `EXPO_PUBLIC_USE_MOCK_AI=false`
4. Run `npm run dev` (API + Expo together).
5. On a physical device, use your machine's LAN IP instead of `localhost` for `EXPO_PUBLIC_API_URL`.

Spec: [features/ai-backend.md](./features/ai-backend.md)

### Neon Auth setup (Phase 3)

1. Create a Neon project and enable **Auth** on your branch (Neon Console → Auth).
2. Configure sign-in providers (email/password, Google, GitHub).
3. Set `DATABASE_URL`, `NEON_AUTH_URL` (API), and `EXPO_PUBLIC_NEON_AUTH_URL` (mobile) in `.env`.
4. Hono verifies client JWTs via JWKS; see [features/auth.md](./features/auth.md).
