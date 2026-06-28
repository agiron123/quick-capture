# Apple Watch companion

Native watchOS app for wrist-side voice capture. AI extraction and review still run on the paired iPhone.

## Scope (v1 scaffold)

| Piece | Status |
| --- | --- |
| SwiftUI watch app (`targets/watch/`) | ✅ Scaffold |
| App Group shared flag | ✅ `group.com.quickcapture.shared` |
| iPhone bridge → `/voice-record` | ✅ `watch-capture-bridge.ts` |
| `@bacons/apple-targets` prebuild | ✅ Plugin in `app.json` |

## Capture flow

```
Watch: Record voice
    ↓
App Group: watchPendingCapture = voice
    ↓
iPhone app foreground → watch-capture-bridge
    ↓
/voice-record → AI → review-todos → save (source: watch)
```

Todos created from watch-initiated capture use `source: 'watch'` through the review flow.

## Setup

1. Install deps from repo root: `npm install`
2. Prebuild iOS + watch target:
   ```bash
   cd apps/mobile
   npx expo prebuild -p ios --clean
   ```
3. Open Xcode: `xed ios` → run **watch** scheme on a watch simulator paired with the phone simulator.

## Files

| Area | Path |
| --- | --- |
| Watch SwiftUI | `apps/mobile/targets/watch/` |
| Target config | `apps/mobile/targets/watch/expo-target.config.js` |
| iPhone bridge | `apps/mobile/services/watch-capture-bridge.ts` |
| App Group constants | `apps/mobile/constants/app-group.ts` |
| Docs entry | `native/watch/README.md` |

## Follow-ups

- WatchConnectivity bidirectional sync (open app when phone unreachable)
- watch-widget complication for faster capture
- Complication / glance at open todo count via App Group

## Related

- [voice-capture.md](./voice-capture.md) — phone voice pipeline
- [cmf-watch-android-shortcuts.md](./cmf-watch-android-shortcuts.md) — Android / CMF (no watch app)
