# Native companions

Platform-specific code that is **not** part of the npm workspace lives here.

| Path | Platform | Status |
| --- | --- | --- |
| `watch/` | Apple Watch (SwiftUI) | Planned — see PLAN Phase 5 |
| `wear/` | Wear OS (Kotlin) | Planned — see PLAN Phase 5 |

Phone-side Android shortcuts for Nothing CMF Watch (no third-party watch apps) are documented in [docs/features/cmf-watch-android-shortcuts.md](../docs/features/cmf-watch-android-shortcuts.md) and implemented via `expo-quick-actions` + deep links in `apps/mobile/`.
