import { FlatList, PlatformColor, Text, View } from 'react-native';

import { TodoItem } from '@/components/todo-item';
import type { Todo } from '@/types/todo';

type TodoListProps = {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 8 }}>
        <Text selectable style={{ color: PlatformColor('label'), fontSize: 20, fontWeight: '600' }}>
          No todos yet
        </Text>
        <Text
          selectable
          style={{ color: PlatformColor('secondaryLabel'), fontSize: 16, textAlign: 'center' }}>
          Capture a handwritten note or add a todo manually to get started.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={todos}
      keyExtractor={(item) => item.id}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => (
        <TodoItem todo={item} onToggle={onToggle} onDelete={onDelete} />
      )}
    />
  );
}
