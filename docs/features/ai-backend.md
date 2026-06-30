# AI backend

**Status:** Shipped  
**Phase:** 3 (partial — AI only; Neon Auth/sync still planned)

## Problem

Client-side API keys (`EXPO_PUBLIC_OPENAI_API_KEY`) expose secrets in the mobile bundle. Production needs server-side AI with swappable providers.

## Architecture

```
Mobile capture → POST /api/ai/extract/* → Provider router → OpenAI or MiniMax
```

Voice pipeline (hybrid):

1. Transcription provider converts audio to text (`openai`, `whisper-cpp`, or `livekit`)
2. Active chat provider extracts todos from transcript

## Providers

| `AI_PROVIDER` | Image → todos | Transcript → todos | Voice transcription |
| --- | --- | --- | --- |
| `openai` | OpenAI vision | OpenAI chat | `TRANSCRIPTION_PROVIDER` (see below) |
| `minimax` | MiniMax chat (OpenAI-compatible) | MiniMax chat | `TRANSCRIPTION_PROVIDER` (see below) |

| `TRANSCRIPTION_PROVIDER` | Voice transcription | Required env |
| --- | --- | --- |
| `openai` (default) | OpenAI Whisper API | `OPENAI_API_KEY` |
| `whisper-cpp` | Local whisper.cpp HTTP server | `WHISPER_CPP_BASE_URL` |
| `livekit` | LiveKit Inference STT (streaming) | `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` |

For local dev without OpenAI for voice, set `TRANSCRIPTION_PROVIDER=whisper-cpp` and run the whisper sidecar (see [docker-dev.md](../docker-dev.md) or start whisper.cpp server on port 8080).

For production STT via LiveKit Cloud Inference, set `TRANSCRIPTION_PROVIDER=livekit` and configure `LIVEKIT_STT_MODEL` (default `deepgram/nova-3`). The API decodes uploaded audio to PCM and streams it through LiveKit Inference — no mobile/web client changes required.

## Environment

Server-only keys in repo root `.env`:

- `AI_PROVIDER=openai|minimax`
- `TRANSCRIPTION_PROVIDER=openai|whisper-cpp|livekit`
- `OPENAI_API_KEY` — required when `AI_PROVIDER=openai` or `TRANSCRIPTION_PROVIDER=openai`
- `MINIMAX_API_KEY` — required when `AI_PROVIDER=minimax`
- `WHISPER_CPP_BASE_URL` — required when `TRANSCRIPTION_PROVIDER=whisper-cpp` (e.g. `http://127.0.0.1:8080` or `http://whisper:8080` in Docker)
- `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` — required when `TRANSCRIPTION_PROVIDER=livekit`
- `LIVEKIT_STT_MODEL` — LiveKit Inference model id (default `deepgram/nova-3`)
- `LIVEKIT_STT_LANGUAGE` — language code (default `en`)
- `LIVEKIT_INFERENCE_URL` — optional override for LiveKit Inference gateway URL

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
- Transcription: `apps/api/src/ai/providers/transcribe-openai.ts`, `transcribe-whisper-cpp.ts`, `transcribe-livekit.ts`
- Audio decode (LiveKit): `apps/api/src/ai/audio/decode-to-pcm.ts` (ffmpeg-static)
- API routes: `apps/api/src/routes/ai.ts`
- Mobile client: `apps/mobile/services/ai-api-client.ts`

## Acceptance criteria

- [x] API keys only on server
- [x] OpenAI and MiniMax provider switch via `AI_PROVIDER`
- [x] Voice uses transcription provider + selected chat provider
- [x] whisper.cpp transcription for local dev
- [x] LiveKit Inference STT via `TRANSCRIPTION_PROVIDER=livekit`
- [x] Mobile mock mode works without API
- [x] CORS enabled for web dev
