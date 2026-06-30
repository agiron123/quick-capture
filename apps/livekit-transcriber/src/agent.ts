import 'dotenv/config';

import { fileURLToPath } from 'node:url';

import {
  cli,
  defineAgent,
  inference,
  type JobContext,
  type JobProcess,
  llm,
  ServerOptions,
  voice,
} from '@livekit/agents';
import * as silero from '@livekit/agents-plugin-silero';

class Transcriber extends voice.Agent {
  async onUserTurnCompleted(_chatCtx: llm.ChatContext, _newMessage: llm.ChatMessage): Promise<void> {
    throw new voice.StopResponse();
  }
}

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
  },
  entry: async (ctx: JobContext) => {
    await ctx.connect();

    const session = new voice.AgentSession({
      vad: ctx.proc.userData.vad as silero.VAD,
      stt: new inference.STT({
        model: process.env.LIVEKIT_STT_MODEL?.trim() || 'deepgram/nova-3',
        language: process.env.LIVEKIT_STT_LANGUAGE?.trim() || 'en',
        apiKey: process.env.LIVEKIT_API_KEY,
        apiSecret: process.env.LIVEKIT_API_SECRET,
        baseURL: process.env.LIVEKIT_INFERENCE_URL,
      }),
    });

    await session.start({
      agent: new Transcriber({ instructions: 'Transcribe user speech only.' }),
      room: ctx.room,
      outputOptions: {
        audioEnabled: false,
        transcriptionEnabled: true,
      },
    });
  },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  cli.runApp(
    new ServerOptions({
      agent: fileURLToPath(import.meta.url),
      agentName: process.env.LIVEKIT_TRANSCRIBER_AGENT_NAME?.trim() || 'qc-transcriber',
    })
  );
}
