import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { UserActivityItem } from '@/src/components/UserActivityItem';
import { useGroups } from '@/src/hooks/useGroups';
import { useTheme } from '@/src/hooks/useTheme';
import { UserActivity } from '@/src/types/userActivity';
import { getGroupProgress } from '@/src/utils/groupMetrics';

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { groups, activities } = useGroups();

  const group = groups.find((g) => g.id === id);
  const groupActivities = activities.filter((a) => a.groupId === id);

  if (!group) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Group Not Found</Text>
            <View style={{ width: 40 }} />
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView>
        {/* Top Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.surface }]}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {group.name}
          </Text>
          <Pressable style={[styles.iconButton, { backgroundColor: colors.surface }]}>
            <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Main Info Card */}
          <View style={[styles.infoCard, { backgroundColor: colors.text === '#f8fafc' ? '#1e293b' : '#1e293b' }]}>
            <View style={styles.cardHeader}>
              <View style={styles.emojiContainer}>
                <Text style={styles.emoji}>{group.emoji}</Text>
              </View>
              <View style={styles.cardHeaderTexts}>
                <Text style={styles.cardTitle}>{group.name}</Text>
                <Text style={styles.cardSubtitle}>
                  {progress.totalMembers} members · {dateStr}
                </Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={[styles.progressBarBg, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <View style={[styles.progressBarFill, { width: `${percentComplete}%`, backgroundColor: '#818cf8' }]} />
              </View>

              <View style={styles.statsRow}>
                <View style={[styles.statBlock, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                  <Text style={[styles.statValue, { color: '#ffffff' }]}>€{progress.collectedAmount}</Text>
                  <Text style={styles.statLabel}>Collected</Text>
                </View>
                <View style={[styles.statBlock, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                  <Text style={[styles.statValue, { color: '#ffffff' }]}>€{group.totalAmount}</Text>
                  <Text style={styles.statLabel}>Target</Text>
                </View>
                <View style={[styles.statBlock, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                  <Text style={[styles.statValue, { color: '#ef4444' }]}>€{progress.remainingAmount}</Text>
                  <Text style={styles.statLabel}>Remaining</Text>
                </View>
              </View>

              <View style={styles.completionRow}>
                <Text style={styles.completionText}>
                  {progress.paidMembers} / {progress.totalMembers}{'\n'}paid
                </Text>
                <View style={styles.completionBadge}>
                  <Text style={styles.completionBadgeText}>{percentComplete}% complete</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <Pressable style={[styles.actionButton, { borderColor: colors.border }]}>
              <Text style={[styles.actionButtonText, { color: colors.muted }]}>Send reminder</Text>
            </Pressable>
            <View style={{ width: 12 }} />
            <Pressable style={[styles.actionButton, { borderColor: colors.border }]}>
              <Ionicons name="add" size={16} color={colors.text} style={{ marginRight: 6 }} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Add payment</Text>
            </Pressable>
          </View>

          {/* Members */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>MEMBERS</Text>
            <Pressable>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Manage</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.membersScroll}>
            {group.members.map((member) => {
              return (
                <View key={member.id} style={styles.memberAvatarContainer}>
                  <View style={[styles.memberCircle, { borderColor: colors.text }]}>
                    <Text style={[styles.memberInitials, { color: colors.text }]}>
                      {getInitials(member.name)}
                    </Text>
                  </View>
                  <Text style={[styles.memberName, { color: colors.muted }]}>{getFirstName(member.name)}</Text>
                </View>
              );
            })}
          </ScrollView>

          {/* Payment History */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>PAYMENT HISTORY</Text>
            <Pressable>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Export</Text>
            </Pressable>
          </View>

          <View style={[styles.activityContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {groupActivities.map((activity) => (
              <UserActivityItem key={activity.id} activity={activity as UserActivity} />
            ))}
            {groupActivities.length === 0 && (
              <Text style={[styles.emptyText, { color: colors.muted, padding: 16 }]}>No recent activity</Text>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  infoCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  emoji: {
    fontSize: 24,
  },
  cardHeaderTexts: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  progressSection: {},
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBlock: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  completionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  completionText: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  completionBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  completionBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  actionsRow: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    height: 50,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  membersScroll: {
    paddingRight: 20,
  },
  memberAvatarContainer: {
    alignItems: 'center',
    marginRight: 20,
    position: 'relative',
    width: 60,
  },
  memberCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  memberInitials: {
    fontSize: 18,
    fontWeight: '600',
  },
  memberName: {
    fontSize: 12,
    textAlign: 'center',
  },
  activityContainer: {
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
});
