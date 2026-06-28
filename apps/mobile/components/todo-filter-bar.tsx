import {
  collectTodoTags,
  filterTodos,
  type TodoDueFilter,
  type TodoPriority,
  type TodoStatusFilter,
} from '@quick-capture/shared';
import type { ReactNode } from 'react';
import { PlatformColor, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

type TodoFilterBarProps = {
  query: string;
  status: TodoStatusFilter;
  priority: TodoPriority | null;
  tag: string | null;
  due: TodoDueFilter;
  availableTags: string[];
  onQueryChange: (query: string) => void;
  onStatusChange: (status: TodoStatusFilter) => void;
  onPriorityChange: (priority: TodoPriority | null) => void;
  onTagChange: (tag: string | null) => void;
  onDueChange: (due: TodoDueFilter) => void;
};

const STATUS_OPTIONS: { value: TodoStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'done', label: 'Done' },
];

const DUE_OPTIONS: { value: TodoDueFilter; label: string }[] = [
  { value: 'all', label: 'Any due' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Today' },
  { value: 'no-due', label: 'No date' },
];

const PRIORITY_OPTIONS: { value: TodoPriority | null; label: string }[] = [
  { value: null, label: 'Any priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
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
        {label}
      </Text>
    </Pressable>
  );
}

function FilterRow({ children }: { children: ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {children}
    </ScrollView>
  );
}

export function TodoFilterBar({
  query,
  status,
  priority,
  tag,
  due,
  availableTags,
  onQueryChange,
  onStatusChange,
  onPriorityChange,
  onTagChange,
  onDueChange,
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
        {STATUS_OPTIONS.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            selected={status === option.value}
            onPress={() => onStatusChange(option.value)}
          />
        ))}
      </View>
      <FilterRow>
        {DUE_OPTIONS.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            selected={due === option.value}
            onPress={() => onDueChange(option.value)}
          />
        ))}
      </FilterRow>
      <FilterRow>
        {PRIORITY_OPTIONS.map((option) => (
          <FilterChip
            key={option.label}
            label={option.label}
            selected={priority === option.value}
            onPress={() => onPriorityChange(option.value)}
          />
        ))}
      </FilterRow>
      {availableTags.length > 0 ? (
        <FilterRow>
          <FilterChip label="All tags" selected={!tag} onPress={() => onTagChange(null)} />
          {availableTags.map((item) => (
            <FilterChip
              key={item}
              label={item}
              selected={tag === item}
              onPress={() => onTagChange(item)}
            />
          ))}
        </FilterRow>
      ) : null}
    </View>
  );
}

export { collectTodoTags, filterTodos };
