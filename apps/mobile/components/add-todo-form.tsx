import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  PlatformColor,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

type AddTodoFormProps = {
  onSubmit: (title: string) => void;
  submitLabel?: string;
};

export function AddTodoForm({ onSubmit, submitLabel = 'Add Todo' }: AddTodoFormProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSubmit(trimmed);
    setTitle('');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ gap: 12 }}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="What needs to get done?"
          placeholderTextColor={PlatformColor('placeholderText')}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          autoFocus
          style={{
            backgroundColor: PlatformColor('secondarySystemBackground'),
            color: PlatformColor('label'),
            borderRadius: 12,
            borderCurve: 'continuous',
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 17,
          }}
        />
        <Pressable
          onPress={handleSubmit}
          disabled={!title.trim()}
          style={{
            backgroundColor: PlatformColor('systemBlue'),
            opacity: title.trim() ? 1 : 0.45,
            borderRadius: 12,
            borderCurve: 'continuous',
            paddingVertical: 14,
            alignItems: 'center',
          }}>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600' }}>{submitLabel}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
