import { UpdateUserActivityInput } from '../types/userActivity';
import { getUserActivitiesFromGroups } from '../utils/groupPayments';
import { eurosToCents } from '../utils/money';
import { useGroups } from './useGroups';

export function useUserActivities() {
  const { groups, deletePaymentById, updatePaymentById } = useGroups();

  return {
    activities: getUserActivitiesFromGroups(groups),
    isLoading: false,
    deleteActivityById: (id: string) => deletePaymentById(id),
    updateActivityById: (id: string, payload: UpdateUserActivityInput) =>
      updatePaymentById(id, {
        memberName: payload.memberName,
        amountCents: eurosToCents(payload.amount),
      }),
  };
}
