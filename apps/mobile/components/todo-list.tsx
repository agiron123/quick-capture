import * as Haptics from 'expo-haptics';
import { PlatformColor, Text, View } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';

import { TodoItem } from '@/components/todo-item';
import type { Todo } from '@/types/todo';

type TodoListProps = {
  listName?: string;
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (todos: Todo[]) => void;
};

function DraggableTodoRow({
  item,
  drag,
  isActive,
  onToggle,
  onDelete,
}: RenderItemParams<Todo> & {
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <ScaleDecorator activeScale={1.03}>
      <TodoItem
        todo={item}
        onToggle={onToggle}
        onDelete={onDelete}
        onDrag={drag}
        isDragging={isActive}
      />
    </ScaleDecorator>
  );
}

export function TodoList({ listName, todos, onToggle, onDelete, onReorder }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 8 }}>
        <Text selectable style={{ color: PlatformColor('label'), fontSize: 20, fontWeight: '600' }}>
          {listName ? `No todos in ${listName}` : 'No todos yet'}
        </Text>
        <Text
          selectable
          style={{ color: PlatformColor('secondaryLabel'), fontSize: 16, textAlign: 'center' }}>
          Capture a note, record a voice memo, or add a todo manually to get started.
        </Text>
      </View>
    );
  }

  const handleDragEnd = async ({ data }: { data: Todo[] }) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReorder(data);
  };

  return (
    <DraggableFlatList
      data={todos}
      keyExtractor={(item) => item.id}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16, gap: 12 }}
      onDragEnd={handleDragEnd}
      renderItem={(params) => (
        <DraggableTodoRow {...params} onToggle={onToggle} onDelete={onDelete} />
      )}
    />
  );
}
