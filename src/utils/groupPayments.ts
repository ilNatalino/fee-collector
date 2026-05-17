import { Group } from '@/src/types/group';
import { UserActivity } from '@/src/types/userActivity';

import { projectActivityLog } from './activityLog';
import { centsToEuros } from './money';

export function getUserActivitiesFromGroups(groups: Group[]): UserActivity[] {
  return projectActivityLog(groups).payments.map((payment) => ({
    id: payment.paymentId,
    memberName: payment.recordedMemberName,
    groupName: payment.recordedGroupName,
    amount: centsToEuros(payment.amountCents),
    date: payment.recordedAt,
  }));
}