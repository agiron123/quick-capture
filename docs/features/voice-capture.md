# Voice capture

**Status:** Planned  
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

### Alternate: long-press (optional, Phase 2)

- **Press and hold** mic → record while held
- **Release** → stop and process

Start with tap-to-start / tap-to-stop for clarity; add hold-to-record later if needed.

## UI / UX

### 1. Center tab bar microphone button

Replace the standard two-tab layout with a **three-slot tab bar**:

```
[ Todos ]  [  🎤  ]  [ Capture ]
              ↑
         center action
         (elevated / larger)
```

**Implementation options (pick one in build):**

| Option | Pros | Cons |
| --- | --- | --- |
| **A. Dummy tab + custom tabBar** | Native tab feel, mic always visible | Custom `tabBar` component |
| **B. Floating action over tab bar** | Clear “primary action” | Slightly overlaps tab bar |
| **C. Third real tab (`voice`)** | Simplest routing | Less “center button” feel |

**Recommended: Option A** — custom tab bar with a center `Pressable` that opens a modal instead of navigating.

**Visual design:**

- 56–64pt circular button, centered, slightly elevated (`boxShadow`)
- Icon: `mic.fill` (SF Symbol) / material mic on Android
- Active recording: pulsing red ring or waveform animation
- `PlatformColor('systemRed')` while recording; `systemBlue` idle

**Files to add/change:**

- `apps/mobile/components/tab-bar-with-mic.tsx` — custom tab bar
- `apps/mobile/app/(tabs)/_layout.tsx` — wire `tabBar` prop
- `apps/mobile/app/voice-record.tsx` — recording modal (new route)

### 2. Recording modal

Full-screen or bottom sheet modal (`presentation: 'modal'`).

**States:**

| State | UI |
| --- | --- |
| `idle` | “Tap to record” + large mic button |
| `recording` | Timer, waveform or pulse, **Stop** button |
| `processing` | Spinner + “Turning your note into todos…” |
| `error` | Message + Retry / Cancel |

**Component:** `components/voice-recorder.tsx`

**Behavior:**

- Max duration: **60 seconds** (configurable constant)
- Min duration: **1 second** (reject accidental taps)
- Request mic permission on first open (`expo-audio`)
- Save recording to cache via `expo-file-system` (`File` in app cache dir)

### 3. Review modal (extend existing)

Extend `apps/mobile/app/review-todos.tsx` to support voice:

- Show **transcript** above editable todo list (read-only `Text selectable`)
- Optional: mini audio playback (`expo-audio` player) — Phase 2
- Params: `transcript`, `audioUri`, `todos` (JSON), `source: 'voice'`

**Todo item badge:** “From voice note” when `source === 'voice'`

## Data model changes

```typescript
// packages/shared/src/todo.ts
export type TodoSource = 'manual' | 'capture' | 'voice';

export type Todo = {
  // ...existing
  noteAudioUri?: string;  // local file URI
  transcript?: string;    // full transcription text
};
```

**Storage:** No schema migration needed — JSON blob grows new optional fields.

## Services

### New: `services/ai-extract-todos-from-voice.ts`

**Pipeline:**

```
audio URI
  → transcribe (OpenAI Whisper API)
  → extract todos from transcript (OpenAI chat, JSON mode)
  → { transcript, todos: ExtractedTodo[] }
```

**Mock mode** (no API key):

```typescript
{
  transcript: "Remind me to call mom tomorrow and pick up groceries.",
  todos: [
    { title: "Call mom tomorrow" },
    { title: "Pick up groceries" },
  ]
}
```

**Real mode:**

1. `POST https://api.openai.com/v1/audio/transcriptions`  
   - Model: `whisper-1`  
   - File: audio from URI (m4a/caf from expo-audio)

2. `POST https://api.openai.com/v1/chat/completions`  
   - Model: `gpt-4o-mini`  
   - System: extract actionable todos from transcript  
   - Response: `{ "todos": [{ "title": "..." }] }`

