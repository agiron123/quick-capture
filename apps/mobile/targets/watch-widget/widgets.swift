import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> SimpleEntry {
    SimpleEntry()
  }

  func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> Void) {
    completion(SimpleEntry())
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> Void) {
    completion(Timeline(entries: [SimpleEntry()], policy: .never))
  }
}

struct SimpleEntry: TimelineEntry {
  let date = Date()
}

struct watchWidgetEntryView: View {
  @Environment(\.widgetFamily) var widgetFamily
  var entry: Provider.Entry

  var body: some View {
  Group {
    switch widgetFamily {
    case .accessoryCircular:
      ZStack {
        AccessoryWidgetBackground()
        Image(systemName: "mic.fill")
          .font(.title3)
      }
    case .accessoryRectangular:
      HStack {
        Image(systemName: "mic.fill")
        Text("Record voice")
          .font(.headline)
          .widgetAccentable()
      }
    case .accessoryInline:
      Label("Record voice", systemImage: "mic.fill")
    default:
      Image(systemName: "mic.fill")
    }
  }
  .widgetURL(URL(string: "quickcapture-watch://capture-voice"))
  }
}

struct watchWidget: Widget {
  let kind: String = "quickCaptureVoiceComplication"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: Provider()) { entry in
      watchWidgetEntryView(entry: entry)
        .containerBackground(.fill.tertiary, for: .widget)
    }
    .configurationDisplayName("Record voice")
    .description("Start voice capture on your iPhone.")
    .supportedFamilies([
      .accessoryCircular,
      .accessoryRectangular,
      .accessoryInline,
    ])
  }
}

#Preview(as: .accessoryCircular) {
  watchWidget()
} timeline: {
  SimpleEntry()
}
