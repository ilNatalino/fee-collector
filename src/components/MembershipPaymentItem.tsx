import { Text, View } from 'react-native';

import { PaymentProjection } from '@/src/utils/activityLog';
import { formatCents } from '@/src/utils/money';

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) {
    return 'just now';
  }

  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

type MembershipPaymentItemProps = Readonly<{
  payment: PaymentProjection;
}>;

export function MembershipPaymentItem({ payment }: MembershipPaymentItemProps) {
  return (
    <View className="mx-5 flex-row items-center justify-between rounded-2xl bg-white px-4 py-3.5 shadow-md shadow-zinc-950/5 dark:bg-zinc-900">
      <View>
        <Text className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">Payment</Text>
        <Text className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{getTimeAgo(payment.recordedAt)}</Text>
      </View>

      <Text className="text-[15px] font-bold text-emerald-500 dark:text-emerald-400">
        +€{formatCents(payment.amountCents)}
      </Text>
    </View>
  );
}