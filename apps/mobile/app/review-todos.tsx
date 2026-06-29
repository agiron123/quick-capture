import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { PlatformColor, Pressable, Text } from 'react-native';

import { ReviewTodosForm } from '@/components/review-todos-form';
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

  const captureSource: TodoSource =
    source === 'watch'
      ? 'watch'
      : source === 'voice'
        ? 'voice'
        : source === 'manual'
          ? 'manual'
          : 'capture';

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
          title:
            captureSource === 'watch'
              ? 'Review Watch Todos'
              : captureSource === 'voice'
                ? 'Review Voice Todos'
                : captureSource === 'manual'
                  ? 'Review Todos'
                  : 'Review Todos',
          headerRight: () => (
            <Pressable onPress={saveTodos} style={{ paddingHorizontal: 4 }}>
              <Text style={{ color: PlatformColor('systemBlue'), fontSize: 17, fontWeight: '600' }}>
                Save
              </Text>
            </Pressable>
          ),
        }}
      />

      <ReviewTodosForm
        source={captureSource}
        imageUri={typeof imageUri === 'string' ? imageUri : undefined}
        transcript={typeof transcript === 'string' ? transcript : undefined}
        draftTodos={draftTodos}
        onUpdateTodo={(index, value) => {
          setDraftTodos((current) => current.map((title, i) => (i === index ? value : title)));
        }}
        onRemoveTodo={(index) => {
          setDraftTodos((current) => current.filter((_, i) => i !== index));
        }}
        onAddTodo={() => setDraftTodos((current) => [...current, ''])}
      />
    </>
  );
}
