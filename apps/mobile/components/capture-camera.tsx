import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  PlatformColor,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CaptureCameraProps = {
  onCapture: (uri: string) => Promise<void>;
  isProcessing?: boolean;
};

export function CaptureCamera({ onCapture, isProcessing = false }: CaptureCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const { bottom } = useSafeAreaInsets();

  if (!permission?.granted) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: PlatformColor('systemBackground'),
          padding: 24,
          gap: 16,
        }}>
        <Text
          selectable
          style={{
            color: PlatformColor('label'),
            fontSize: 17,
            textAlign: 'center',
          }}>
          Camera access is required to capture handwritten notes.
        </Text>
        <Pressable
          onPress={requestPermission}
          style={{
            backgroundColor: PlatformColor('systemBlue'),
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
            borderCurve: 'continuous',
          }}>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600' }}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  const takePhoto = async () => {
    if (isProcessing || !cameraRef.current) return;
    await Haptics.selectionAsync();
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    if (photo?.uri) {
      await onCapture(photo.uri);
    }
  };

  const selectPhoto = async () => {
    if (isProcessing) return;
    await Haptics.selectionAsync();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      await onCapture(result.assets[0].uri);
    }
  };

  const flipCamera = async () => {
    await Haptics.selectionAsync();
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} />

      {isProcessing ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'rgba(0,0,0,0.55)',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 12,
            },
          ]}>
          <ActivityIndicator size="large" color="#fff" />
          <Text selectable style={{ color: '#fff', fontSize: 17 }}>
            Extracting todos from your note…
          </Text>
        </View>
      ) : null}

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: bottom + 16,
          alignItems: 'center',
          gap: 20,
        }}>
        <Pressable
          onPress={takePhoto}
          disabled={isProcessing}
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: '#fff',
            borderWidth: 4,
            borderColor: 'rgba(255,255,255,0.35)',
            opacity: isProcessing ? 0.5 : 1,
          }}
        />

        <View style={{ flexDirection: 'row', gap: 24 }}>
          <CameraActionButton label="Gallery" onPress={selectPhoto} disabled={isProcessing} />
          <CameraActionButton label="Flip" onPress={flipCamera} disabled={isProcessing} />
        </View>
      </View>
    </View>
  );
}

function CameraActionButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: 'rgba(255,255,255,0.18)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        borderCurve: 'continuous',
        opacity: disabled ? 0.5 : 1,
      }}>
      <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}
