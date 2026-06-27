# Monorepo

Quick Capture uses [Turborepo](https://turbo.build) with npm workspaces.

## Layout

```
apps/
  mobile/     @quick-capture/mobile   Expo React Native app
  api/        @quick-capture/api      Hono API (Railway in production)
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
npm run dev:api
curl http://localhost:3000/health
```

Environment variables for the API will live in `apps/api/.env` (see root `.env.example` when backend auth ships).
