# Instant capture shortcuts

Home screen quick actions (long-press app icon) for one-tap capture flows on mobile.

## Scope (v1)

| Shortcut | Route | Flow |
| --- | --- | --- |
| Record voice | `/voice-record` | Voice modal → AI → review → save |
| Scan note | `/capture` | Camera tab |
| Add todo | `/add-todo` | Manual entry modal |

Uses [`expo-quick-actions`](https://github.com/EvanBacon/expo-quick-actions) with Expo Router `useQuickActionRouting`.

## Platform notes

- **iOS:** Static shortcuts in `app.json` plugin config (visible before first launch); refreshed on launch via `QuickActions.setItems`.
- **Android:** Dynamic shortcuts set on launch.
- **Requires a dev build** — config plugin is not available in Expo Go. Use `npx expo run:ios` / `run:android` or EAS Build.

Deep links also work via app scheme (see `@quick-capture/shared` `captureDeepLinks`):

- `quickcapture://voice-record`
- `quickcapture://capture`
- `quickcapture://add-todo`

For Nothing CMF Watch users (phone-side only), see [cmf-watch-android-shortcuts.md](./cmf-watch-android-shortcuts.md).

## Follow-ups

- iOS home screen widget (requires `@bacons/apple-targets` + native target)
- Web PWA manifest shortcuts
- Fourth shortcut slot (e.g. todos list)

## Files

| Area | Path |
| --- | --- |
| Config plugin | `apps/mobile/app.json` |
| Shortcut definitions | `apps/mobile/services/quick-actions.ts` |
| Router hook | `apps/mobile/app/(tabs)/_layout.tsx` |
