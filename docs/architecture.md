# Architecture

## Stack

- **Turborepo** + npm workspaces
- **Expo SDK 56** + **React Native** + **TypeScript** (`apps/mobile`)
- **Hono** API (`apps/api`) — Railway in production
- **@quick-capture/shared** — types and Zod schemas
- **expo-sqlite** — local SQLite database (`quick-capture.db`) for on-device todo persistence
- **OpenAI API** — vision extraction (camera); Whisper + chat planned for voice

## Monorepo layout

```
apps/
  mobile/                 Expo app (@quick-capture/mobile)
    app/                  Routes only
    components/
    hooks/
    services/
    utils/
  api/                    Hono API (@quick-capture/api)
    src/
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
    → services/ai-*.ts (extract)
    → review-todos modal
    → useTodos().addTodos()
    → utils/todo-store.ts + SQLite (local)
    → apps/api sync (planned, when authenticated)
```

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
| `POST /api/todos/validate` | Validates body with shared Zod schema (stub) |

Auth, captures CRUD, and sync endpoints are planned in Phase 3.

## Environment variables

| Variable | App | Purpose |
| --- | --- | --- |
| `EXPO_PUBLIC_OPENAI_API_KEY` | mobile | OpenAI API access |
| `EXPO_PUBLIC_USE_MOCK_AI` | mobile | Force mock AI responses |
| `EXPO_PUBLIC_API_URL` | mobile | API base URL (planned) |
| `PORT` | api | API port (default 3000) |

See `.env.example`.

## Conventions

- Kebab-case file names
- `@/` alias in mobile points to `apps/mobile/*`
- Cross-package imports use `@quick-capture/shared`
- Review modal before persisting AI output
- Native watch/wear code lives under `native/`, not npm workspaces
