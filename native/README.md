# Native companions

Platform-specific code that is **not** part of the npm workspace lives here.

| Path | Platform | Status |
| --- | --- | --- |
| `watch/` | Apple Watch (SwiftUI) | Scaffold — see [README](./watch/README.md); sources in `apps/mobile/targets/watch/` |
| `wear/` | Wear OS (Kotlin) | Planned — see PLAN Phase 5 |

Phone-side Android shortcuts for Nothing CMF Watch are documented in [docs/features/cmf-watch-android-shortcuts.md](../docs/features/cmf-watch-android-shortcuts.md).

Apple Watch uses [`@bacons/apple-targets`](https://github.com/evanbacon/expo-apple-targets); Swift sources must live under `apps/mobile/targets/watch/` for Expo prebuild.
