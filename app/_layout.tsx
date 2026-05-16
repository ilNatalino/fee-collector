import '../global.css';

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { getNavigationTheme } from '@/src/constants/theme';
import { ColorSchemeProvider, useColorSchemeContext } from '@/src/providers/ColorSchemeProvider';
import { GroupProvider } from '@/src/providers/GroupProvider';
import { NavigationThemeProvider } from '@/src/providers/NavigationThemeProvider';

export {
    ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ColorSchemeProvider>
        <GroupProvider>
          <RootLayoutNav />
        </GroupProvider>
      </ColorSchemeProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const { colorScheme } = useColorSchemeContext();
  const navigationTheme = getNavigationTheme(colorScheme);

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="group/[id]" options={{ headerShown: false }} />
      </Stack>
    </NavigationThemeProvider>
  );
}
