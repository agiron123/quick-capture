import { livekitVoiceTokenResponseSchema } from '@quick-capture/shared';
import { AccessToken, RoomAgentDispatch, RoomConfiguration } from 'livekit-server-sdk';
import { Hono } from 'hono';
import { randomUUID } from 'node:crypto';

import {
  assertLivekitRealtimeConfigured,
  getAiConfig,
  isLivekitRealtimeEnabled,
} from '../ai/config.js';

export const livekitRoutes = new Hono();

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong';
}

function toErrorStatus(error: unknown): 400 | 500 {
  if (error instanceof Error) {
    if (
      error.message.includes('required') ||
      error.message.includes('Missing') ||
      error.message.includes('LiveKit')
    ) {
      return 400;
    }
  }
  return 500;
}

livekitRoutes.post('/voice-token', async (c) => {
  try {
    const config = getAiConfig();
    if (!isLivekitRealtimeEnabled(config)) {
      return c.json({ error: 'LiveKit realtime transcription is not enabled.' }, 400);
    }

    assertLivekitRealtimeConfigured(config);

    const roomName = `qc-voice-${randomUUID()}`;
    const participantIdentity = `user-${randomUUID()}`;

    const roomConfig = new RoomConfiguration({
      name: roomName,
      maxParticipants: 2,
      emptyTimeout: 60,
      agents: [
        new RoomAgentDispatch({
          agentName: config.livekitTranscriberAgentName,
        }),
      ],
    });

    const token = new AccessToken(config.livekitApiKey!, config.livekitApiSecret!, {
      identity: participantIdentity,
      name: 'Quick Capture user',
      ttl: '10m',
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });
    token.roomConfig = roomConfig;

    const payload = livekitVoiceTokenResponseSchema.parse({
      token: await token.toJwt(),
      url: config.livekitUrl!,
      roomName,
      liveTranscription: true,
    });

    return c.json(payload);
  } catch (error) {
    const status = toErrorStatus(error);
    return c.json({ error: toErrorMessage(error) }, status);
  }
});
