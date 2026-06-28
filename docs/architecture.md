# Architecture

## Stack

- **Turborepo** + npm workspaces
- **Expo SDK 56** + **React Native** + **TypeScript** (`apps/mobile`)
- **Hono** API (`apps/api`) — Railway in production
- **Neon Postgres** — app data + **Neon Auth** (`neon_auth` schema) in Phase 3
- **@quick-capture/shared** — types and Zod schemas
- **expo-sqlite** — local SQLite database (`quick-capture.db`) for on-device todo persistence
- **Server-side AI** — Hono API proxies OpenAI and MiniMax; keys stay on the server

## Monorepo layout

```
apps/
  mobile/                 Expo app (@quick-capture/mobile)
  api/                    Hono API (@quick-capture/api)
  web/                    Web app (planned — Phase 3c)
packages/
  shared/                 Types + Zod (@quick-capture/shared)
  typescript-config/      Shared tsconfig bases
native/
  wear/                   Wear OS Kotlin module (planned)
  watch/                  Apple Watch SwiftUI (planned)
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
└── review-todos   → Modal
```

## Data flow (capture)

```
Capture input (apps/mobile)
    → services/ai-api-client.ts (multipart upload)
    → apps/api /api/ai/extract/* (OpenAI or MiniMax)
    → review-todos modal
    → useTodos().addTodos()
    → utils/todo-store.ts + SQLite (local)
    → apps/api sync (planned, when authenticated)
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
  createdAt: string;
  noteImageUri?: string;
  noteAudioUri?: string;
  transcript?: string;
};
```

Mobile re-exports via `apps/mobile/types/todo.ts` for `@/types/todo` imports.

## API (apps/api)

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Health check |
| `GET /api` | API metadata |
| `GET /api/ai/status` | Active AI provider (no secrets) |
| `POST /api/ai/extract/image` | Image → todos (multipart `image`) |
| `POST /api/ai/extract/voice` | Audio → transcript + todos (multipart `audio`) |
| `POST /api/ai/extract/transcript` | Transcript → todos (JSON) |
| `POST /api/todos/validate` | Validates body with shared Zod schema (stub) |

Auth, captures CRUD, sync, and push endpoints are planned in Phase 3 with **[Neon Auth](https://neon.com/docs/auth/overview)**. See [features/auth.md](./features/auth.md) and [features/push-notifications.md](./features/push-notifications.md).

## Authentication (Phase 3 — Neon Auth)

```
Client (mobile / web) → Neon Auth API → neon_auth schema (Neon Postgres)
Client → Bearer JWT → apps/api (Hono JWKS verify) → public.todos, etc.
```

- Identity and app data share one Neon database; auth branches with preview DB branches
- Hono validates JWTs from `{NEON_AUTH_URL}/.well-known/jwks.json`
- Sign-in: email/password, Google, GitHub (configured in Neon Console)

## Reminders and push (Phase 3)

```
Phase 2.5 (now):  Client schedules locally via expo-notifications
Phase 3 (planned): API worker sends push to all registered devices

Mobile → Expo Push token  ─┐
Web    → Web Push sub     ─┼→ POST /api/devices/register → Reminder worker → push
                           │
Todo sync (reminderAt) ────┘
```

Multi-device: one reminder → notification on every active device for that user.

## Environment variables

| Variable | App | Purpose |
| --- | --- | --- |
| `AI_PROVIDER` | api | `openai` or `minimax` |
| `OPENAI_API_KEY` | api | OpenAI chat + Whisper transcription |
| `MINIMAX_API_KEY` | api | MiniMax chat (when `AI_PROVIDER=minimax`) |
| `MINIMAX_BASE_URL` | api | MiniMax OpenAI-compatible base URL |
| `MINIMAX_CHAT_MODEL` | api | MiniMax model (default `MiniMax-M2.5`) |
| `OPENAI_CHAT_MODEL` | api | OpenAI model (default `gpt-4o-mini`) |
| `OPENAI_TRANSCRIPTION_MODEL` | api | Whisper model (default `whisper-1`) |
| `EXPO_PUBLIC_API_URL` | mobile | API base URL |
| `EXPO_PUBLIC_USE_MOCK_AI` | mobile | Mock AI locally (no API calls) |
| `PORT` | api | API port (default 3000) |
| `DATABASE_URL` | api | Neon Postgres (Phase 3) |
| `NEON_AUTH_URL` | api | Neon Auth API URL for JWKS / issuer (Phase 3) |
| `EXPO_PUBLIC_NEON_AUTH_URL` | mobile | Neon Auth client URL (Phase 3) |

See `.env.example`. Provider API keys must never use `EXPO_PUBLIC_` prefix.

## Conventions

- Kebab-case file names
- `@/` alias in mobile points to `apps/mobile/*`
- Cross-package imports use `@quick-capture/shared`
- Review modal before persisting AI output
- Native watch/wear code lives under `native/`, not npm workspaces
