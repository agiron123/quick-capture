import { PlatformColor, Text, View } from 'react-native';

import { TodoList } from '@/components/todo-list';
import { useTodos } from '@/hooks/use-todos';

export default function TodosScreen() {
  const { todos, toggleTodo, deleteTodo, reorderTodos } = useTodos();

  const pendingCount = todos.filter((todo) => !todo.completed).length;

  return (
    <View style={{ flex: 1, backgroundColor: PlatformColor('systemBackground') }}>
      {todos.length > 0 ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
          <Text selectable style={{ color: PlatformColor('secondaryLabel'), fontSize: 15 }}>
            {pendingCount} open · {todos.length - pendingCount} done
          </Text>
        </View>
      ) : null}

      <TodoList
        todos={todos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onReorder={reorderTodos}
      />
    </View>
  );
}
