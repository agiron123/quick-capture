'use client';

import { Mic, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { MAX_RECORDING_MS, MIN_RECORDING_MS } from '@/lib/constants';
import {
  fetchLivekitVoiceToken,
  isLivekitRealtimeAvailable,
  LivekitVoiceSession,
} from '@/lib/livekit-voice-session';

export type VoiceRecordingResult = {
  blob: Blob;
  transcript?: string;
  durationMs: number;
};

type VoiceRecorderProps = {
  onComplete: (result: VoiceRecordingResult) => Promise<void>;
  disabled?: boolean;
};

type RecorderState = 'idle' | 'recording' | 'processing';

function getApiBaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_API_URL?.trim()?.replace(/\/$/, '');
}

export function VoiceRecorder({ onComplete, disabled }: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [livekitEnabled, setLivekitEnabled] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const livekitSessionRef = useRef<LivekitVoiceSession | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const apiBaseUrl = getApiBaseUrl();
    if (!apiBaseUrl || process.env.NEXT_PUBLIC_USE_MOCK_AI === 'true') {
      return;
    }

    void isLivekitRealtimeAvailable(apiBaseUrl).then(setLivekitEnabled);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      void livekitSessionRef.current?.stop();
    };
  }, []);

  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const finishRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    stopTimer();
    recorder.stop();
  };

  const startRecording = async () => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      let stream: MediaStream;
      let livekitSession: LivekitVoiceSession | null = null;

      if (livekitEnabled && apiBaseUrl) {
        livekitSession = new LivekitVoiceSession();
        livekitSessionRef.current = livekitSession;
        stream =
          (await livekitSession.start({
            fetchToken: () => fetchLivekitVoiceToken(apiBaseUrl),
            onTranscriptChange: (transcript) => setLiveTranscript(transcript),
          })) ?? (await navigator.mediaDevices.getUserMedia({ audio: true }));
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      startedAtRef.current = Date.now();
      setElapsedMs(0);
      setLiveTranscript('');
      setState('recording');

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const duration = Date.now() - startedAtRef.current;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });

        void (async () => {
          if (duration < MIN_RECORDING_MS) {
            window.alert('Hold a little longer — try at least one second.');
            if (livekitSessionRef.current) {
              await livekitSessionRef.current.stop();
              livekitSessionRef.current = null;
            }
            setState('idle');
            return;
          }

          setState('processing');
          try {
            const liveTranscriptFinal = livekitSessionRef.current
              ? await livekitSessionRef.current.stop()
              : undefined;
            livekitSessionRef.current = null;

            await onComplete({
              blob,
              durationMs: duration,
              transcript: liveTranscriptFinal?.trim() || undefined,
            });
          } finally {
            setState('idle');
            setLiveTranscript('');
          }
        })();
      };

      recorder.start();
      timerRef.current = window.setInterval(() => {
        const next = Date.now() - startedAtRef.current;
        setElapsedMs(next);
        if (next >= MAX_RECORDING_MS) {
          finishRecording();
        }
      }, 200);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not start recording.');
      if (livekitSessionRef.current) {
        await livekitSessionRef.current.stop();
        livekitSessionRef.current = null;
      }
    }
  };

  const seconds = Math.floor(elapsedMs / 1000);

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {state === 'idle' ? (
        <>
          <p className="text-muted-foreground">Tap to record a voice note (max 60s)</p>
          <Button
            size="lg"
            className="size-20 rounded-full"
            onClick={() => void startRecording()}
            disabled={disabled}
          >
            <Mic className="size-8" />
          </Button>
        </>
      ) : null}

      {state === 'recording' ? (
        <>
          <p className="font-mono text-lg">{seconds}s</p>
          {liveTranscript ? (
            <div className="max-w-md rounded-lg border bg-muted/40 px-4 py-3 text-sm leading-relaxed">
              {liveTranscript}
            </div>
          ) : null}
          <Button size="lg" variant="destructive" className="size-20 rounded-full" onClick={finishRecording}>
            <Square className="size-8" />
          </Button>
          <p className="text-sm text-muted-foreground">Tap stop when finished</p>
        </>
      ) : null}

      {state === 'processing' ? (
        <p className="text-muted-foreground">Turning your note into todos…</p>
      ) : null}
    </div>
  );
}
