import { centsToEuros } from '../utils/money';
import { useActivityLogProjection } from './useActivityLogProjection';

export function useUserActivities() {
  const { activityLogProjection, isLoading } = useActivityLogProjection();

  return {
    activities: activityLogProjection.payments.map((payment) => ({
      id: payment.paymentId,
      memberName: payment.recordedMemberName,
      groupName: payment.recordedGroupName,
      amount: centsToEuros(payment.amountCents),
      date: payment.recordedAt,
    })),
    isLoading,
  };
}
