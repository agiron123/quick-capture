import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
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
import type { ExtractedTodo } from '@/types/todo';

export default function ReviewTodosModal() {
  const { imageUri, todos: todosParam } = useLocalSearchParams<{
    imageUri?: string;
    todos?: string;
  }>();
  const { addTodos } = useTodos();

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
          source: 'capture' as const,
          noteImageUri: typeof imageUri === 'string' ? imageUri : undefined,
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
