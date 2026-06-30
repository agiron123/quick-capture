# Voice capture

**Status:** Shipped  
**Phase:** 1 (core) + Phase 2 (center tab UX)

## Problem

Typing and photographing notes are too slow when the user is walking, driving, or hands-busy. A center microphone button gives one-tap access to speak todos naturally.

## Goals

- **Fast:** One tap from any tab to start recording
- **Forgiving:** Review extracted todos before saving (same as camera)
- **Consistent:** Reuse existing AI + review patterns
- **Trustworthy:** Show transcript so user can verify extraction

## User flow

### Primary flow (center mic button)

```
[Any tab]
    ↓ tap center mic
Recording sheet opens (modal)
    ↓ speak, tap Stop (or auto-stop at max duration)
Processing… (transcribe + extract)
    ↓
Review Todos modal (transcript + editable todo list)
    ↓ Save
Todos tab with new items (source: 'voice')
```

### Alternate: long-press (optional, Phase 2+)

- **Press and hold** mic → record while held
- **Release** → stop and process

Start with tap-to-start / tap-to-stop for clarity; add hold-to-record later if needed.

## UI / UX

### 1. Center tab bar microphone button

Custom tab bar with a center `Pressable` that opens the voice modal instead of navigating:

```
[ Todos ]  [  🎤  ]  [ Capture ]
              ↑
         center action
         (elevated / larger)
```

**Implementation:** Option A — `components/tab-bar-with-mic.tsx` wraps expo-router's `BottomTabBar` with a floating center mic button.

**Visual design:**

- 56pt circular button, centered, elevated (`boxShadow`)
- Icon: `mic.fill` (SF Symbol) / material mic on Android
- Active recording: red stop button + pulsing ring on recording modal
- `PlatformColor('systemRed')` while recording; `systemBlue` idle

**Files:**

- `apps/mobile/components/tab-bar-with-mic.tsx` — custom tab bar
- `apps/mobile/app/(tabs)/_layout.tsx` — wire `tabBar` prop
- `apps/mobile/app/voice-record.tsx` — recording modal route

### 2. Recording modal

Full-screen modal (`presentation: 'modal'`).

**States:**

| State | UI |
| --- | --- |
| `idle` | “Tap to record” + large mic button |
| `recording` | Timer, pulse ring, **Stop** button |
| `processing` | Spinner + “Turning your note into todos…” |
| `error` | Message + Retry / Cancel |

**Component:** `components/voice-recorder.tsx`

**Behavior:**

- Max duration: **60 seconds** (`constants/voice-capture.ts`)
- Min duration: **1 second** (reject accidental taps)
- Request mic permission on first open (`expo-audio`)
- Recording saved via expo-audio recorder URI

### 3. Review modal (extend existing)

`apps/mobile/app/review-todos.tsx` supports voice:

- **Transcript** above editable todo list (read-only, selectable)
- Params: `transcript`, `audioUri`, `todos` (JSON), `source: 'voice'`
- Audio playback on review screen — deferred to Phase 2 polish

**Todo item badge:** “From voice note” when `source === 'voice'`

## Data model

```typescript
export type TodoSource = 'manual' | 'capture' | 'voice';

export type Todo = {
  // ...existing
  noteAudioUri?: string;
  transcript?: string;
};
```

Stored in SQLite via `note_audio_uri` and `transcript` columns.

## Services

### `services/ai-extract-todos-from-voice.ts`

```
audio URI
  → transcribe (OpenAI Whisper API)
  → extract todos from transcript (OpenAI chat, JSON mode)
  → { transcript, todos: ExtractedTodo[] }
```

Shared transcript → todos logic in `services/ai-extract-todos-from-text.ts`.

**Mock mode** (`EXPO_PUBLIC_USE_MOCK_AI=true` or no API URL): returns sample transcript and todos after a short delay.

**Real mode:** uploads audio to `POST /api/ai/extract/voice` on the API. Transcription runs server-side via `TRANSCRIPTION_PROVIDER` (`openai`, `whisper-cpp`, or `livekit`); todo extraction uses the configured chat provider.

## Dependencies

- `expo-audio` — recording and permissions
- iOS: `NSMicrophoneUsageDescription`
- Android: `RECORD_AUDIO`

## Navigation

```
Root Stack
├── (tabs)
├── add-todo
├── review-todos      ← voice + camera params
└── voice-record      ← recording modal
```

Center mic: `router.push('/voice-record')`  
On success: `router.replace({ pathname: '/review-todos', params: { source, audioUri, transcript, todos } })`

## Implementation status

### Phase 1 — Core voice pipeline

- [x] Add `voice` to `TodoSource` and optional `noteAudioUri` / `transcript` on `Todo`
- [x] Install and configure `expo-audio` + microphone permissions
- [x] Create `components/voice-recorder.tsx` (record, stop, timer, processing)
- [x] Create `apps/mobile/app/voice-record.tsx` modal route
- [x] Create `services/ai-extract-todos-from-voice.ts` (mock + OpenAI)
- [x] Create `services/ai-extract-todos-from-text.ts` (shared extraction)
- [x] Extend `review-todos.tsx` for transcript + voice source
- [x] Update `use-todos` / `addTodos` to pass audio URI and transcript
- [x] Update `todo-item.tsx` label for voice source

### Phase 2 — Center tab bar mic

- [x] Create `components/tab-bar-with-mic.tsx`
- [x] Update `apps/mobile/app/(tabs)/_layout.tsx` with custom tab bar
- [x] Center button opens `/voice-record` from any tab
- [x] Recording feedback: haptics on start/stop, pulse animation
- [ ] (Optional) Audio playback on review screen

### Phase 3 — Polish

- [x] Live transcript during recording (LiveKit realtime when `LIVEKIT_URL` configured)
- [ ] Waveform visualization during recording
- [ ] Cancel recording without processing
- [ ] Background noise hint in empty state
- [ ] Unit tests for transcript → todo parsing (mock service)

## Acceptance criteria

- [x] Center mic visible on Todos and Capture tabs
- [x] Tap mic → record → stop → review → save adds todos with `source: 'voice'`
- [x] Transcript visible on review screen
- [x] Mock mode works without API key
- [x] Real mode transcribes and extracts via API (`EXPO_PUBLIC_API_URL` + server-side providers)
- [x] Mic permission denied shows clear message and settings path
- [x] Recordings under 1s rejected with friendly feedback

## Error handling

| Case | Behavior |
| --- | --- |
| Permission denied | Explain + button to open settings |
| Recording too short | “Hold a little longer” message |
| AI failure | Alert with retry; recording modal stays open |
| No todos extracted | Alert with “Review anyway” option (empty list + transcript) |
| Network offline | Alert on real-mode AI failure |

## Open questions

- **Auto-stop vs manual stop only?** Both: manual stop + 60s auto-stop safety.
- **Keep audio files forever?** Store URI on todo; prune cache files older than 30 days (Phase 3).
- **On-device speech recognition?** Evaluate after MVP.
- **Backend for API keys?** Defer to Phase 3 in PLAN.md.

## Related docs

- [camera-capture.md](./camera-capture.md) — parallel capture flow
- [architecture.md](../architecture.md) — services and types
- [PLAN.md](../../PLAN.md) — roadmap priority
