import SwiftUI

@main
struct QuickCaptureWatchApp: App {
  var body: some Scene {
    WindowGroup {
      ContentView()
        .onOpenURL { url in
          if url.host == "capture-voice" {
            WatchConnectivityManager.shared.requestVoiceCapture()
          }
        }
    }
  }
}
