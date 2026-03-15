import { useRouter } from 'expo-router';
import { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/src/hooks/useTheme';
import { Group } from '@/src/types/group';
import { getGroupProgress } from '@/src/utils/groupMetrics';

type GroupCardProps = {
  group: Group;
  style?: ComponentProps<typeof View>['style'];
};

export function GroupCard({ group, style }: GroupCardProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const progress = getGroupProgress(group);
  const createdDate = new Date(group.createdDate);
  const dateStr = group.dueDate ? `Due ${new Date(group.dueDate).getDate()} ${new Date(group.dueDate).toLocaleString('en', { month: 'short', year: 'numeric' })}` : `Created ${createdDate.getDate()} ${createdDate.toLocaleString('en', { month: 'short' })}`;

  return (
    <Pressable onPress={() => router.push(`/group/${group.id}`)} style={style}>
      <View style={[styles.card, { backgroundColor: colors.text === '#f8fafc' ? '#1e293b' : '#1e293b' }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{group.emoji}</Text>
          </View>
          <View>
            <Text style={styles.title}>{group.name}</Text>
            <Text style={styles.subtitle}>
              {dateStr} · {progress.totalMembers} members
            </Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.primary + '22' }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>{progress.progress}%</Text>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { backgroundColor: colors.primary, width: `${progress.progress}%` },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.amountRow}>
            <Text style={[styles.collectedAmount, { color: colors.primary }]}>
              €{progress.collectedAmount}
            </Text>
            <Text style={styles.totalAmount}> / €{group.totalAmount}</Text>
          </Text>
          <Text style={styles.memberCount}>
            {progress.paidMembers} / {progress.totalMembers} paid
          </Text>
        </View>
        <View style={styles.remainingContainer}>
          <Text style={styles.remainingLabel}>Remaining</Text>
          <Text style={styles.remainingAmount}>€{progress.remainingAmount}</Text>
        </View>
      </View>
    </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 20,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  amountRow: {
    fontSize: 14,
  },
  collectedAmount: {
    fontWeight: '700',
    fontSize: 15,
  },
  totalAmount: {
    color: '#94a3b8',
    fontSize: 14,
  },
  memberCount: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  remainingContainer: {
    alignItems: 'flex-end',
  },
  remainingLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  remainingAmount: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '700',
  },
});
