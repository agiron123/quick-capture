import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider } from '@/contexts/auth-provider';
import { initNotificationHandlers } from '@/services/notification-handler';
import { initTodoStore } from '@/utils/todo-store';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    initNotificationHandlers();
    initTodoStore()
      .then(() => setDbReady(true))
      .catch((initError) => {
        console.error('Failed to initialize SQLite database', initError);
        throw initError;
      });
  }, []);

  useEffect(() => {
    if (loaded && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, dbReady]);

  if (!loaded || !dbReady) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="add-todo" options={{ presentation: 'modal' }} />
            <Stack.Screen name="review-todos" options={{ presentation: 'modal' }} />
            <Stack.Screen name="voice-record" options={{ presentation: 'modal' }} />
            <Stack.Screen name="manage-lists" options={{ presentation: 'modal' }} />
            <Stack.Screen name="set-reminder" options={{ presentation: 'modal' }} />
            <Stack.Screen name="set-due-date" options={{ presentation: 'modal' }} />
            <Stack.Screen name="set-priority" options={{ presentation: 'modal' }} />
            <Stack.Screen name="set-tags" options={{ presentation: 'modal' }} />
            <Stack.Screen name="add-subtask" options={{ presentation: 'modal' }} />
            <Stack.Screen name="sign-in" options={{ presentation: 'modal', title: 'Account' }} />
          </Stack>
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
