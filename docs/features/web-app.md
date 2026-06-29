# Web companion app

**Status:** Shipped (core)  
**Phase:** 3

## Overview

Next.js web companion at `apps/web` with Neon Auth, shadcn/ui, and Tailwind. Reads/writes account-backed todos via the Hono API (`apps/api`). No local IndexedDB — all todo state is server-backed when signed in.

## Stack

- Next.js 16 (App Router), port **3001**
- Neon Auth (`@neondatabase/auth`)
- shadcn/ui + Tailwind CSS v4 + `next-themes` (light / dark / system)
- TanStack Query for client data fetching
- `@dnd-kit` for todo reorder

## Local development

1. Enable Neon Auth on your Neon branch and copy `NEON_AUTH_BASE_URL`.
2. Set env vars in repo root `.env` (see `.env.example`).
3. Run migrations: `npm run db:migrate --workspace=@quick-capture/api`
4. Generate VAPID keys for Web Push: `npx web-push generate-vapid-keys`
5. Start API + web:

```bash
npm run dev:web-api   # API :3000 + web :3001 (recommended)
# or separately: npm run dev:api && npm run dev:web
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Todo list (lists picker, add, toggle, delete, reorder, reminders) |
| `/capture` | Image upload / webcam → AI extract → review → save |
| `/voice` | MediaRecorder → AI extract → review → save |
| `/devices` | View and revoke registered push devices |
| `/chat` | MiniMax agent chat (thread list + conversation) |
| `/chat/[threadId]` | Open persisted chat thread |
| `/auth/sign-in` | Sign in |
| `/auth/sign-up` | Sign up |

## Layout and navigation

Signed-in routes use **sidebar navigation** ([web-sidebar-nav.md](./web-sidebar-nav.md)):

- `AppSidebar` — primary nav, list picker, quick capture link
- `AppShell` — `SidebarInset` with compact header (toggle, page actions, sign out)
- Auth routes (`/auth/*`) render without the app shell sidebar

## API integration

Web attaches `Authorization: Bearer <jwt>` from Neon Auth session (`authClient.getSession()` → `session.token`) to all Hono sync and capture routes.

Key client modules:

| Module | Purpose |
| --- | --- |
| `lib/auth/server.ts` | `createNeonAuth` for Next.js |
| `lib/auth/client.ts` | Browser auth client |
| `lib/api-client-client.ts` | Lists, todos, captures, devices |
| `lib/ai-client.ts` | AI extract endpoints |
| `lib/push-notifications.ts` | Web Push subscription |
| `components/push-registration.tsx` | Auto-register after sign-in |

## Implementation status

### Shipped

- [x] Drizzle schema + migrations in `apps/api`
- [x] JWT auth middleware (JWKS)
- [x] Lists + todos REST API
- [x] Capture upload API (local disk or S3/R2 — see [capture-storage.md](./capture-storage.md))
- [x] Scaffold `apps/web` with Neon Auth + shadcn
- [x] Sign-in / sign-up pages
- [x] Todo list UI (add, toggle, delete, drag reorder)
- [x] Manage lists dialog
- [x] Image + voice capture with AI review-before-save
- [x] Set reminder UI (`reminderAt` via API)
- [x] Web Push service worker (`public/sw.js`) + device registration
- [x] Devices management page (`/devices`)
- [x] Dark mode toggle (system-aware)

### Next slices

- [x] Notification click deep link to highlighted todo
- [ ] OAuth sign-in buttons (Google, GitHub) once configured in Neon Console

## Related

- [auth.md](./auth.md)
- [push-notifications.md](./push-notifications.md)
- [architecture.md](../architecture.md)
