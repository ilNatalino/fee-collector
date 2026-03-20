import { UserActivity } from '@/src/types/userActivity';
import { Text, View } from 'react-native';

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
  return (
    <View className="flex-row justify-between items-center py-3.5 px-3 border-b border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 rounded-2xl">
      <View className="flex-row items-center gap-x-3">
        <View>
          <Text className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">
            {activity.memberName}
          </Text>
          {activity.groupName ? (
            <Text className="text-[13px] text-zinc-400 dark:text-zinc-500">
              {activity.groupName}
            </Text>
          ) : null}
        </View>
      </View>
      <View className="items-end">
        <Text className="text-[15px] font-bold text-emerald-500 dark:text-emerald-400">
          +€{activity.amount.toFixed(2)}
        </Text>
        <Text className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
          {getTimeAgo(activity.date)}
        </Text>
      </View>
    </View>
  );
}
