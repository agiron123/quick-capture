import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AddTodoForm } from '@/components/add-todo-form';
import { useTodos } from '@/hooks/use-todos';

export default function AddSubtaskModal() {
  const { todoId } = useLocalSearchParams<{ todoId: string }>();
  const { addSubtask, getTodoById } = useTodos();

  const parent = todoId ? getTodoById(todoId) : undefined;

  return (
    <>
      <Stack.Screen options={{ title: 'Add Subtask' }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', gap: 16 }}>
          <AddTodoForm
            placeholder={parent ? `Subtask for "${parent.title}"` : 'Subtask title'}
            submitLabel="Add Subtask"
            onSubmit={(title) => {
              if (todoId) {
                addSubtask(todoId, title);
              }
              router.back();
            }}
          />
        </View>
      </ScrollView>
    </>
  );
}
