import Foundation
import WatchConnectivity

final class WatchConnectivityManager: NSObject, ObservableObject, WCSessionDelegate {
  static let shared = WatchConnectivityManager()

  private let appGroup = "group.com.quickcapture.shared"
  private let pendingKey = "watchPendingCapture"

  override private init() {
    super.init()
    if WCSession.isSupported() {
      WCSession.default.delegate = self
      WCSession.default.activate()
    }
  }

  func requestVoiceCapture() {
    let defaults = UserDefaults(suiteName: appGroup)
    defaults?.set("voice", forKey: pendingKey)

    if WCSession.default.isReachable {
      WCSession.default.sendMessage(["action": "captureVoice"], replyHandler: nil)
    }
  }

  func session(
    _ session: WCSession,
    activationDidCompleteWith activationState: WCSessionActivationState,
    error: Error?
  ) {}
}
