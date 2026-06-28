# AI backend

**Status:** Shipped  
**Phase:** 3 (partial — AI only; auth/sync still planned)

## Problem

Client-side API keys (`EXPO_PUBLIC_OPENAI_API_KEY`) expose secrets in the mobile bundle. Production needs server-side AI with swappable providers.

## Architecture

```
Mobile capture → POST /api/ai/extract/* → Provider router → OpenAI or MiniMax
```

Voice pipeline (hybrid):

1. OpenAI Whisper transcribes audio (always)
2. Active chat provider extracts todos from transcript

## Providers

| `AI_PROVIDER` | Image → todos | Transcript → todos | Voice transcription |
| --- | --- | --- | --- |
| `openai` | OpenAI vision | OpenAI chat | OpenAI Whisper |
| `minimax` | MiniMax chat (OpenAI-compatible) | MiniMax chat | OpenAI Whisper |

## Environment

Server-only keys in repo root `.env`:

- `AI_PROVIDER=openai|minimax`
- `OPENAI_API_KEY` — required for OpenAI mode; also required for Whisper when using MiniMax
- `MINIMAX_API_KEY` — required when `AI_PROVIDER=minimax`

Mobile:

- `EXPO_PUBLIC_API_URL` — API base URL
- `EXPO_PUBLIC_USE_MOCK_AI=true` — skip API, return mock todos locally

## API endpoints

| Method | Path | Body |
| --- | --- | --- |
| GET | `/api/ai/status` | — |
| POST | `/api/ai/extract/image` | multipart `image` |
| POST | `/api/ai/extract/voice` | multipart `audio` |
| POST | `/api/ai/extract/transcript` | JSON `{ transcript }` |

## Code locations

- Shared schemas: `packages/shared/src/ai-schemas.ts`
- API providers: `apps/api/src/ai/`
- API routes: `apps/api/src/routes/ai.ts`
- Mobile client: `apps/mobile/services/ai-api-client.ts`

## Acceptance criteria

- [x] API keys only on server
- [x] OpenAI and MiniMax provider switch via `AI_PROVIDER`
- [x] Voice uses Whisper + selected chat provider
- [x] Mobile mock mode works without API
- [x] CORS enabled for web dev
