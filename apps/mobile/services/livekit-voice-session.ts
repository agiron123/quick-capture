import {
  buildLiveTranscript,
  LIVEKIT_SEGMENT_ID_ATTRIBUTE,
  LIVEKIT_TRANSCRIPTION_FINAL_ATTRIBUTE,
  LIVEKIT_TRANSCRIPTION_TOPIC,
  type LiveTranscriptSegment,
} from '@quick-capture/shared';
import { AudioSession } from '@livekit/react-native';
import { createLocalAudioTrack, Room, type TextStreamReader } from 'livekit-client';

export type LivekitVoiceSessionOptions = {
  fetchToken: () => Promise<{ token: string; url: string; roomName: string }>;
  onTranscriptChange?: (transcript: string, isFinal: boolean) => void;
};

export class LivekitVoiceSession {
  private room: Room | null = null;
  private localTrack: Awaited<ReturnType<typeof createLocalAudioTrack>> | null = null;
  private segments = new Map<string, LiveTranscriptSegment>();
  private transcriptHandlerRegistered = false;

  async start(options: LivekitVoiceSessionOptions): Promise<void> {
    const { token, url } = await options.fetchToken();
    const room = new Room();
    this.room = room;

    this.registerTranscriptHandler(options.onTranscriptChange);

    await AudioSession.startAudioSession();
    await room.connect(url, token);

    this.localTrack = await createLocalAudioTrack({
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    });
    await room.localParticipant.publishTrack(this.localTrack);
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

    if (this.room) {
      await this.room.disconnect();
      this.room = null;
    }

    await AudioSession.stopAudioSession();

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
      attributes[LIVEKIT_SEGMENT_ID_ATTRIBUTE] ?? reader.info.id ?? `${Date.now()}`;
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
