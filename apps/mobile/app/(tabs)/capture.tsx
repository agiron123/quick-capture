import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, PlatformColor, View } from 'react-native';

import { CaptureCamera } from '@/components/capture-camera';
import { extractTodosFromImage } from '@/services/ai-extract-todos';

export default function CaptureScreen() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCapture = async (uri: string) => {
    setIsProcessing(true);
    try {
      const extracted = await extractTodosFromImage(uri);

      if (extracted.length === 0) {
        Alert.alert('No todos found', 'Try a clearer photo or add todos manually.');
        return;
      }

      router.push({
        pathname: '/review-todos',
        params: {
          imageUri: uri,
          todos: JSON.stringify(extracted),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      Alert.alert('Could not process note', message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: PlatformColor('systemBackground') }}>
      <CaptureCamera onCapture={handleCapture} isProcessing={isProcessing} />
    </View>
  );
}
