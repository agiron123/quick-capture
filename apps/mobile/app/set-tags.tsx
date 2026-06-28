import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  PlatformColor,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { MAX_TAG_LENGTH, MAX_TODO_TAGS, normalizeTodoTags } from '@quick-capture/shared';

import { useTodos } from '@/hooks/use-todos';
import { formatTagsLabel } from '@/utils/format-tags';

export default function SetTagsModal() {
  const { todoId } = useLocalSearchParams<{ todoId?: string }>();
  const { getTodoById, setTags } = useTodos();
  const todo = typeof todoId === 'string' ? getTodoById(todoId) : undefined;
  const [draft, setDraft] = useState(todo?.tags ?? []);
  const [input, setInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!todo) {
    return (
      <>
        <Stack.Screen options={{ title: 'Tags' }} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: PlatformColor('label'), fontSize: 17 }}>Todo not found</Text>
        </View>
      </>
    );
  }

  const addTag = () => {
    const next = normalizeTodoTags([...draft, input]);
    if (next.length === draft.length && input.trim()) return;
    setDraft(next);
    setInput('');
  };

  const removeTag = (tag: string) => {
    setDraft(draft.filter((item) => item !== tag));
  };

  const saveTags = async () => {
    setIsSaving(true);
    try {
      await setTags(todo.id, draft);
      router.back();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Tags' }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, gap: 20 }}>
        <View style={{ gap: 6 }}>
          <Text style={{ color: PlatformColor('secondaryLabel'), fontSize: 15, fontWeight: '600' }}>
            Todo
          </Text>
          <Text selectable style={{ color: PlatformColor('label'), fontSize: 17 }}>
            {todo.title}
          </Text>
          {todo.tags?.length ? (
            <Text style={{ color: PlatformColor('secondaryLabel'), fontSize: 14 }}>
              Current: {formatTagsLabel(todo.tags)}
            </Text>
          ) : null}
        </View>

        <View style={{ gap: 10 }}>
          <Text style={{ color: PlatformColor('secondaryLabel'), fontSize: 15, fontWeight: '600' }}>
            Add tag
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="work, errands…"
              maxLength={MAX_TAG_LENGTH}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={addTag}
              style={{
                flex: 1,
                backgroundColor: PlatformColor('secondarySystemBackground'),
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                color: PlatformColor('label'),
                fontSize: 17,
              }}
            />
            <Pressable
              onPress={addTag}
              disabled={!input.trim() || draft.length >= MAX_TODO_TAGS}
              style={{
                backgroundColor: PlatformColor('systemBlue'),
                opacity: !input.trim() || draft.length >= MAX_TODO_TAGS ? 0.5 : 1,
                borderRadius: 12,
                paddingHorizontal: 16,
                justifyContent: 'center',
              }}>
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600' }}>Add</Text>
            </Pressable>
          </View>
          <Text style={{ color: PlatformColor('tertiaryLabel'), fontSize: 13 }}>
            Up to {MAX_TODO_TAGS} tags, {MAX_TAG_LENGTH} characters each
          </Text>
        </View>

        {draft.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {draft.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => removeTag(tag)}
                style={{
                  backgroundColor: PlatformColor('secondarySystemBackground'),
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}>
                <Text style={{ color: PlatformColor('label'), fontSize: 15 }}>#{tag} ×</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Pressable
          onPress={() => void saveTags()}
          disabled={isSaving}
          style={{
            backgroundColor: PlatformColor('systemBlue'),
            opacity: isSaving ? 0.6 : 1,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
          }}>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600' }}>Save tags</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}
