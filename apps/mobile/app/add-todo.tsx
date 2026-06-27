import { router, Stack } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AddTodoForm } from '@/components/add-todo-form';
import { useTodos } from '@/hooks/use-todos';

export default function AddTodoModal() {
  const { addTodo } = useTodos();

  return (
    <>
      <Stack.Screen options={{ title: 'Add Todo' }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', gap: 16 }}>
          <AddTodoForm
            onSubmit={(title) => {
              addTodo(title, 'manual');
              router.back();
            }}
          />
        </View>
      </ScrollView>
    </>
  );
}
