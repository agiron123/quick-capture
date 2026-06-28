import { router, Stack, useLocalSearchParams } from 'expo-router';
import { PlatformColor, Pressable, ScrollView, Text, View } from 'react-native';

import { PRIORITY_LABELS, TODO_PRIORITIES } from '@/constants/priority';
import { useTodos } from '@/hooks/use-todos';
import type { TodoPriority } from '@/types/todo';
import { formatPriorityLabel, priorityAccentColor } from '@/utils/format-priority';

export default function SetPriorityModal() {
  const { todoId } = useLocalSearchParams<{ todoId?: string }>();
  const { getTodoById, setPriority } = useTodos();
  const todo = typeof todoId === 'string' ? getTodoById(todoId) : undefined;

  if (!todo) {
    return (
      <>
        <Stack.Screen options={{ title: 'Priority' }} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: PlatformColor('label'), fontSize: 17 }}>Todo not found</Text>
        </View>
      </>
    );
  }

  const savePriority = async (priority: TodoPriority | null) => {
    await setPriority(todo.id, priority);
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Priority' }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={{ gap: 6 }}>
          <Text style={{ color: PlatformColor('secondaryLabel'), fontSize: 15, fontWeight: '600' }}>
            Todo
          </Text>
          <Text selectable style={{ color: PlatformColor('label'), fontSize: 17 }}>
            {todo.title}
          </Text>
          {todo.priority ? (
            <Text style={{ color: priorityAccentColor(todo.priority), fontSize: 14 }}>
              Current: {formatPriorityLabel(todo.priority)}
            </Text>
          ) : null}
        </View>

        <View style={{ gap: 10 }}>
          {TODO_PRIORITIES.map((priority) => (
            <Pressable
              key={priority}
              onPress={() => void savePriority(priority)}
              style={{
                backgroundColor: PlatformColor('secondarySystemBackground'),
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderWidth: todo.priority === priority ? 2 : 0,
                borderColor: priorityAccentColor(priority),
              }}>
              <Text
                style={{
                  color: priorityAccentColor(priority),
                  fontSize: 17,
                  fontWeight: todo.priority === priority ? '700' : '600',
                }}>
                {PRIORITY_LABELS[priority]}
              </Text>
            </Pressable>
          ))}

          {todo.priority ? (
            <Pressable
              onPress={() => void savePriority(null)}
              style={{
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
              }}>
              <Text style={{ color: PlatformColor('systemRed'), fontSize: 17, fontWeight: '600' }}>
                Clear priority
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}
