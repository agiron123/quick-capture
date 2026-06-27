import { Link } from 'expo-router';
import { PlatformColor, Pressable, Text } from 'react-native';

export function AddTodoHeaderButton() {
  return (
    <Link href="/add-todo" asChild>
      <Pressable style={{ paddingHorizontal: 4 }}>
        <Text style={{ color: PlatformColor('systemBlue'), fontSize: 17, fontWeight: '600' }}>Add</Text>
      </Pressable>
    </Link>
  );
}
