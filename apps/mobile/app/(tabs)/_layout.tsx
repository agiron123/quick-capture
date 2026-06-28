import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { View } from 'react-native';

import { AccountHeaderButton } from '@/components/account-header-button';
import { AddTodoHeaderButton } from '@/components/add-todo-header-button';
import { ExportTodosHeaderButton } from '@/components/export-todos-header-button';
import { ListPickerHeaderButton } from '@/components/list-picker-header-button';
import { TabBarWithMic } from '@/components/tab-bar-with-mic';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();

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
    </Tabs>
  );
}
