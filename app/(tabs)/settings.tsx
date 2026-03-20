import { useColorScheme } from 'nativewind';
import { Switch, Text, View } from 'react-native';

import { Screen } from '@/src/components/Screen';
import { useColorSchemeContext } from '@/src/providers/ColorSchemeProvider';

export default function SettingsScreen() {
  const { colorScheme } = useColorScheme();
  const { toggleTheme } = useColorSchemeContext();
  const isDark = colorScheme === 'dark';

  return (
    <Screen>
      <View className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 mt-2.5 bg-white dark:bg-zinc-900">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Dark mode</Text>
            <Text className="mt-1 text-[13px] text-zinc-400 dark:text-zinc-500">Use a dark visual theme</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#e4e4e7', true: '#6366f199' }}
            thumbColor={isDark ? '#818cf8' : '#ffffff'}
          />
        </View>
      </View>
    </Screen>
  );
}
