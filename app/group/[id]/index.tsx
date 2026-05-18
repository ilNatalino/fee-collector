import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, EllipsisVertical, Plus } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddPaymentModal } from '@/src/components/AddPaymentModal';
import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { GroupCard } from '@/src/components/GroupCard';
import { GroupMembersList } from '@/src/components/GroupMembersList';
import { useGroupCollection } from '@/src/hooks/useGroupCollection';
import { MemberQuotaProjection } from '@/src/utils/groupProjection';

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { recordPayment, getGroupView, isHydrating } = useGroupCollection();
  const { groupProjection, issues, isMissing } = getGroupView(id);
  const memberQuotaProjections = groupProjection?.memberQuotaProjections ?? [];

  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

  if (isHydrating) {
    return (
      <View className="flex-1 bg-zinc-100 dark:bg-zinc-950">
        <SafeAreaView>
          <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
            <Pressable onPress={() => router.back()} className="w-10 h-10 justify-center items-center">
              <ChevronLeft size={24} color={isDark ? '#f4f4f5' : '#18181b'} />
            </Pressable>
            <Text className="text-lg font-semibold flex-1 text-center text-zinc-900 dark:text-zinc-100">
              Loading Group
            </Text>
            <View className="w-10" />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!groupProjection) {
    const title = isMissing || issues.length === 0 ? 'Group Not Found' : 'Group Unavailable';

    return (
      <View className="flex-1 bg-zinc-100 dark:bg-zinc-950">
        <SafeAreaView>
          <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
            <Pressable onPress={() => router.back()} className="w-10 h-10 justify-center items-center">
              <ChevronLeft size={24} color={isDark ? '#f4f4f5' : '#18181b'} />
            </Pressable>
            <Text className="text-lg font-semibold flex-1 text-center text-zinc-900 dark:text-zinc-100">
              {title}
            </Text>
            <View className="w-10" />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const iconColor = isDark ? '#f4f4f5' : '#18181b';
  const payableMembers = memberQuotaProjections.filter((memberQuotaProjection) => memberQuotaProjection.remainingAmountCents > 0);

  const handleMembershipPress = (membershipProjection: MemberQuotaProjection) => {
    if (membershipProjection.collectedAmountCents === 0) {
      Alert.alert(
        'No payments yet',
        'No payments have been recorded for this member in this group yet.',
      );
      return;
    }

    router.push(`/group/${groupProjection.groupId}/membership/${membershipProjection.membershipId}`);
  };

  return (
    <View className="flex-1 bg-zinc-100 dark:bg-zinc-950">
      <SafeAreaView>
        <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
          <AnimatedPressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl items-center justify-center shadow-sm shadow-zinc-950/5 dark:ring-white/10 bg-white dark:bg-zinc-900"
          >
            <ChevronLeft size={24} color={iconColor} />
          </AnimatedPressable>
          <Text className="text-lg font-semibold flex-1 text-center text-zinc-900 dark:text-zinc-100" numberOfLines={1}>
            {groupProjection.groupName}
          </Text>
          <AnimatedPressable className="w-10 h-10 rounded-xl items-center justify-center shadow-sm shadow-zinc-950/5 dark:ring-white/10 bg-white dark:bg-zinc-900">
            <EllipsisVertical size={20} color={iconColor} />
          </AnimatedPressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
          <GroupCard group={groupProjection} variant="detailed" />

          <View className="flex-row mb-8 gap-x-3">
            <AnimatedPressable className="flex-1 h-[50px] rounded-2xl flex-row items-center justify-center">
              <Text className="text-[15px] font-semibold text-zinc-500 dark:text-zinc-400">Send reminder</Text>
            </AnimatedPressable>
            <AnimatedPressable
              className={`flex-1 h-[50px] rounded-2xl flex-row items-center justify-center bg-white dark:bg-zinc-900 shadow-sm shadow-zinc-950/5 dark:ring-white/10 ${payableMembers.length === 0 ? 'opacity-50' : ''}`}
              disabled={payableMembers.length === 0}
              onPress={() => setIsPaymentModalVisible(true)}
            >
              <Plus size={16} color={iconColor} style={{ marginRight: 6 }} />
              <Text className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">Add payment</Text>
            </AnimatedPressable>
          </View>

          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400">MEMBERS</Text>
            <AnimatedPressable>
              <Text className="text-sm font-medium text-indigo-500 dark:text-indigo-400">Manage</Text>
            </AnimatedPressable>
          </View>

          <GroupMembersList
            memberQuotaProjections={memberQuotaProjections}
            onPressMembership={handleMembershipPress}
          />

          <View className="h-10" />
        </ScrollView>
      </SafeAreaView>

      <AddPaymentModal
        visible={isPaymentModalVisible}
        members={payableMembers}
        onCancel={() => setIsPaymentModalVisible(false)}
        onSubmit={(membershipId, amountCents) => {
          void recordPayment(groupProjection.groupId, membershipId, amountCents);
          setIsPaymentModalVisible(false);
        }}
      />
    </View>
  );
}