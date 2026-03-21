import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, EllipsisVertical, Plus } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { GroupCard } from '@/src/components/GroupCard';
import { GroupMembersList } from '@/src/components/GroupMembersList';
import { UserActivityItem } from '@/src/components/UserActivityItem';
import { useGroups } from '@/src/hooks/useGroups';
import { UserActivity } from '@/src/types/userActivity';

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
      <View className="flex-1 bg-zinc-100 dark:bg-zinc-950">
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

  const iconColor = isDark ? '#f4f4f5' : '#18181b';

  return (
    <View className="flex-1 bg-zinc-100 dark:bg-zinc-950">
      <SafeAreaView>
        {/* Top Header */}
        <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
          <AnimatedPressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl items-center justify-center shadow-sm shadow-zinc-950/5 dark:ring-white/10 bg-white dark:bg-zinc-900"
          >
            <ChevronLeft size={24} color={iconColor} />
          </AnimatedPressable>
          <Text className="text-lg font-semibold flex-1 text-center text-zinc-900 dark:text-zinc-100" numberOfLines={1}>
            {group.name}
          </Text>
          <AnimatedPressable className="w-10 h-10 rounded-xl items-center justify-center shadow-sm shadow-zinc-950/5 dark:ring-white/10 bg-white dark:bg-zinc-900">
            <EllipsisVertical size={20} color={iconColor} />
          </AnimatedPressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
          {/* Main Info Card */}
          <GroupCard group={group} variant="detailed" />

          {/* Actions */}
          <View className="flex-row mb-8 gap-x-3">
            <AnimatedPressable className="flex-1 h-[50px] rounded-2xl flex-row items-center justify-center">
              <Text className="text-[15px] font-semibold text-zinc-500 dark:text-zinc-400">Send reminder</Text>
            </AnimatedPressable>
            <AnimatedPressable className="flex-1 h-[50px] rounded-2xl flex-row items-center justify-center">
              <Plus size={16} color={iconColor} style={{ marginRight: 6 }} />
              <Text className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">Add payment</Text>
            </AnimatedPressable>
          </View>

          {/* Members */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400">MEMBERS</Text>
            <AnimatedPressable>
              <Text className="text-sm font-medium text-indigo-500 dark:text-indigo-400">Manage</Text>
            </AnimatedPressable>
          </View>

          <GroupMembersList members={group.members} />

          {/* Payment History */}
          <View className="flex-row justify-between items-center mb-4 mt-6">
            <Text className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400">PAYMENT HISTORY</Text>
          </View>

          <View className="rounded-2xl overflow-hidden">
            {groupActivities.map((activity) => (
              <UserActivityItem key={activity.id} activity={activity as UserActivity} />
            ))}
            {groupActivities.length === 0 && (
              <Text className="text-sm text-center mt-3 p-4 text-zinc-500 dark:text-zinc-400">No recent activity</Text>
            )}
          </View>

          <View className="h-10" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
