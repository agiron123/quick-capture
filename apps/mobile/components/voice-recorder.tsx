import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  PlatformColor,
  Pressable,
  Text,
  View,
} from 'react-native';

import { MAX_RECORDING_MS, MIN_RECORDING_MS } from '@/constants/voice-capture';

type RecorderPhase = 'idle' | 'recording' | 'processing' | 'error';

type VoiceRecorderProps = {
  onRecordingComplete: (uri: string, durationMs: number) => Promise<void>;
};

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);
  const [phase, setPhase] = useState<RecorderPhase>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const recordingStartedAt = useRef<number | null>(null);
  const autoStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      setPermissionGranted(status.granted);
      if (status.granted) {
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      }
    })();

    return () => {
      if (autoStopTimer.current) clearTimeout(autoStopTimer.current);
    };
  }, []);

  const clearAutoStop = () => {
    if (autoStopTimer.current) {
      clearTimeout(autoStopTimer.current);
      autoStopTimer.current = null;
    }
  };

  const startRecording = async () => {
    if (permissionGranted === false) return;

    setErrorMessage(null);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
      recordingStartedAt.current = Date.now();
      setPhase('recording');

      autoStopTimer.current = setTimeout(() => {
        void stopRecording();
      }, MAX_RECORDING_MS);
    } catch {
      setPhase('error');
      setErrorMessage('Could not start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (phase !== 'recording') return;

    clearAutoStop();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const startedAt = recordingStartedAt.current ?? Date.now();
    const durationMs = Date.now() - startedAt;
    recordingStartedAt.current = null;

    if (durationMs < MIN_RECORDING_MS) {
      try {
        await recorder.stop();
      } catch {
        // ignore cleanup errors
      }
      setPhase('idle');
      setErrorMessage('Hold a little longer — speak for at least one second.');
      return;
    }

    setPhase('processing');

    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) {
        throw new Error('Recording file was not saved');
      }
      await onRecordingComplete(uri, durationMs);
    } catch (error) {
      setPhase('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  if (permissionGranted === false) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
          gap: 16,
        }}>
        <Text
          selectable
          style={{ color: PlatformColor('label'), fontSize: 17, textAlign: 'center' }}>
          Microphone access is required to capture voice notes.
        </Text>
        <Pressable
          onPress={() => Linking.openSettings()}
          style={{
            backgroundColor: PlatformColor('systemBlue'),
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
          }}>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600' }}>Open Settings</Text>
        </Pressable>
      </View>
    );
  }

  if (permissionGranted === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const isRecording = phase === 'recording';
  const durationMs = isRecording ? recorderState.durationMillis : 0;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        gap: 24,
      }}>
      {phase === 'processing' ? (
        <>
          <ActivityIndicator size="large" color={PlatformColor('systemBlue')} />
          <Text selectable style={{ color: PlatformColor('label'), fontSize: 17 }}>
            Turning your note into todos…
          </Text>
        </>
      ) : (
        <>
          <Text selectable style={{ color: PlatformColor('secondaryLabel'), fontSize: 17 }}>
            {isRecording ? 'Tap stop when finished' : 'Tap to record a voice note'}
          </Text>

          {isRecording ? (
            <Text
              selectable
              style={{
                color: PlatformColor('systemRed'),
                fontSize: 28,
                fontVariant: ['tabular-nums'],
                fontWeight: '600',
              }}>
              {formatDuration(durationMs)}
            </Text>
          ) : null}

          <Pressable
            onPress={isRecording ? stopRecording : startRecording}
            disabled={phase === 'error'}
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              backgroundColor: isRecording
                ? PlatformColor('systemRed')
                : PlatformColor('systemBlue'),
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isRecording
                ? '0 0 0 8px rgba(255, 59, 48, 0.25)'
                : '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}>
            <SymbolView
              name={{
                ios: isRecording ? 'stop.fill' : 'mic.fill',
                android: isRecording ? 'stop' : 'mic',
                web: isRecording ? 'stop' : 'mic',
              }}
              tintColor="#fff"
              size={36}
            />
          </Pressable>

          {errorMessage ? (
            <View style={{ gap: 12, alignItems: 'center' }}>
              <Text
                selectable
                style={{ color: PlatformColor('systemRed'), fontSize: 15, textAlign: 'center' }}>
                {errorMessage}
              </Text>
              <Pressable onPress={() => { setPhase('idle'); setErrorMessage(null); }}>
                <Text style={{ color: PlatformColor('systemBlue'), fontSize: 17, fontWeight: '600' }}>
                  Try again
                </Text>
              </Pressable>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}
