import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  PlatformColor,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useTodos } from '@/hooks/use-todos';
import type { ExtractedTodo, TodoSource } from '@/types/todo';

export default function ReviewTodosModal() {
  const { imageUri, audioUri, transcript, todos: todosParam, source } =
    useLocalSearchParams<{
      imageUri?: string;
      audioUri?: string;
      transcript?: string;
      todos?: string;
      source?: string;
    }>();
  const { addTodos } = useTodos();

  const captureSource: TodoSource = source === 'voice' ? 'voice' : 'capture';

  const initialTodos = useMemo(() => {
    if (!todosParam) return [];
    try {
      return JSON.parse(todosParam) as ExtractedTodo[];
    } catch {
      return [];
    }
  }, [todosParam]);

  const [draftTodos, setDraftTodos] = useState<string[]>(
    initialTodos.map((todo) => todo.title)
  );

  const updateTodo = (index: number, value: string) => {
    setDraftTodos((current) => current.map((title, i) => (i === index ? value : title)));
  };

  const removeTodo = (index: number) => {
    setDraftTodos((current) => current.filter((_, i) => i !== index));
  };

  const addEmptyTodo = () => {
    setDraftTodos((current) => [...current, '']);
  };

  const saveTodos = () => {
    addTodos(
      draftTodos
        .map((title) => title.trim())
        .filter(Boolean)
        .map((title) => ({
          title,
          source: captureSource,
          noteImageUri: typeof imageUri === 'string' ? imageUri : undefined,
          noteAudioUri: typeof audioUri === 'string' ? audioUri : undefined,
          transcript: typeof transcript === 'string' ? transcript : undefined,
        }))
    );
    router.replace('/(tabs)');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Review Todos',
          headerRight: () => (
            <Pressable onPress={saveTodos} style={{ paddingHorizontal: 4 }}>
              <Text style={{ color: PlatformColor('systemBlue'), fontSize: 17, fontWeight: '600' }}>
                Save
              </Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, gap: 16 }}>
        {typeof imageUri === 'string' ? (
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

        {typeof transcript === 'string' && transcript.length > 0 ? (
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
          Edit the extracted todos before saving.
        </Text>

        <View style={{ gap: 12 }}>
          {draftTodos.map((title, index) => (
            <View key={`${index}-${title}`} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <TextInput
                value={title}
                onChangeText={(value) => updateTodo(index, value)}
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
              <Pressable onPress={() => removeTodo(index)}>
                <Text style={{ color: PlatformColor('systemRed'), fontSize: 15 }}>Remove</Text>
              </Pressable>
            </View>
          ))}
        </View>

        <Pressable onPress={addEmptyTodo}>
          <Text style={{ color: PlatformColor('systemBlue'), fontSize: 17, fontWeight: '600' }}>
            Add another
          </Text>
        </Pressable>
      </ScrollView>
    </>
  );
}
