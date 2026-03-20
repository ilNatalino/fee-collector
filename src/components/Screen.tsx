import { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView className="flex-1 bg-zinc-100 dark:bg-zinc-950" edges={['left', 'right']}>
      <View className="flex-1 bg-zinc-100 dark:bg-zinc-950 px-4 pt-0.5 pb-0.5">
        {children}
      </View>
    </SafeAreaView>
  );
}
