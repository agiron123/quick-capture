# CMF Watch — Android phone shortcuts

Nothing CMF Watch Pro runs a proprietary OS and **does not support third-party watch apps**. Quick Capture capture flows run on the paired Android phone instead.

## Recommended setup

### 1. App icon shortcuts (built-in)

Long-press the Quick Capture app icon on your Android phone:

| Shortcut | Opens |
| --- | --- |
| Record voice | Voice capture modal |
| Scan note | Camera tab |
| Add todo | Manual entry modal |

See [instant-capture-shortcuts.md](./instant-capture-shortcuts.md). Requires a dev/EAS build (not Expo Go).

### 2. Deep links for automation

Use these URLs in Tasker, MacroDroid, Samsung Routines, or other Android automation when the watch button triggers a phone action:

| Flow | Deep link |
| --- | --- |
| Voice capture | `quickcapture://voice-record` |
| Camera capture | `quickcapture://capture` |
| Add todo | `quickcapture://add-todo` |

Constants are exported from `@quick-capture/shared` as `captureDeepLinks`.

### 3. CMF Watch button → phone

If your CMF companion app supports launching a custom URL or Android intent on button press, point it at one of the deep links above (voice is the best default for wrist capture).

Nothing may change companion capabilities in firmware updates — verify in the CMF Watch app settings.

## Technical notes

- App scheme: `quickcapture` (`apps/mobile/app.json`)
- Android `intentFilters` declare `VIEW` + `BROWSABLE` for the custom scheme so external apps can open capture routes
- Expo Router maps scheme URLs to the same routes as home-screen quick actions

## Not supported

- Installing Quick Capture on CMF Watch hardware
- Wear OS APK on CMF Watch
- Offline capture on watch without the phone app running

## Related

- [instant-capture-shortcuts.md](./instant-capture-shortcuts.md) — quick actions implementation
- Phase 5 Apple Watch (`native/watch/`) — separate native target for real watchOS apps
