import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, EllipsisVertical, Plus } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useColorScheme } from 'nativewind';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { UserActivityItem } from '@/src/components/UserActivityItem';
import { useGroups } from '@/src/hooks/useGroups';
import { UserActivity } from '@/src/types/userActivity';
import { getGroupProgress } from '@/src/utils/groupMetrics';

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { groups, activities } = useGroups();

  const group = groups.find((g) => g.id === id);
  const groupActivities = activities.filter((a) => a.groupId === id);

  if (!group) {
    return (
      <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
        <SafeAreaView>
          <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
            <Pressable onPress={() => router.back()} className="w-10 h-10 justify-center items-center">
              <ChevronLeft size={24} color={isDark ? '#f4f4f5' : '#18181b'} />
            </Pressable>
            <Text className="text-lg font-semibold flex-1 text-center text-zinc-900 dark:text-zinc-100">
              Group Not Found
            </Text>
            <View className="w-10" />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const progress = getGroupProgress(group);
  const percentComplete = group.totalAmount > 0 ? Math.round((progress.collectedAmount / group.totalAmount) * 100) : 0;
  
  let dateStr = '';
  if (group.dueDate) {
    const due = new Date(group.dueDate);
    dateStr = `Due ${due.getDate()} ${due.toLocaleString('en', { month: 'short', year: 'numeric' })}`;
  } else {
    const created = new Date(group.createdDate);
    dateStr = `Created ${created.getDate()} ${created.toLocaleString('en', { month: 'short', year: 'numeric' })}`;
  }

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getFirstName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[1][0]}.`;
    }
    return parts[0];
  };

  const iconColor = isDark ? '#f4f4f5' : '#18181b';

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <SafeAreaView>
        {/* Top Header */}
        <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
          <AnimatedPressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl items-center justify-center bg-white dark:bg-zinc-900"
          >
            <ChevronLeft size={24} color={iconColor} />
          </AnimatedPressable>
          <Text className="text-lg font-semibold flex-1 text-center text-zinc-900 dark:text-zinc-100" numberOfLines={1}>
            {group.name}
          </Text>
          <AnimatedPressable className="w-10 h-10 rounded-xl items-center justify-center bg-white dark:bg-zinc-900">
            <EllipsisVertical size={20} color={iconColor} />
          </AnimatedPressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
          {/* Main Info Card */}
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
          >
            <View className="rounded-3xl p-5 mb-6 bg-zinc-800 dark:bg-zinc-800">
              <View className="flex-row items-center mb-6">
                <View className="w-14 h-14 rounded-full bg-white/10 items-center justify-center mr-4">
                  <Text className="text-2xl">{group.emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-white mb-1">{group.name}</Text>
                  <Text className="text-sm text-slate-400">
                    {progress.totalMembers} members · {dateStr}
                  </Text>
                </View>
              </View>

              {/* Progress bar */}
              <View className="h-2 rounded-full bg-white/10 mb-4 overflow-hidden">
                <View className="h-full rounded-full bg-indigo-400" style={{ width: `${percentComplete}%` }} />
              </View>

              {/* Stats */}
              <View className="flex-row justify-between mb-5">
                <View className="flex-1 p-3 rounded-xl bg-white/5 mx-1">
                  <Text className="text-lg font-bold text-white mb-0.5">€{progress.collectedAmount}</Text>
                  <Text className="text-xs text-slate-400">Collected</Text>
                </View>
                <View className="flex-1 p-3 rounded-xl bg-white/5 mx-1">
                  <Text className="text-lg font-bold text-white mb-0.5">€{group.totalAmount}</Text>
                  <Text className="text-xs text-slate-400">Target</Text>
                </View>
                <View className="flex-1 p-3 rounded-xl bg-white/5 mx-1">
                  <Text className="text-lg font-bold text-red-500 mb-0.5">€{progress.remainingAmount}</Text>
                  <Text className="text-xs text-slate-400">Remaining</Text>
                </View>
              </View>

              {/* Completion */}
              <View className="flex-row justify-between items-end">
                <Text className="text-sm text-slate-400 leading-5">
                  {progress.paidMembers} / {progress.totalMembers}{'\n'}paid
                </Text>
                <View className="bg-indigo-500/10 px-3 py-1.5 rounded-full">
                  <Text className="text-sm font-semibold text-indigo-400">{percentComplete}% complete</Text>
                </View>
              </View>
            </View>
          </MotiView>

          {/* Actions */}
          <View className="flex-row mb-8 gap-x-3">
            <AnimatedPressable className="flex-1 h-[50px] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex-row items-center justify-center">
              <Text className="text-[15px] font-semibold text-zinc-400 dark:text-zinc-500">Send reminder</Text>
            </AnimatedPressable>
            <AnimatedPressable className="flex-1 h-[50px] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex-row items-center justify-center">
              <Plus size={16} color={iconColor} style={{ marginRight: 6 }} />
              <Text className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">Add payment</Text>
            </AnimatedPressable>
          </View>

          {/* Members */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 dark:text-zinc-500">MEMBERS</Text>
            <AnimatedPressable>
              <Text className="text-sm font-medium text-indigo-500 dark:text-indigo-400">Manage</Text>
            </AnimatedPressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
            {group.members.map((member) => (
              <View key={member.id} className="items-center mr-5 w-[60px]">
                <View className="w-14 h-14 rounded-full border-2 border-zinc-900 dark:border-zinc-100 items-center justify-center mb-2">
                  <Text className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {getInitials(member.name)}
                  </Text>
                </View>
                <Text className="text-xs text-center text-zinc-400 dark:text-zinc-500">{getFirstName(member.name)}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Payment History */}
          <View className="flex-row justify-between items-center mb-4 mt-6">
            <Text className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 dark:text-zinc-500">PAYMENT HISTORY</Text>
            <AnimatedPressable>
              <Text className="text-sm font-medium text-indigo-500 dark:text-indigo-400">Export</Text>
            </AnimatedPressable>
          </View>

          <View className="rounded-2xl px-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            {groupActivities.map((activity) => (
              <UserActivityItem key={activity.id} activity={activity as UserActivity} />
            ))}
            {groupActivities.length === 0 && (
              <Text className="text-sm text-center mt-3 p-4 text-zinc-400 dark:text-zinc-500">No recent activity</Text>
            )}
          </View>

          <View className="h-10" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
