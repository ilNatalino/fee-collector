import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-5 bg-zinc-50 dark:bg-zinc-950">
        <Text className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          This screen doesn&apos;t exist.
        </Text>

        <Link href="/" className="mt-4 py-4">
          <Text className="text-sm text-indigo-500 dark:text-indigo-400">Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
