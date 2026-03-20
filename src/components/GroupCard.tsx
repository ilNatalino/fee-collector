import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Text, View } from 'react-native';

import { Group } from '@/src/types/group';
import { getGroupProgress } from '@/src/utils/groupMetrics';

import { AnimatedPressable } from './AnimatedPressable';

type GroupCardProps = {
  group: Group;
  delay?: number;
};

export function GroupCard({ group, delay = 0 }: GroupCardProps) {
  const router = useRouter();
  const progress = getGroupProgress(group);
  const createdDate = new Date(group.createdDate);
  const dateStr = group.dueDate
    ? `Due ${new Date(group.dueDate).getDate()} ${new Date(group.dueDate).toLocaleString('en', { month: 'short', year: 'numeric' })}`
    : `Created ${createdDate.getDate()} ${createdDate.toLocaleString('en', { month: 'short' })}`;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500, delay }}
    >
      <AnimatedPressable
        onPress={() => router.push(`/group/${group.id}`)}
        className="rounded-4xl bg-white dark:bg-zinc-900 p-5 mb-3 shadow-md shadow-zinc-950/5 ring-zinc-950/5"
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center gap-x-3">
            <View className="w-10 h-10 rounded-full bg-zinc-1000 dark:bg-zinc-800 items-center justify-center">
              <Text className="text-xl">{group.emoji}</Text>
            </View>
            <View>
              <Text className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {group.name}
              </Text>
              <Text className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {dateStr} · {progress.totalMembers} members
              </Text>
            </View>
          </View>
          <View className="rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10 px-3 py-1">
            <Text className="text-sm font-bold text-indigo-500 dark:text-indigo-400">
              {progress.progress}%
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View className="h-1.5 rounded-full bg-zinc-950/5 dark:bg-zinc-800 mb-4">
          <View
            className="h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400"
            style={{ width: `${progress.progress}%` }}
          />
        </View>

        {/* Footer */}
        <View className="flex-row justify-between items-end">
          <View>
            <Text className="text-sm">
              <Text className="font-bold text-indigo-500 dark:text-indigo-400">
                €{progress.collectedAmount}
              </Text>
              <Text className="text-zinc-500 dark:text-zinc-400"> / €{group.totalAmount}</Text>
            </Text>
            <Text className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {progress.paidMembers} / {progress.totalMembers} paid
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Remaining
            </Text>
            <Text className="text-base font-bold text-red-500 dark:text-red-400">
              €{progress.remainingAmount}
            </Text>
          </View>
        </View>
      </AnimatedPressable>
    </MotiView>
  );
}
