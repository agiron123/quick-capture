import { z } from 'zod';

export const LIVEKIT_TRANSCRIPTION_TOPIC = 'lk.transcription';
export const LIVEKIT_SEGMENT_ID_ATTRIBUTE = 'lk.segment_id';
export const LIVEKIT_TRANSCRIPTION_FINAL_ATTRIBUTE = 'lk.transcription_final';

export const livekitVoiceTokenResponseSchema = z.object({
  token: z.string(),
  url: z.string(),
  roomName: z.string(),
  liveTranscription: z.literal(true),
});

export type LivekitVoiceTokenResponse = z.infer<typeof livekitVoiceTokenResponseSchema>;

export type LiveTranscriptSegment = {
  segmentId: string;
  text: string;
  isFinal: boolean;
};

export function buildLiveTranscript(segments: Map<string, LiveTranscriptSegment>): string {
  return [...segments.values()]
    .map((segment) => segment.text.trim())
    .filter(Boolean)
    .join(' ')
    .trim();
}
