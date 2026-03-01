import { Stack } from 'expo-router';
import 'react-native-reanimated';

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
    <AppThemeProvider>
      <QuotaProvider>
        <RootLayoutNav />
      </QuotaProvider>
    </AppThemeProvider>
  );
}

function RootLayoutNav() {
  const { navigationTheme } = useAppTheme();

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </NavigationThemeProvider>
  );
}
