'use client';

import { Mic, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { MAX_RECORDING_MS, MIN_RECORDING_MS } from '@/lib/constants';

type VoiceRecorderProps = {
  onComplete: (blob: Blob) => Promise<void>;
  disabled?: boolean;
};

type RecorderState = 'idle' | 'recording' | 'processing';

export function VoiceRecorder({ onComplete, disabled }: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      startedAtRef.current = Date.now();
      setElapsedMs(0);
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
            setState('idle');
            return;
          }

          setState('processing');
          try {
            await onComplete(blob);
          } finally {
            setState('idle');
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
    } catch {
      window.alert('Microphone permission is required to record voice notes.');
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
