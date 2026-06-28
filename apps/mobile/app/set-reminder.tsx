import DateTimePicker from '@react-native-community/datetimepicker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    Alert,
    Linking,
    Platform,
    PlatformColor,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';

import { REMINDER_PRESETS } from '@/constants/reminders';
import { useTodos } from '@/hooks/use-todos';
import { formatReminderLabel } from '@/utils/format-reminder';

export default function SetReminderModal() {
  const { todoId } = useLocalSearchParams<{ todoId?: string }>();
  const { getTodoById, setReminder } = useTodos();
  const todo = typeof todoId === 'string' ? getTodoById(todoId) : undefined;

  const initialDate = useMemo(() => {
    if (todo?.reminderAt) {
      const existing = new Date(todo.reminderAt);
      if (!Number.isNaN(existing.getTime()) && existing.getTime() > Date.now()) {
        return existing;
      }
    }
    const preset = REMINDER_PRESETS[0]?.getDate() ?? new Date(Date.now() + 60 * 60 * 1000);
    return preset;
  }, [todo?.reminderAt]);

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [isSaving, setIsSaving] = useState(false);

  if (!todo) {
    return (
      <>
        <Stack.Screen options={{ title: 'Reminder' }} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: PlatformColor('label'), fontSize: 17 }}>Todo not found</Text>
        </View>
      </>
    );
  }

  const saveReminder = async (date: Date | null) => {
    setIsSaving(true);
    try {
      const reminderAt = date ? date.toISOString() : null;
      if (reminderAt && date && date.getTime() <= Date.now()) {
        Alert.alert('Pick a future time', 'Reminders must be scheduled in the future.');
        return;
      }

      const scheduled = await setReminder(todo.id, reminderAt);
      if (reminderAt && !scheduled) {
        Alert.alert(
          'Notifications disabled',
          'Your reminder was saved, but notifications are off. Enable them in Settings to get alerts.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
      router.back();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Set Reminder' }} />
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
          {todo.reminderAt ? (
            <Text style={{ color: PlatformColor('secondaryLabel'), fontSize: 14 }}>
              Current: {formatReminderLabel(todo.reminderAt)}
            </Text>
          ) : null}
        </View>

        <View style={{ gap: 10 }}>
          <Text style={{ color: PlatformColor('secondaryLabel'), fontSize: 15, fontWeight: '600' }}>
            Quick picks
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {REMINDER_PRESETS.map((preset) => (
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
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={(_, date) => {
              if (date) setSelectedDate(date);
            }}
          />
        </View>

        <Text selectable style={{ color: PlatformColor('secondaryLabel'), fontSize: 15 }}>
          {formatReminderLabel(selectedDate.toISOString())}
        </Text>

        <View style={{ gap: 10 }}>
          <Pressable
            onPress={() => void saveReminder(selectedDate)}
            disabled={isSaving}
            style={{
              backgroundColor: PlatformColor('systemBlue'),
              opacity: isSaving ? 0.6 : 1,
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
            }}>
            <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600' }}>Save reminder</Text>
          </Pressable>

          {todo.reminderAt ? (
            <Pressable
              onPress={() => void saveReminder(null)}
              disabled={isSaving}
              style={{
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
              }}>
              <Text style={{ color: PlatformColor('systemRed'), fontSize: 17, fontWeight: '600' }}>
                Clear reminder
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}
