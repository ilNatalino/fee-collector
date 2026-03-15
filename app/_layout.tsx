import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { GroupProvider } from '@/src/providers/GroupProvider';
import { NavigationThemeProvider } from '@/src/providers/NavigationThemeProvider';
import { AppThemeProvider, useAppTheme } from '@/src/providers/ThemeProvider';
import { UserActivityProvider } from '@/src/providers/UserActivityProvider';

export {
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppThemeProvider>
        <UserActivityProvider>
          <GroupProvider>
            <RootLayoutNav />
          </GroupProvider>
        </UserActivityProvider>
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const { navigationTheme } = useAppTheme();

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="group/[id]" options={{ headerShown: false }} />
      </Stack>
    </NavigationThemeProvider>
  );
}
