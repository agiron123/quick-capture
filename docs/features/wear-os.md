# Wear OS companion

Native Wear OS app for wrist-side voice capture. AI extraction and review still run on the paired Android phone.

## Scope (v1 scaffold)

| Piece | Status |
| --- | --- |
| Kotlin Wear app (`native/wear/`) | ✅ Scaffold |
| Wearable message `/capture/voice` | ✅ Watch → phone |
| Phone listener + deep link | ✅ `WearCaptureListenerService` via config plugin |
| Android bridge → `/voice-record` | ✅ `wear-capture-bridge.ts` |
| `with-wear-capture-bridge` prebuild plugin | ✅ Injects native module + service |

## Capture flow

```
Watch: Record voice
    ↓
Wearable Data Layer: /capture/voice
    ↓
Phone: WearCaptureListenerService → quickcapture://voice-record
    ↓
wear-capture-bridge (pending flag) → /voice-record
    ↓
AI → review-todos → save (source: watch — follow-up)
```

Todos created from watch-initiated capture should use `source: 'watch'` when that path is wired through review (follow-up).

## Setup

1. Install deps from repo root: `npm install`
2. Prebuild Android + run phone app:
   ```bash
   cd apps/mobile
   npx expo prebuild -p android --clean
   npx expo run:android
   ```
3. Build and install the watch app from Android Studio:
   ```bash
   cd native/wear
   # Open in Android Studio → run on paired Wear OS emulator
   ```

Requires a dev/EAS build — not Expo Go.

## Files

| Area | Path |
| --- | --- |
| Wear Kotlin / Compose | `native/wear/app/src/main/java/com/quickcapture/wear/` |
| Wear docs entry | `native/wear/README.md` |
| Prebuild plugin | `apps/mobile/plugins/with-wear-capture-bridge.js` |
| Native bridge sources | `apps/mobile/plugins/wear-bridge/` |
| Phone bridge | `apps/mobile/services/wear-capture-bridge.ts` |
| Bridge constants | `apps/mobile/constants/wear-bridge.ts` |

## Follow-ups

- Set `source: 'watch'` on todos saved after watch-initiated capture
- Tile / complication for faster capture
- Open todo count glance on watch via Data Layer sync

## Not supported

- Nothing CMF Watch Pro — proprietary OS; use [cmf-watch-android-shortcuts.md](./cmf-watch-android-shortcuts.md)

## Related

- [voice-capture.md](./voice-capture.md) — phone voice pipeline
- [apple-watch.md](./apple-watch.md) — watchOS companion
- [cmf-watch-android-shortcuts.md](./cmf-watch-android-shortcuts.md) — CMF phone shortcuts
