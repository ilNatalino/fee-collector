import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { GroupProvider } from '@/src/providers/GroupProvider';
import { NavigationThemeProvider } from '@/src/providers/NavigationThemeProvider';
import { QuotaProvider } from '@/src/providers/QuotaProvider';
import { AppThemeProvider, useAppTheme } from '@/src/providers/ThemeProvider';

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
        <QuotaProvider>
          <GroupProvider>
            <RootLayoutNav />
          </GroupProvider>
        </QuotaProvider>
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
