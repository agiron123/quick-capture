# Web companion app

**Status:** In progress  
**Phase:** 3

## Overview

Next.js web companion at `apps/web` with Neon Auth, shadcn/ui, and Tailwind. Reads/writes account-backed todos via the Hono API (`apps/api`).

## Stack

- Next.js 16 (App Router)
- Neon Auth (`@neondatabase/auth`)
- shadcn/ui + Tailwind CSS v4
- TanStack Query for client data fetching

## Local development

1. Enable Neon Auth on your Neon branch and copy `NEON_AUTH_BASE_URL`.
2. Set env vars in repo root `.env` (see `.env.example`).
3. Run migrations: `npm run db:migrate --workspace=@quick-capture/api`
4. Start API + web:

```bash
npm run dev:api   # http://localhost:3000
npm run dev:web   # http://localhost:3001
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Todo list (default) |
| `/capture` | Image capture (planned) |
| `/voice` | Voice capture (planned) |
| `/auth/sign-in` | Sign in |
| `/auth/sign-up` | Sign up |

## API integration

Web attaches `Authorization: Bearer <jwt>` from Neon Auth `getAccessToken()` to Hono sync routes.

## Implementation status

### Phase 3a — Foundation

- [x] Drizzle schema + migrations in `apps/api`
- [x] JWT auth middleware (JWKS)
- [x] Lists + todos REST API
- [x] Capture upload API (local disk storage; R2 planned)
- [x] Scaffold `apps/web` with Neon Auth + shadcn
- [x] Sign-in / sign-up pages
- [x] Basic todo list UI (add, toggle, delete, reorder)
- [x] Manage lists dialog
- [x] Image + voice capture with AI review-before-save
- [x] Set reminder UI (`reminderAt` via API)

### Next slices

- [ ] Web Push service worker + device registration
- [ ] Mobile Neon Auth client + sync
- [ ] Object storage (R2) for capture media in production

## Related

- [auth.md](./auth.md)
- [push-notifications.md](./push-notifications.md)
- [architecture.md](../architecture.md)
