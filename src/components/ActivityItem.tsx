import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/src/hooks/useTheme';
import { ActivityEntry } from '@/src/types/group';

type ActivityItemProps = {
  activity: ActivityEntry;
};

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const { colors } = useTheme();
  const isConfirmed = activity.status === 'confirmed';

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.left}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isConfirmed ? colors.success + '18' : '#f59e0b18',
            },
          ]}>
          <Ionicons
            name={isConfirmed ? 'checkmark' : 'time-outline'}
            size={18}
            color={isConfirmed ? colors.success : '#f59e0b'}
          />
        </View>
        <View>
          <Text style={[styles.memberName, { color: colors.text }]}>{activity.memberName}</Text>
          <Text style={[styles.groupName, { color: colors.muted }]}>{activity.groupName}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: colors.success }]}>+€{activity.amount}</Text>
        <Text style={[styles.time, { color: colors.muted }]}>{getTimeAgo(activity.date)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  groupName: {
    fontSize: 13,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    marginTop: 2,
  },
});
