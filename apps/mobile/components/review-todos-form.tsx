import { Image } from 'expo-image';
import {
  PlatformColor,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { TodoSource } from '@/types/todo';

type ReviewTodosFormProps = {
  source: TodoSource;
  imageUri?: string;
  transcript?: string;
  draftTodos: string[];
  onUpdateTodo: (index: number, value: string) => void;
  onRemoveTodo: (index: number) => void;
  onAddTodo: () => void;
};

export function ReviewTodosForm({
  source,
  imageUri,
  transcript,
  draftTodos,
  onUpdateTodo,
  onRemoveTodo,
  onAddTodo,
}: ReviewTodosFormProps) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 16, gap: 16 }}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{
            width: '100%',
            height: 180,
            borderRadius: 14,
          }}
          contentFit="cover"
        />
      ) : null}

      {transcript && transcript.length > 0 ? (
        <View
          style={{
            backgroundColor: PlatformColor('secondarySystemBackground'),
            borderRadius: 12,
            padding: 14,
            gap: 6,
          }}>
          <Text style={{ color: PlatformColor('secondaryLabel'), fontSize: 13, fontWeight: '600' }}>
            Transcript
          </Text>
          <Text selectable style={{ color: PlatformColor('label'), fontSize: 16, lineHeight: 22 }}>
            {transcript}
          </Text>
        </View>
      ) : null}

      <Text selectable style={{ color: PlatformColor('secondaryLabel'), fontSize: 15 }}>
        {source === 'voice'
          ? 'Edit the todos extracted from your voice note.'
          : 'Edit the extracted todos before saving.'}
      </Text>

      <View style={{ gap: 12 }}>
        {draftTodos.map((title, index) => (
          <View key={`${index}-${title}`} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TextInput
              value={title}
              onChangeText={(value) => onUpdateTodo(index, value)}
              placeholder="Todo title"
              placeholderTextColor={PlatformColor('placeholderText')}
              style={{
                flex: 1,
                backgroundColor: PlatformColor('secondarySystemBackground'),
                color: PlatformColor('label'),
                borderRadius: 12,
                borderCurve: 'continuous',
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 17,
              }}
            />
            <Pressable onPress={() => onRemoveTodo(index)}>
              <Text style={{ color: PlatformColor('systemRed'), fontSize: 15 }}>Remove</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <Pressable onPress={onAddTodo}>
        <Text style={{ color: PlatformColor('systemBlue'), fontSize: 17, fontWeight: '600' }}>
          Add another
        </Text>
      </Pressable>
    </ScrollView>
  );
}
