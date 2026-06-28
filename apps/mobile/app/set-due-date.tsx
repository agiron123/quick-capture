import DateTimePicker from '@react-native-community/datetimepicker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, PlatformColor, Pressable, ScrollView, Text, View } from 'react-native';

import { DUE_DATE_PRESETS, dateToDueAt } from '@/constants/due-dates';
import { useTodos } from '@/hooks/use-todos';
import { formatDueDateLabel } from '@/utils/format-due-date';

export default function SetDueDateModal() {
  const { todoId } = useLocalSearchParams<{ todoId?: string }>();
  const { getTodoById, setDueDate } = useTodos();
  const todo = typeof todoId === 'string' ? getTodoById(todoId) : undefined;

  const initialDate = useMemo(() => {
    if (todo?.dueAt) {
      const existing = new Date(todo.dueAt);
      if (!Number.isNaN(existing.getTime())) return existing;
    }
    return DUE_DATE_PRESETS[0]?.getDate() ?? new Date();
  }, [todo?.dueAt]);

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [isSaving, setIsSaving] = useState(false);

  if (!todo) {
    return (
      <>
        <Stack.Screen options={{ title: 'Due date' }} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: PlatformColor('label'), fontSize: 17 }}>Todo not found</Text>
        </View>
      </>
    );
  }

  const saveDueDate = async (date: Date | null) => {
    setIsSaving(true);
    try {
      const dueAt = date ? dateToDueAt(date) : null;
      await setDueDate(todo.id, dueAt);
      router.back();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Due date' }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, gap: 20 }}>
        <View style={{ gap: 6 }}>
          <Text style={{ color: PlatformColor('secondaryLabel'), fontSize: 15, fontWeight: '600' }}>
            Todo
          </Text>
          <Text selectable style={{ color: PlatformColor('label'), fontSize: 17 }}>
            {todo.title}
          </Text>
          {todo.dueAt ? (
            <Text style={{ color: PlatformColor('secondaryLabel'), fontSize: 14 }}>
              Current: {formatDueDateLabel(todo.dueAt, todo.completed)}
            </Text>
          ) : null}
        </View>

        <View style={{ gap: 10 }}>
          <Text style={{ color: PlatformColor('secondaryLabel'), fontSize: 15, fontWeight: '600' }}>
            Quick picks
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {DUE_DATE_PRESETS.map((preset) => (
              <Pressable
                key={preset.label}
                onPress={() => setSelectedDate(preset.getDate())}
                style={{
                  backgroundColor: PlatformColor('secondarySystemBackground'),
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 999,
                }}>
                <Text style={{ color: PlatformColor('label'), fontSize: 15 }}>{preset.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View
          style={{
            backgroundColor: PlatformColor('secondarySystemBackground'),
            borderRadius: 14,
            padding: 12,
            alignItems: Platform.OS === 'ios' ? 'center' : 'stretch',
          }}>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, date) => {
              if (date) setSelectedDate(date);
            }}
          />
        </View>

        <Text selectable style={{ color: PlatformColor('secondaryLabel'), fontSize: 15 }}>
          {formatDueDateLabel(dateToDueAt(selectedDate), todo.completed)}
        </Text>

        <View style={{ gap: 10 }}>
          <Pressable
            onPress={() => void saveDueDate(selectedDate)}
            disabled={isSaving}
            style={{
              backgroundColor: PlatformColor('systemBlue'),
              opacity: isSaving ? 0.6 : 1,
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
            }}>
            <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600' }}>Save due date</Text>
          </Pressable>

          {todo.dueAt ? (
            <Pressable
              onPress={() => void saveDueDate(null)}
              disabled={isSaving}
              style={{
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
              }}>
              <Text style={{ color: PlatformColor('systemRed'), fontSize: 17, fontWeight: '600' }}>
                Clear due date
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}
