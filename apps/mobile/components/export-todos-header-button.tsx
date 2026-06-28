import * as Haptics from 'expo-haptics';
import { PlatformColor, Pressable, Text } from 'react-native';

import { useLists } from '@/hooks/use-lists';
import { useTodos } from '@/hooks/use-todos';
import { shareTodosAsText } from '@/utils/export-todos';

export function ExportTodosHeaderButton() {
  const { activeList } = useLists();
  const { todos } = useTodos();

  const handlePress = async () => {
    if (todos.length === 0) return;
    await Haptics.selectionAsync();
    await shareTodosAsText(todos, activeList?.name);
  };

  return (
    <Pressable
      onPress={() => void handlePress()}
      disabled={todos.length === 0}
      style={{ paddingHorizontal: 4, opacity: todos.length === 0 ? 0.4 : 1 }}>
      <Text style={{ color: PlatformColor('systemBlue'), fontSize: 17, fontWeight: '600' }}>
        Share
      </Text>
    </Pressable>
  );
}
