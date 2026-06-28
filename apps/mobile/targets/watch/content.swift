import SwiftUI

struct ContentView: View {
  var body: some View {
    VStack(spacing: 16) {
      Image(systemName: "mic.fill")
        .font(.title)
      Text("Quick Capture")
        .font(.headline)
      Button("Record voice") {
        WatchConnectivityManager.shared.requestVoiceCapture()
      }
      .buttonStyle(.borderedProminent)
      Text("Opens voice capture on your iPhone")
        .font(.caption2)
        .multilineTextAlignment(.center)
        .foregroundStyle(.secondary)
    }
    .padding()
    .onAppear {
      _ = WatchConnectivityManager.shared
    }
  }
}

struct ContentView_Previews: PreviewProvider {
  static var previews: some View {
    ContentView()
  }
}
