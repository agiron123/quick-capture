# Wear OS companion

Kotlin Wear OS app for one-tap voice capture on the wrist. AI extraction and review run on the paired Android phone.

## Flow (v1 scaffold)

1. User taps **Record voice** on the watch.
2. Watch sends a Wearable Data Layer message (`/capture/voice`) to the phone app.
3. Phone `WearCaptureListenerService` stores a pending flag and opens `quickcapture://voice-record`.
4. `wear-capture-bridge.ts` reads the pending flag when the app is active and navigates to voice capture.
5. Voice capture continues on the phone (AI + review modal — same as manual voice flow).

## Build

Requires Android Studio with Wear OS emulator or physical watch paired to a phone running a dev/EAS build (not Expo Go).

### Watch app

```bash
cd native/wear
# Open in Android Studio, or:
./gradlew :app:assembleDebug
```

Install the watch APK on a Wear OS emulator paired with the phone emulator.

### Phone app

```bash
cd apps/mobile
npx expo prebuild -p android --clean
npx expo run:android
```

The `with-wear-capture-bridge` config plugin injects the listener service and native bridge module during prebuild.

## Spec

See [docs/features/wear-os.md](../../docs/features/wear-os.md).

## Not supported

- Nothing CMF Watch Pro (proprietary OS — use [CMF phone shortcuts](../../docs/features/cmf-watch-android-shortcuts.md) instead)
