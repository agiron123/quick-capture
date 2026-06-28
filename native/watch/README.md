# Apple Watch companion

SwiftUI watchOS app for one-tap voice capture on the wrist. Source lives in **`apps/mobile/targets/watch/`** (required by [`@bacons/apple-targets`](https://github.com/evanbacon/expo-apple-targets) next to the Expo app).

## Flow (v1 scaffold)

1. User taps **Record voice** on the watch.
2. Watch writes `watchPendingCapture=voice` to the shared App Group (`group.com.quickcapture.shared`).
3. When the iPhone app becomes active, `watch-capture-bridge.ts` reads the flag and opens `/voice-record`.
4. Voice capture continues on the phone (AI + review modal — same as manual voice flow).

## Build

Requires a custom iOS dev build (not Expo Go):

```bash
cd apps/mobile
npx expo prebuild -p ios --clean
xed ios
```

Select the **watch** scheme and a paired watchOS simulator.

## Spec

See [docs/features/apple-watch.md](../../docs/features/apple-watch.md).
