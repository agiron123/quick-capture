import * as Haptics from 'expo-haptics';
import { groupSubtasksByParent, getTopLevelTodos } from '@quick-capture/shared';
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
  highlightTodoId?: string | null;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (todos: Todo[]) => void;
};

function DraggableParentRow({
  item,
  drag,
  isActive,
  highlighted,
  highlightTodoId,
  subtasks,
  onToggle,
  onDelete,
}: RenderItemParams<Todo> & {
  highlighted: boolean;
  highlightTodoId?: string | null;
  subtasks: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <ScaleDecorator activeScale={1.02}>
      <View style={{ gap: 12 }}>
        <TodoItem
          todo={item}
          highlighted={highlighted}
          onToggle={onToggle}
          onDelete={onDelete}
          onDrag={drag}
          isDragging={isActive}
          canAddSubtask
        />
        {subtasks.map((subtask) => (
          <TodoItem
            key={subtask.id}
            todo={subtask}
            depth={1}
            highlighted={subtask.id === highlightTodoId}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </View>
    </ScaleDecorator>
  );
}

export function TodoList({
  listName,
  todos,
  highlightTodoId,
  onToggle,
  onDelete,
  onReorder,
}: TodoListProps) {
  const topLevelTodos = getTopLevelTodos(todos);
  const subtasksByParent = groupSubtasksByParent(todos);

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
      data={topLevelTodos}
      keyExtractor={(item) => item.id}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16, gap: 12 }}
      onDragEnd={handleDragEnd}
      renderItem={(params) => (
        <DraggableParentRow
          {...params}
          highlighted={params.item.id === highlightTodoId}
          highlightTodoId={highlightTodoId}
          subtasks={subtasksByParent.get(params.item.id) ?? []}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      )}
    />
  );
}
