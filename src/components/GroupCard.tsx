import { useRouter } from 'expo-router';
import { Home, Plane, Utensils, Zap } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useColorScheme } from 'nativewind';
import { Text, View } from 'react-native';

import { Group, GroupCategory } from '@/src/types/group';
import { getGroupProgress } from '@/src/utils/groupMetrics';

import { AnimatedPressable } from './AnimatedPressable';

const CATEGORY_ICONS: Record<GroupCategory, any> = {
  food: Utensils,
  travel: Plane,
  home: Home,
  utilities: Zap,
};

type GroupCardProps = {
  group: Group;
  delay?: number;
  variant?: 'compact' | 'detailed';
  onPress?: () => void;
};

export function GroupCard({ group, delay = 0, variant = 'compact', ...props }: GroupCardProps) {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const progress = getGroupProgress(group);
  const createdDate = new Date(group.createdDate);
  const dateStr = group.dueDate
    ? `Due ${new Date(group.dueDate).getDate()} ${new Date(group.dueDate).toLocaleString('en', { month: 'short', year: 'numeric' })}`
    : `Created ${createdDate.getDate()} ${createdDate.toLocaleString('en', { month: 'short' })}`;

  const percentComplete = group.totalAmount > 0 ? Math.round((progress.collectedAmount / group.totalAmount) * 100) : 0;

  const isDetailed = variant === 'detailed';
  const IconComponent = group.category ? CATEGORY_ICONS[group.category] : null;
  const iconColor = isDark ? '#818cf8' : '#6366f1';

  return (
    <MotiView
      from={{ opacity: 0, translateY: isDetailed ? 12 : 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: isDetailed ? 400 : 500, delay }}
    >
      <AnimatedPressable
        onPress={props.onPress || (!isDetailed ? () => router.push(`/group/${group.id}`) : undefined)}
        disabled={isDetailed && !props.onPress}
        className={`rounded-4xl bg-white dark:bg-zinc-900 shadow-md shadow-zinc-950/5 ${isDetailed ? 'p-6 mb-6' : 'p-5 mb-3'}`}
      >
        {/* Header */}
        <View className={`flex-row justify-between items-center ${isDetailed ? 'mb-6' : 'mb-4'}`}>
          <View className="flex-row items-center gap-x-3">
            <View className={`${isDetailed ? 'w-14 h-14' : 'w-10 h-10'} rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 items-center justify-center`}>
              {IconComponent ? (
                <IconComponent size={isDetailed ? 26 : 20} color={iconColor} strokeWidth={isDetailed ? 2.5 : 2} />
              ) : (
                <Text className={isDetailed ? 'text-2xl' : 'text-xl'}>{group.emoji}</Text>
              )}
            </View>
            <View>
              <Text className={`${isDetailed ? 'text-xl font-bold' : 'text-base font-semibold'} text-zinc-900 dark:text-zinc-100`}>
                {group.name}
              </Text>
              <Text className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                {dateStr} · {progress.totalMembers} members
              </Text>
            </View>
          </View>
          {!isDetailed && (
            <View className="rounded-xl bg-indigo-500/10 dark:bg-zinc-900 px-3 py-1">
              <Text className="text-sm font-bold text-indigo-500 dark:text-indigo-400">
                {percentComplete}%
              </Text>
            </View>
          )}
        </View>

        {/* Progress bar */}
        <View className="h-1.5 rounded-full bg-zinc-950/5 dark:bg-zinc-800 mb-4 overflow-hidden">
          <View
            className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400"
            style={{ width: `${percentComplete}%` }}
          />
        </View>

        {/* Dynamic Footer / Stats */}
        {isDetailed ? (
          <>
            <View className="flex-row justify-between mb-5">
              <View className="flex-1 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 mx-1">
                <Text className="text-xs text-zinc-500 dark:text-zinc-400">Collected</Text>
                <Text className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">€{progress.collectedAmount.toFixed(2)}</Text>
              </View>
              <View className="flex-1 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 mx-1">
                <Text className="text-xs text-zinc-500 dark:text-zinc-400">Target</Text>
                <Text className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">€{group.totalAmount.toFixed(2)}</Text>
              </View>
              <View className="flex-1 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 mx-1">
                <Text className="text-xs text-zinc-500 dark:text-zinc-400">Remaining</Text>
                <Text className="text-lg font-bold text-red-500 dark:text-red-400 mb-0.5">€{progress.remainingAmount.toFixed(2)}</Text>
              </View>
            </View>
            <View className="flex-row justify-between items-end">
              <Text className="text-sm text-zinc-500 dark:text-zinc-400 leading-5">
                {progress.paidMembers} / {progress.totalMembers}{'\n'}paid
              </Text>
              <View className="bg-indigo-500/10 dark:bg-zinc-900 px-3 py-1.5 rounded-full">
                <Text className="text-sm font-semibold text-indigo-500 dark:text-indigo-400">{percentComplete}% complete</Text>
              </View>
            </View>
          </>
        ) : (
          <View className="flex-row justify-between items-end">
            <View>
              <Text className="text-sm">
                <Text className="font-bold text-indigo-500 dark:text-indigo-400">
                  €{progress.collectedAmount.toFixed(2)}
                </Text>
                <Text className="text-zinc-500 dark:text-zinc-400"> / €{group.totalAmount.toFixed(2)}</Text>
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
                €{progress.remainingAmount.toFixed(2)}
              </Text>
            </View>
          </View>
        )}
      </AnimatedPressable>
    </MotiView>
  );
}
