import { Tabs } from 'expo-router';
import { useQuickActionRouting } from 'expo-quick-actions/router';
import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { View } from 'react-native';

import { AccountHeaderButton } from '@/components/account-header-button';
import { AddTodoHeaderButton } from '@/components/add-todo-header-button';
import { ExportTodosHeaderButton } from '@/components/export-todos-header-button';
import { ListPickerHeaderButton } from '@/components/list-picker-header-button';
import { TabBarWithMic } from '@/components/tab-bar-with-mic';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { configureCaptureQuickActions } from '@/services/quick-actions';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  useQuickActionRouting();
  useEffect(() => {
    void configureCaptureQuickActions();
  }, []);

  return (
    <Tabs
      tabBar={(props) => <TabBarWithMic {...props} />}
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: () => <ListPickerHeaderButton />,
          headerLeft: () => <AccountHeaderButton />,
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <ExportTodosHeaderButton />
              <AddTodoHeaderButton />
            </View>
          ),
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'checklist', android: 'checklist', web: 'checklist' }}
              tintColor={color}
              size={26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="capture"
        options={{
          title: 'Capture',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'camera.fill', android: 'camera', web: 'camera' }}
              tintColor={color}
              size={26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'bubble.left.and.bubble.right.fill',
                android: 'chat',
                web: 'chat',
              }}
              tintColor={color}
              size={26}
            />
          ),
        }}
      />
    </Tabs>
  );
}
