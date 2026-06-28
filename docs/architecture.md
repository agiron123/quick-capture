# Architecture

## Stack

- **Turborepo** + npm workspaces
- **Expo SDK 56** + **React Native** + **TypeScript** (`apps/mobile`)
- **Next.js 16** web companion (`apps/web`) — Neon Auth, shadcn/ui, Tailwind
- **Hono** API (`apps/api`) — Railway in production
- **Neon Postgres** — app data + **Neon Auth** (`neon_auth` schema)
- **@quick-capture/shared** — types and Zod schemas
- **expo-sqlite** — local SQLite (`quick-capture.db`) for mobile offline todos
- **Server-side AI** — Hono API proxies OpenAI and MiniMax; keys stay on the server
- **Drizzle ORM** — Postgres schema + migrations in `apps/api`

## Monorepo layout

```
apps/
  mobile/                 Expo app (@quick-capture/mobile)
  api/                    Hono API (@quick-capture/api)
  web/                    Next.js web companion (@quick-capture/web)
packages/
  shared/                 Types + Zod (@quick-capture/shared)
  typescript-config/      Shared tsconfig bases
native/
  wear/                   Wear OS Kotlin module (scaffold)
  watch/                  Apple Watch SwiftUI (scaffold; sources in apps/mobile/targets/watch/)
docs/
PLAN.md
turbo.json
```

See [monorepo.md](./monorepo.md) for dev commands.

## Navigation (mobile)

```
Root Stack
├── (tabs)
│   ├── index      → Todos
│   └── capture    → Camera (full-screen)
├── add-todo       → Modal
├── review-todos   → Modal
├── voice-record   → Modal
├── manage-lists   → Modal
├── set-reminder   → Modal
└── sign-in        → Modal (Neon Auth)
```

## Navigation (web)

```
(auth)           → sign-in, sign-up
(app)            → protected routes
├── /            → Todos
├── /capture     → Image / webcam capture
├── /voice       → Voice capture
└── /devices     → Push device management
```

## Data flow (capture)

```
Capture input (mobile or web)
    → AI extract via apps/api /api/ai/extract/*
    → review modal / dialog
    → save todos

Mobile offline:  todo-store → SQLite
Mobile signed in: todo-store → SQLite + sync API
Web signed in:   API only (no local DB)
```

Voice uses hybrid transcription: OpenAI Whisper for speech-to-text, then the configured chat provider for todo extraction.

## Core types

Defined in `packages/shared/src/todo.ts`:

```typescript
type TodoSource = 'manual' | 'capture' | 'voice' | 'watch';

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  source: TodoSource;
  listId: string;
  sortOrder: number;
  createdAt: string;
  reminderAt?: string;
  captureId?: string;
  transcript?: string;
  // Mobile-only (not synced):
  noteImageUri?: string;
  noteAudioUri?: string;
  notificationId?: string;
};
```

Mobile re-exports via `apps/mobile/types/todo.ts` for `@/types/todo` imports.

## API (apps/api)

| Endpoint | Auth | Purpose |
| --- | --- | --- |
| `GET /health` | — | Health check |
| `GET /api` | — | API metadata |
| `GET /api/ai/status` | — | Active AI provider (no secrets) |
| `POST /api/ai/extract/image` | — | Image → todos |
| `POST /api/ai/extract/voice` | — | Audio → transcript + todos |
| `POST /api/ai/extract/transcript` | — | Transcript → todos |
| `GET /api/lists` | JWT | List user's todo lists |
| `POST /api/lists` | JWT | Create list |
| `PATCH /api/lists/:id` | JWT | Rename list |
| `DELETE /api/lists/:id` | JWT | Delete list (moves todos to Inbox) |
| `GET /api/todos` | JWT | List todos (`?listId=`) |
| `POST /api/todos` | JWT | Create todo(s) |
| `PATCH /api/todos/:id` | JWT | Update todo (incl. `reminderAt`) |
| `DELETE /api/todos/:id` | JWT | Delete todo |
| `PUT /api/todos/reorder` | JWT | Reorder todos in a list |
| `POST /api/captures/upload` | JWT | Upload capture media |
| `GET /api/captures/:id/media` | JWT | Serve capture media |
| `POST /api/devices/register` | JWT | Register push token |
| `GET /api/devices` | JWT | List devices |
| `DELETE /api/devices/:id` | JWT | Revoke device |

## Authentication

```
Client (mobile / web) → Neon Auth API → neon_auth schema (Neon Postgres)
Client → Bearer JWT → apps/api (Hono JWKS verify) → public.*
```

- Hono verifies JWTs from `{NEON_AUTH_URL}/.well-known/jwks.json` (`jose`)
- Sign-in: email/password (shipped); Google, GitHub (configure in Neon Console)
- Web: Neon Auth cookies + `session.token` for API calls
- Mobile: `@neondatabase/auth` client; `syncApiFetch` attaches JWT

## Mobile sync

On sign-in (`syncOnSignIn`):

1. Push local lists/todos not yet on server (`clientId` preserves IDs)
2. Pull canonical state from API into SQLite
3. Enable server reminder mode; register Expo push token

While signed in, CRUD operations mirror to the API. Sign-out returns to offline-only mode.

## Reminders and push

```
Offline:     Mobile schedules locally via expo-notifications
Signed in:   API worker polls due todos → push dispatcher
             ├── Expo Push (iOS / Android)
             └── Web Push VAPID (browser)

Mobile → Expo Push token  ─┐
Web    → Web Push sub     ─┼→ POST /api/devices/register
                           │
Todo reminderAt (API)  ────┘
```

Multi-device: one reminder → notification on every active registered device.

## Environment variables

| Variable | App | Purpose |
| --- | --- | --- |
| `AI_PROVIDER` | api | `openai` or `minimax` |
| `OPENAI_API_KEY` | api | OpenAI chat + Whisper |
| `DATABASE_URL` | api | Neon Postgres |
| `NEON_AUTH_URL` | api | JWKS issuer |
| `CORS_ORIGINS` | api | Web + Expo origins |
| `CAPTURE_STORAGE_PROVIDER` | api | `local` or `s3`/`r2` |
| `CAPTURE_STORAGE_ENDPOINT` | api | S3-compatible endpoint (R2 URL) |
| `CAPTURE_STORAGE_BUCKET` | api | Bucket name |
| `CAPTURE_STORAGE_ACCESS_KEY_ID` | api | Object storage access key |
| `CAPTURE_STORAGE_SECRET_ACCESS_KEY` | api | Object storage secret |
| `VAPID_*` | api | Web Push keys |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | web | Browser subscription |
| `EXPO_PUBLIC_API_URL` | mobile | API base URL |
| `EXPO_PUBLIC_NEON_AUTH_URL` | mobile | Neon Auth client URL |
| `NEXT_PUBLIC_API_URL` | web | API base URL |
| `NEXT_PUBLIC_NEON_AUTH_URL` | web | Neon Auth client URL |
| `NEON_AUTH_COOKIE_SECRET` | web | Cookie signing |

See `.env.example`. Provider API keys must never use `EXPO_PUBLIC_` prefix.

## Conventions

- Kebab-case file names
- `@/` alias in mobile → `apps/mobile/*`; web → `apps/web/src/*`
- Cross-package imports use `@quick-capture/shared`
- Routes only in `app/` directories; components/hooks/services elsewhere
- Review modal before persisting AI output
- Native watch/wear code lives under `native/`, not npm workspaces
