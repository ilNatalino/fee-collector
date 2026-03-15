import { useTheme } from '@/src/hooks/useTheme';
import { UserActivity } from '@/src/types/userActivity';
import { StyleSheet, Text, View } from 'react-native';

type UserActivityItemProps = {
  activity: UserActivity;
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

export function UserActivityItem({ activity }: UserActivityItemProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
      <View style={styles.left}>
        <View>
          <Text style={[styles.memberName, { color: colors.text }]}>{activity.memberName}</Text>
          {activity.groupName && (
            <Text style={[styles.groupName, { color: colors.muted }]}>{activity.groupName}</Text>
          )}
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: colors.success }]}>+€{activity.amount.toFixed(2)}</Text>
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
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
