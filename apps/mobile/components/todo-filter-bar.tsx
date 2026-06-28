import { filterTodos, type TodoStatusFilter } from '@quick-capture/shared';
import { PlatformColor, Pressable, Text, TextInput, View } from 'react-native';

type TodoFilterBarProps = {
  query: string;
  status: TodoStatusFilter;
  onQueryChange: (query: string) => void;
  onStatusChange: (status: TodoStatusFilter) => void;
};

const STATUS_OPTIONS: { value: TodoStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'done', label: 'Done' },
];

export function TodoFilterBar({
  query,
  status,
  onQueryChange,
  onStatusChange,
}: TodoFilterBarProps) {
  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 8, gap: 10 }}>
      <TextInput
        value={query}
        onChangeText={onQueryChange}
        placeholder="Search todos"
        placeholderTextColor={PlatformColor('placeholderText')}
        clearButtonMode="while-editing"
        style={{
          backgroundColor: PlatformColor('secondarySystemBackground'),
          color: PlatformColor('label'),
          borderRadius: 10,
          borderCurve: 'continuous',
          paddingHorizontal: 14,
          paddingVertical: 10,
          fontSize: 16,
        }}
      />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {STATUS_OPTIONS.map((option) => {
          const selected = status === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onStatusChange(option.value)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: selected
                  ? PlatformColor('systemBlue')
                  : PlatformColor('secondarySystemBackground'),
              }}>
              <Text
                style={{
                  color: selected ? '#fff' : PlatformColor('label'),
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export { filterTodos };
