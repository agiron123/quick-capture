import {
  buildLiveTranscript,
  LIVEKIT_SEGMENT_ID_ATTRIBUTE,
  LIVEKIT_TRANSCRIPTION_FINAL_ATTRIBUTE,
  LIVEKIT_TRANSCRIPTION_TOPIC,
  type LiveTranscriptSegment,
} from '@quick-capture/shared';
import {
  LocalAudioTrack,
  Room,
  type TextStreamReader,
} from 'livekit-client';

export type LivekitVoiceSessionOptions = {
  fetchToken: () => Promise<{ token: string; url: string; roomName: string }>;
  onTranscriptChange?: (transcript: string, isFinal: boolean) => void;
};

export class LivekitVoiceSession {
  private room: Room | null = null;
  private localTrack: LocalAudioTrack | null = null;
  private mediaStream: MediaStream | null = null;
  private segments = new Map<string, LiveTranscriptSegment>();
  private transcriptHandlerRegistered = false;

  async start(options: LivekitVoiceSessionOptions): Promise<MediaStream | null> {
    const { token, url } = await options.fetchToken();
    const room = new Room();
    this.room = room;

    this.registerTranscriptHandler(options.onTranscriptChange);

    await room.connect(url, token);

    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.localTrack = new LocalAudioTrack(this.mediaStream.getAudioTracks()[0]);
    await room.localParticipant.publishTrack(this.localTrack);

    return this.mediaStream;
  }

  getTranscript(): string {
    return buildLiveTranscript(this.segments);
  }

  async stop(): Promise<string> {
    const transcript = this.getTranscript();

    if (this.localTrack) {
      this.localTrack.stop();
      this.localTrack = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.room) {
      await this.room.disconnect();
      this.room = null;
    }

    this.segments.clear();
    this.transcriptHandlerRegistered = false;

    return transcript;
  }

  private registerTranscriptHandler(
    onTranscriptChange?: (transcript: string, isFinal: boolean) => void
  ): void {
    if (!this.room || this.transcriptHandlerRegistered) {
      return;
    }

    this.transcriptHandlerRegistered = true;

    this.room.registerTextStreamHandler(LIVEKIT_TRANSCRIPTION_TOPIC, async (reader: TextStreamReader) => {
      await this.consumeTranscriptReader(reader, onTranscriptChange);
    });
  }

  private async consumeTranscriptReader(
    reader: TextStreamReader,
    onTranscriptChange?: (transcript: string, isFinal: boolean) => void
  ): Promise<void> {
    const attributes = reader.info.attributes ?? {};
    const segmentId =
      attributes[LIVEKIT_SEGMENT_ID_ATTRIBUTE] ?? reader.info.id ?? crypto.randomUUID();
    const isFinal = attributes[LIVEKIT_TRANSCRIPTION_FINAL_ATTRIBUTE] === 'true';

    let text = '';
    for await (const chunk of reader) {
      text += chunk;
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    this.segments.set(segmentId, {
      segmentId,
      text: trimmed,
      isFinal,
    });

    onTranscriptChange?.(this.getTranscript(), isFinal);
  }
}

export async function fetchLivekitVoiceToken(apiBaseUrl: string): Promise<{
  token: string;
  url: string;
  roomName: string;
}> {
  const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/livekit/voice-token`, {
    method: 'POST',
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? `LiveKit token request failed: ${response.status}`);
  }

  return (await response.json()) as { token: string; url: string; roomName: string };
}

export async function isLivekitRealtimeAvailable(apiBaseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/ai/status`);
    if (!response.ok) {
      return false;
    }
    const data = (await response.json()) as { livekitRealtime?: boolean };
    return data.livekitRealtime === true;
  } catch {
    return false;
  }
}
