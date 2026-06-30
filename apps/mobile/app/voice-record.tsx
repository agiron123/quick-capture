import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, PlatformColor, View } from 'react-native';

import { VoiceRecorder } from '@/components/voice-recorder';
import { extractTodosFromVoice } from '@/services/ai-extract-todos-from-voice';
import type { TodoSource } from '@/types/todo';

export default function VoiceRecordModal() {
  const { origin } = useLocalSearchParams<{ origin?: string }>();
  const reviewSource: TodoSource = origin === 'watch' ? 'watch' : 'voice';

  const handleRecordingComplete = async ({
    uri,
    transcript,
  }: {
    uri?: string;
    durationMs: number;
    transcript?: string;
  }) => {
    try {
      const { transcript: resolvedTranscript, todos } = await extractTodosFromVoice(uri, transcript);

      if (todos.length === 0) {
        Alert.alert(
          'No todos found',
          'Try speaking more clearly, or add todos manually from the transcript.',
          [
            {
              text: 'Review anyway',
              onPress: () =>
                router.replace({
                  pathname: '/review-todos',
                  params: {
                    source: reviewSource,
                    audioUri: uri,
                    transcript: resolvedTranscript,
                    todos: JSON.stringify([]),
                  },
                }),
            },
            { text: 'Cancel', style: 'cancel', onPress: () => router.back() },
          ]
        );
        return;
      }

      router.replace({
        pathname: '/review-todos',
        params: {
          source: reviewSource,
          audioUri: uri,
          transcript: resolvedTranscript,
          todos: JSON.stringify(todos),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      Alert.alert('Could not process voice note', message);
      throw error;
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Voice Note', presentation: 'modal' }} />
      <View style={{ flex: 1, backgroundColor: PlatformColor('systemBackground') }}>
        <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
      </View>
    </>
  );
}
