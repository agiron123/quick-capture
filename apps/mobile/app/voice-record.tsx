import { router, Stack } from 'expo-router';
import { Alert, PlatformColor, View } from 'react-native';

import { VoiceRecorder } from '@/components/voice-recorder';
import { extractTodosFromVoice } from '@/services/ai-extract-todos-from-voice';

export default function VoiceRecordModal() {
  const handleRecordingComplete = async (uri: string) => {
    try {
      const { transcript, todos } = await extractTodosFromVoice(uri);

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
                    source: 'voice',
                    audioUri: uri,
                    transcript,
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
          source: 'voice',
          audioUri: uri,
          transcript,
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
