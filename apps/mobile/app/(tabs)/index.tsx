import { collectTodoTags, filterTodos, type TodoDueFilter, type TodoPriority, type TodoStatusFilter } from '@quick-capture/shared';
import { useMemo, useState } from 'react';
import { PlatformColor, Text, View } from 'react-native';

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
  const [priorityFilter, setPriorityFilter] = useState<TodoPriority | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [due, setDue] = useState<TodoDueFilter>('all');

  const availableTags = useMemo(() => collectTodoTags(todos), [todos]);

  const filteredTodos = useMemo(
    () => filterTodos(todos, { query, status, priority: priorityFilter, tag, due }),
    [todos, query, status, priorityFilter, tag, due]
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
          priority={priorityFilter}
          tag={tag}
          due={due}
          availableTags={availableTags}
          onQueryChange={setQuery}
          onStatusChange={setStatus}
          onPriorityChange={setPriorityFilter}
          onTagChange={setTag}
          onDueChange={setDue}
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
