import { Plus } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';

import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { GroupCard } from '@/src/components/GroupCard';
import { GroupFormModal } from '@/src/components/GroupFormModal';
import { Screen } from '@/src/components/Screen';
import { useGroupCommands } from '@/src/hooks/useGroupCommands';
import { useGroupCollectionProjection } from '@/src/hooks/useGroupProjections';
import { useState } from 'react';

export default function HomeScreen() {
  const { createGroup } = useGroupCommands();
  const { groupCollectionProjection } = useGroupCollectionProjection();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const searchQuery = '';

  const activeGroups = groupCollectionProjection?.groupProjections.filter(
    (groupProjection) => groupProjection.groupStatus === 'collecting',
  ) ?? [];

  const filteredGroups = searchQuery.trim()
    ? activeGroups.filter((groupProjection) =>
        groupProjection.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        groupProjection.memberQuotaProjections.some((memberQuotaProjection) =>
          memberQuotaProjection.memberFullName.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    : activeGroups;

  return (
    <Screen>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* Stats row */}
        {/* <View className="flex-row gap-x-2 mb-5">
          <DashboardStatCard
            label="Groups"
            value={`${summary.totalGroups}`}
            subLabel={`${summary.activeGroups} Active`}
            delay={0}
          />
          <DashboardStatCard
            label="Collected"
            value={`€${summary.totalCollected}`}
            subLabel={`↑ +€${summary.todayCollected} today`}
            delay={80}
          />
          <DashboardStatCard
            label="Pending"
            value={`${summary.totalPendingMembers}`}
            subLabel="members"
            delay={160}
          />
        </View> */}

        {/* Active groups */}
        <View className="flex-row justify-between items-center mb-3 mt-12">
          <Text className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400">
          
          </Text>
          <AnimatedPressable onPress={() => {}} accessibilityLabel="See all groups">
            <Text className="text-[13px] font-semibold text-indigo-500 dark:text-indigo-400">See all</Text>
          </AnimatedPressable>
        </View>

        {filteredGroups.map((group, index) => (
          <GroupCard key={group.groupId} group={group} delay={index * 60} />
        ))}

        {filteredGroups.length === 0 && (
          <Text className="text-center text-sm py-5 text-zinc-500 dark:text-zinc-400">
            {searchQuery.trim() ? 'No groups match your search' : 'No active groups'}
          </Text>
        )}

        {/* Recent activity */}
        {/* <View className="flex-row justify-between items-center mb-3 mt-2">
          <Text className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400">
            RECENT ACTIVITY
          </Text>
          <AnimatedPressable accessibilityLabel="View all activity">
            <Text className="text-[13px] font-semibold text-indigo-500 dark:text-indigo-400">View all</Text>
          </AnimatedPressable>
        </View>

        <SwipeableList
          data={recentActivities}
          keyExtractor={(item) => item.id}
          renderItem={(activity) => <UserActivityItem activity={activity} />}
          contentContainerStyle={{
            borderRadius: 10,
            paddingHorizontal: 0,
            borderWidth: 0,
            borderColor: undefined,
          }}
          scrollEnabled={false}
          editFeature={false}
          deleteFeature={false}
        /> */}

        <View className="h-20" />
      </ScrollView>

      {/* FAB */}
      <AnimatedPressable
        onPress={() => setIsModalVisible(true)}
        className="absolute right-4 bottom-5 w-14 h-14 rounded-full bg-indigo-500 dark:bg-indigo-400 items-center justify-center shadow-lg"
        accessibilityRole="button"
        accessibilityLabel="Create new group"
      >
        <Plus size={28} color="#ffffff" />
      </AnimatedPressable>

      <GroupFormModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={(payload) => {
          createGroup(payload);
          setIsModalVisible(false);
        }}
      />
    </Screen>
  );
}
