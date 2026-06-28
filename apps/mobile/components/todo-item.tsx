import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { PlatformColor, Pressable, Text, View } from 'react-native';

import type { Todo } from '@/types/todo';
import { formatDueDateLabel, isDueOverdue } from '@/utils/format-due-date';
import { formatReminderLabel } from '@/utils/format-reminder';

type TodoItemProps = {
  todo: Todo;
  highlighted?: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDrag?: () => void;
  isDragging?: boolean;
};

export function TodoItem({
  todo,
  highlighted = false,
  onToggle,
  onDelete,
  onDrag,
  isDragging,
}: TodoItemProps) {
  const handleToggle = async () => {
    await Haptics.selectionAsync();
    onToggle(todo.id);
  };

  const handleDelete = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete(todo.id);
  };

  const openReminder = async () => {
    await Haptics.selectionAsync();
    router.push({ pathname: '/set-reminder', params: { todoId: todo.id } } as Href);
  };

  const openDueDate = async () => {
    await Haptics.selectionAsync();
    router.push({ pathname: '/set-due-date', params: { todoId: todo.id } } as Href);
  };

  const hasReminder = Boolean(todo.reminderAt);
  const hasDueDate = Boolean(todo.dueAt);
  const dueOverdue = hasDueDate && isDueOverdue(todo.dueAt!, todo.completed);

  return (
    <View
      style={{
        backgroundColor: PlatformColor('secondarySystemBackground'),
        borderRadius: 14,
        borderWidth: highlighted ? 2 : 0,
        borderColor: highlighted ? '#FF9500' : 'transparent',
        borderCurve: 'continuous',
        padding: 14,
        gap: 10,
        flexDirection: 'row',
        alignItems: 'center',
        opacity: isDragging ? 0.92 : 1,
        boxShadow: isDragging ? '0 8px 24px rgba(0, 0, 0, 0.18)' : undefined,
      }}>
      {onDrag ? (
        <Pressable
          onPressIn={onDrag}
          disabled={isDragging}
          accessibilityRole="button"
          accessibilityLabel="Reorder todo"
          hitSlop={8}
          style={{ paddingVertical: 4, paddingRight: 2 }}>
          <SymbolView
            name={{ ios: 'line.3.horizontal', android: 'drag_handle', web: 'drag_handle' }}
            tintColor={PlatformColor('tertiaryLabel')}
            size={18}
          />
        </Pressable>
      ) : null}

      <Pressable
        onPress={handleToggle}
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          borderWidth: 2,
          borderColor: todo.completed ? PlatformColor('systemGreen') : PlatformColor('systemBlue'),
          backgroundColor: todo.completed ? PlatformColor('systemGreen') : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {todo.completed ? <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>✓</Text> : null}
      </Pressable>

      <View style={{ flex: 1, gap: 4 }}>
        <Text
          selectable
          style={{
            color: PlatformColor('label'),
            fontSize: 17,
            textDecorationLine: todo.completed ? 'line-through' : 'none',
            opacity: todo.completed ? 0.55 : 1,
          }}>
          {todo.title}
        </Text>
        {hasDueDate ? (
          <Text
            selectable
            style={{
              color: dueOverdue ? PlatformColor('systemRed') : PlatformColor('systemBlue'),
              fontSize: 13,
            }}>
            {formatDueDateLabel(todo.dueAt!, todo.completed)}
          </Text>
        ) : null}
        {hasReminder ? (
          <Text selectable style={{ color: PlatformColor('systemOrange'), fontSize: 13 }}>
            {formatReminderLabel(todo.reminderAt!)}
          </Text>
        ) : null}
        {!hasDueDate && !hasReminder ? (
          <Text selectable style={{ color: PlatformColor('secondaryLabel'), fontSize: 13 }}>
            {todo.source === 'capture'
              ? 'From note capture'
              : todo.source === 'voice'
                ? 'From voice note'
                : 'Added manually'}
          </Text>
        ) : null}
      </View>

      <Pressable
        onPress={openDueDate}
        accessibilityRole="button"
        accessibilityLabel={hasDueDate ? 'Edit due date' : 'Set due date'}
        hitSlop={8}
        style={{ padding: 4 }}>
        <SymbolView
          name={{
            ios: hasDueDate ? 'calendar.circle.fill' : 'calendar',
            android: 'event',
            web: 'event',
          }}
          tintColor={
            dueOverdue
              ? PlatformColor('systemRed')
              : hasDueDate
                ? PlatformColor('systemBlue')
                : PlatformColor('tertiaryLabel')
          }
          size={20}
        />
      </Pressable>

      <Pressable
        onPress={openReminder}
        accessibilityRole="button"
        accessibilityLabel={hasReminder ? 'Edit reminder' : 'Set reminder'}
        hitSlop={8}
        style={{ padding: 4 }}>
        <SymbolView
          name={{
            ios: hasReminder ? 'bell.fill' : 'bell',
            android: hasReminder ? 'notifications' : 'notifications_none',
            web: hasReminder ? 'notifications' : 'notifications_none',
          }}
          tintColor={hasReminder ? PlatformColor('systemOrange') : PlatformColor('tertiaryLabel')}
          size={20}
        />
      </Pressable>

      {todo.noteImageUri ? (
        <Image
          source={{ uri: todo.noteImageUri }}
          style={{ width: 44, height: 44, borderRadius: 8 }}
          contentFit="cover"
        />
      ) : null}

      <Pressable onPress={handleDelete} hitSlop={8}>
        <Text style={{ color: PlatformColor('systemRed'), fontSize: 15, fontWeight: '600' }}>Delete</Text>
      </Pressable>
    </View>
  );
}
