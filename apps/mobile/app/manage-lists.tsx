import { router, Stack } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState, useSyncExternalStore } from 'react';
import {
    Alert,
    PlatformColor,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';

import { DEFAULT_LIST_ID } from '@/constants/lists';
import { useLists } from '@/hooks/use-lists';
import { getTodosSnapshot, subscribeTodos } from '@/utils/todo-store';

export default function ManageListsModal() {
  const { lists, activeListId, setActiveList, createList, deleteList } = useLists();
  const allTodos = useSyncExternalStore(subscribeTodos, getTodosSnapshot, getTodosSnapshot);
  const [newListName, setNewListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const getTodoCount = (listId: string) =>
    allTodos.filter((todo) => todo.listId === listId).length;

  const handleSelectList = (listId: string) => {
    setActiveList(listId);
    router.back();
  };

  const handleCreateList = async () => {
    const trimmed = newListName.trim();
    if (!trimmed) return;

    setIsCreating(true);
    try {
      await createList(trimmed);
      setNewListName('');
      router.back();
    } catch (error) {
      Alert.alert(
        'Could not create list',
        error instanceof Error ? error.message : 'Something went wrong'
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteList = (listId: string, name: string) => {
    Alert.alert(
      `Delete "${name}"?`,
      'Todos in this list will move to Inbox.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteList(listId);
            } catch (error) {
              Alert.alert(
                'Could not delete list',
                error instanceof Error ? error.message : 'Something went wrong'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Lists' }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, gap: 20 }}>
        <View style={{ gap: 10 }}>
          <Text style={{ color: PlatformColor('secondaryLabel'), fontSize: 15, fontWeight: '600' }}>
            New list
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TextInput
              value={newListName}
              onChangeText={setNewListName}
              placeholder="List name"
              placeholderTextColor={PlatformColor('placeholderText')}
              returnKeyType="done"
              onSubmitEditing={() => void handleCreateList()}
              style={{
                flex: 1,
                backgroundColor: PlatformColor('secondarySystemBackground'),
                color: PlatformColor('label'),
                borderRadius: 12,
                borderCurve: 'continuous',
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 17,
              }}
            />
            <Pressable
              onPress={() => void handleCreateList()}
              disabled={isCreating || !newListName.trim()}
              style={{
                backgroundColor: PlatformColor('systemBlue'),
                opacity: isCreating || !newListName.trim() ? 0.5 : 1,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 12,
              }}>
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600' }}>Add</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ color: PlatformColor('secondaryLabel'), fontSize: 15, fontWeight: '600' }}>
            Your lists
          </Text>
          {lists.map((list) => {
            const isActive = list.id === activeListId;
            const canDelete = list.id !== DEFAULT_LIST_ID;

            return (
              <View
                key={list.id}
                style={{
                  backgroundColor: PlatformColor('secondarySystemBackground'),
                  borderRadius: 14,
                  borderCurve: 'continuous',
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}>
                <Pressable
                  onPress={() => handleSelectList(list.id)}
                  style={{ flex: 1, gap: 4 }}>
                  <Text style={{ color: PlatformColor('label'), fontSize: 17, fontWeight: '600' }}>
                    {list.name}
                  </Text>
                  <Text style={{ color: PlatformColor('secondaryLabel'), fontSize: 14 }}>
                    {getTodoCount(list.id)} todos
                  </Text>
                </Pressable>

                {isActive ? (
                  <SymbolView
                    name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                    tintColor={PlatformColor('systemBlue')}
                    size={18}
                  />
                ) : null}

                {canDelete ? (
                  <Pressable
                    onPress={() => handleDeleteList(list.id, list.name)}
                    hitSlop={8}
                    style={{ padding: 4 }}>
                    <SymbolView
                      name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                      tintColor={PlatformColor('systemRed')}
                      size={18}
                    />
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
}
