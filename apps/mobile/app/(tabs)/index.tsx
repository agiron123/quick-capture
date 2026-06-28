import { PlatformColor, Text, View } from 'react-native';
import { useMemo, useState } from 'react';
import { filterTodos, type TodoStatusFilter } from '@quick-capture/shared';

import { TodoFilterBar } from '@/components/todo-filter-bar';
import { TodoList } from '@/components/todo-list';
import { useLists } from '@/hooks/use-lists';
import { useNotificationHighlight } from '@/hooks/use-notification-highlight';
import { useTodos } from '@/hooks/use-todos';

export default function TodosScreen() {
  const { activeList } = useLists();
  const { todos, toggleTodo, deleteTodo, reorderTodos } = useTodos();
  const highlightTodoId = useNotificationHighlight();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<TodoStatusFilter>('all');

  const filteredTodos = useMemo(
    () => filterTodos(todos, { query, status }),
    [todos, query, status]
  );

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

      {todos.length > 0 ? (
        <TodoFilterBar
          query={query}
          status={status}
          onQueryChange={setQuery}
          onStatusChange={setStatus}
        />
      ) : null}

      <TodoList
        listName={activeList?.name}
        todos={filteredTodos}
        highlightTodoId={highlightTodoId}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onReorder={reorderTodos}
      />
    </View>
  );
}
