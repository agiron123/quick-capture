import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { PlatformColor, Pressable, Text, View } from 'react-native';

import type { Todo } from '@/types/todo';

type TodoItemProps = {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const handleToggle = async () => {
    await Haptics.selectionAsync();
    onToggle(todo.id);
  };

  const handleDelete = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete(todo.id);
  };

  return (
    <View
      style={{
        backgroundColor: PlatformColor('secondarySystemBackground'),
        borderRadius: 14,
        borderCurve: 'continuous',
        padding: 14,
        gap: 10,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <Pressable
        onPress={handleToggle}
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          borderWidth: 2,
          borderColor: todo.completed ? PlatformColor('systemGreen') : PlatformColor('systemBlue'),
          backgroundColor: todo.completed ? PlatformColor('systemGreen') : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {todo.completed ? <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>✓</Text> : null}
      </Pressable>

      <View style={{ flex: 1, gap: 4 }}>
        <Text
          selectable
          style={{
            color: PlatformColor('label'),
            fontSize: 17,
            textDecorationLine: todo.completed ? 'line-through' : 'none',
            opacity: todo.completed ? 0.55 : 1,
          }}>
          {todo.title}
        </Text>
        <Text selectable style={{ color: PlatformColor('secondaryLabel'), fontSize: 13 }}>
          {todo.source === 'capture' ? 'From note capture' : 'Added manually'}
        </Text>
      </View>

      {todo.noteImageUri ? (
        <Image
          source={{ uri: todo.noteImageUri }}
          style={{ width: 44, height: 44, borderRadius: 8 }}
          contentFit="cover"
        />
      ) : null}

      <Pressable onPress={handleDelete} hitSlop={8}>
        <Text style={{ color: PlatformColor('systemRed'), fontSize: 15, fontWeight: '600' }}>Delete</Text>
      </Pressable>
    </View>
  );
}