Consider refactoring shared “transcript → todos” logic with a small `services/ai-extract-todos-from-text.ts` used by voice (and future text paste).

## Dependencies

```bash
npx expo install expo-audio
```

**Permissions (`app.json`):**

- iOS: `NSMicrophoneUsageDescription`
- Android: `RECORD_AUDIO`
- `expo-audio` config plugin if required by SDK version

**Audio setup (on mount):**

```typescript
await AudioModule.requestRecordingPermissionsAsync();
await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
```

Use `useAudioRecorder(RecordingPresets.HIGH_QUALITY)` per project conventions (`expo-audio`, not `expo-av`).

## Navigation changes

```
Root Stack
├── (tabs)
├── add-todo
├── review-todos      ← extend for voice params
└── voice-record      ← NEW modal
```

**Center mic action:**

```typescript
router.push('/voice-record');
```

On success from `voice-record.tsx`:

```typescript
router.replace({
  pathname: '/review-todos',
  params: {
    source: 'voice',
    audioUri: uri,
    transcript,
    todos: JSON.stringify(extracted),
  },
});
```

## Implementation tasks

### Phase 1 — Core voice pipeline

- [ ] Add `voice` to `TodoSource` and optional `noteAudioUri` / `transcript` on `Todo`
- [ ] Install and configure `expo-audio` + microphone permissions
- [ ] Create `components/voice-recorder.tsx` (record, stop, timer, processing)
- [ ] Create `apps/mobile/app/voice-record.tsx` modal route
- [ ] Create `services/ai-extract-todos-from-voice.ts` (mock + OpenAI)
- [ ] Extend `review-todos.tsx` for transcript + voice source
- [ ] Update `use-todos` / `addTodos` to pass audio URI and transcript
- [ ] Update `todo-item.tsx` label for voice source

### Phase 2 — Center tab bar mic

- [ ] Create `components/tab-bar-with-mic.tsx`
- [ ] Update `apps/mobile/app/(tabs)/_layout.tsx` with custom tab bar
- [ ] Center button opens `/voice-record` from any tab
- [ ] Recording feedback: haptics on start/stop, pulse animation
- [ ] (Optional) Audio playback on review screen

### Phase 3 — Polish

- [ ] Waveform visualization during recording
- [ ] Cancel recording without processing
- [ ] Background noise hint in empty state
- [ ] Unit tests for transcript → todo parsing (mock service)

## Acceptance criteria

- [ ] Center mic visible on Todos and Capture tabs
- [ ] Tap mic → record → stop → review → save adds todos with `source: 'voice'`
- [ ] Transcript visible on review screen
- [ ] Mock mode works without API key
- [ ] Real mode transcribes and extracts with OpenAI
- [ ] Mic permission denied shows clear message and settings path
- [ ] Recordings under 1s rejected with friendly feedback

## Error handling

| Case | Behavior |
| --- | --- |
| Permission denied | Explain + button to open settings (if supported) |
| Recording too short | Toast: “Hold a little longer” |
| AI failure | Alert with retry; keep audio file for retry |
| No todos extracted | Show transcript; allow manual “Add another” lines |
| Network offline | Alert; suggest manual add |

## Open questions

- **Auto-stop vs manual stop only?** Start manual; add 60s auto-stop as safety.
- **Keep audio files forever?** Store URI on todo for replay; prune cache files older than 30 days (Phase 3).
- **On-device speech recognition?** iOS `Speech` framework could reduce API cost — evaluate after MVP.
- **Backend for API keys?** Defer to Phase 3 in PLAN.md; client key OK for prototype.

## Related docs

- [camera-capture.md](./camera-capture.md) — parallel capture flow
- [architecture.md](../architecture.md) — services and types
- [PLAN.md](../../PLAN.md) — roadmap priority
