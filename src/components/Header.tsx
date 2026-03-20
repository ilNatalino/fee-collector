import { Bell } from 'lucide-react-native';
import { MotiView } from 'moti';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPressable } from './AnimatedPressable';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function Header() {
  const insets = useSafeAreaInsets();

  return (
    <MotiView
      from={{ opacity: 0, translateY: -8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400 }}
      className="bg-zinc-50 dark:bg-zinc-950"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row justify-between items-center px-5 py-3">
        <Text className="text-base font-light text-zinc-400 dark:text-zinc-500">
          {getGreeting()}
        </Text>
        <View className="flex-row items-center gap-x-3">
          <AnimatedPressable
            className="w-10 h-10 rounded-full items-center justify-center border-[0.5px] border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
            accessibilityLabel="Notifications"
          >
            <Bell size={18} className="text-zinc-600 dark:text-zinc-400" />
          </AnimatedPressable>
          <View className="w-10 h-10 rounded-full items-center justify-center bg-indigo-500">
            <Text className="text-white text-sm font-bold">FM</Text>
          </View>
        </View>
      </View>
    </MotiView>
  );
}
