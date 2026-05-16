import { Group, Payment } from '@/src/types/group';
import { UserActivity } from '@/src/types/userActivity';

import { centsToEuros } from './money';

type PaymentLocation = {
  groupId: string;
  membershipId: string;
  payment: Payment;
};

function toRecordedAtTimestamp(recordedAt: string): number {
  const timestamp = Date.parse(recordedAt);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function listCurrentPayments(groups: Group[]): PaymentLocation[] {
  return groups
    .flatMap((group) =>
      group.memberships.flatMap((membership) =>
        membership.payments.map((payment) => ({
          groupId: group.id,
          membershipId: membership.id,
          payment,
        })),
      ),
    )
    .sort((left, right) => toRecordedAtTimestamp(right.payment.recordedAt) - toRecordedAtTimestamp(left.payment.recordedAt));
}

export function getUserActivitiesFromGroups(groups: Group[]): UserActivity[] {
  return listCurrentPayments(groups).map(({ payment }) => ({
    id: payment.id,
    memberName: payment.recordedMemberName,
    groupName: payment.recordedGroupName,
    amount: centsToEuros(payment.amountCents),
    date: payment.recordedAt,
  }));
}