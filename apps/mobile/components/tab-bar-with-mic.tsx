import * as Haptics from 'expo-haptics';
import { router, type Href } from 'expo-router';
import {
  BottomTabBar,
  type BottomTabBarProps,
} from 'expo-router/build/react-navigation/bottom-tabs';
import { SymbolView } from 'expo-symbols';
import { PlatformColor, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function TabBarWithMic(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const openVoiceCapture = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/voice-record' as Href);
  };

  return (
    <View>
      <BottomTabBar {...props} />
      <View
        style={{
          position: 'absolute',
          alignSelf: 'center',
          bottom: insets.bottom + 20,
        }}>
        <Pressable
          onPress={openVoiceCapture}
          accessibilityRole="button"
          accessibilityLabel="Record voice note"
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: PlatformColor('systemBlue'),
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
          }}>
          <SymbolView
            name={{ ios: 'mic.fill', android: 'mic', web: 'mic' }}
            tintColor="#fff"
            size={26}
          />
        </Pressable>
      </View>
    </View>
  );
}
