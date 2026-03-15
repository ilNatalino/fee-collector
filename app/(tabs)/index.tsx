import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ActivityItem } from '@/src/components/ActivityItem';
import { DashboardStatCard } from '@/src/components/DashboardStatCard';
import { GroupCard } from '@/src/components/GroupCard';
import { GroupFormModal } from '@/src/components/GroupFormModal';
import { Screen } from '@/src/components/Screen';
import { useGroups } from '@/src/hooks/useGroups';
import { useTheme } from '@/src/hooks/useTheme';
import { getGroupsSummary } from '@/src/utils/groupMetrics';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { groups, activities, addGroup } = useGroups();
  const summary = getGroupsSummary(groups);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeGroups = groups.filter((g) => {
    const paidCount = g.members.filter((m) => m.hasPaid).length;
    return paidCount < g.members.length;
  });

  const filteredGroups = searchQuery.trim()
    ? activeGroups.filter((g) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.members.some((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : activeGroups;

  const recentActivities = activities.slice(0, 5);

  return (
    <Screen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <DashboardStatCard
            label="Groups"
            value={`${summary.totalGroups}`}
            subLabel={`${summary.activeGroups} Active`}
          />
          <DashboardStatCard
            label="Collected"
            value={`€${summary.totalCollected}`}
            subLabel={`↑ +€${summary.todayCollected} today`}
          />
          <DashboardStatCard
            label="Pending"
            value={`${summary.totalPendingMembers}`}
            subLabel="members"
            subLabelColor={colors.muted}
          />
        </View>

        {/* Active groups */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>ACTIVE GROUPS</Text>
          <Pressable onPress={() => {}} accessibilityLabel="See all groups">
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </Pressable>
        </View>

        {filteredGroups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}

        {filteredGroups.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            {searchQuery.trim() ? 'No groups match your search' : 'No active groups'}
          </Text>
        )}

        {/* Recent activity */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>RECENT ACTIVITY</Text>
          <Pressable accessibilityLabel="View all activity">
            <Text style={[styles.seeAll, { color: colors.primary }]}>View all</Text>
          </Pressable>
        </View>

        <View style={[styles.activityContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {recentActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => setIsModalVisible(true)}
        style={[styles.fab, { backgroundColor: colors.primary }]}
        accessibilityRole="button"
        accessibilityLabel="Create new group">
        <Ionicons name="add" size={28} color="#ffffff" />
      </Pressable>

      <GroupFormModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={(payload) => {
          addGroup(payload);
          setIsModalVisible(false);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 20,
  },
  activityContainer: {
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  bottomSpacer: {
    height: 80,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
