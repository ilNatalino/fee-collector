import { Group, MoneyCents } from '@/src/types/group';

export interface PaymentProjection {
  kind: 'payment-projection';
  paymentId: string;
  groupId: string;
  membershipId: string;
  memberId: string;
  recordedGroupName: string;
  recordedMemberName: string;
  amountCents: MoneyCents;
  recordedAt: string;
}

export interface ActivityLogProjection {
  kind: 'activity-log-projection';
  payments: PaymentProjection[];
}

function toRecordedAtTimestamp(recordedAt: string): number {
  const timestamp = Date.parse(recordedAt);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function comparePaymentsByRecordedAt(left: PaymentProjection, right: PaymentProjection): number {
  const timestampDifference = toRecordedAtTimestamp(right.recordedAt) - toRecordedAtTimestamp(left.recordedAt);

  if (timestampDifference !== 0) {
    return timestampDifference;
  }

  return left.paymentId.localeCompare(right.paymentId);
}

export function projectActivityLog(groups: Group[]): ActivityLogProjection {
  const payments = groups
    .flatMap((group) =>
      group.memberships.flatMap((membership) =>
        membership.payments.map((payment) => ({
          kind: 'payment-projection' as const,
          paymentId: payment.id,
          groupId: group.id,
          membershipId: membership.id,
          memberId: membership.member.id,
          recordedGroupName: payment.recordedGroupName,
          recordedMemberName: payment.recordedMemberName,
          amountCents: payment.amountCents,
          recordedAt: payment.recordedAt,
        })),
      ),
    )
    .sort(comparePaymentsByRecordedAt);

  return {
    kind: 'activity-log-projection',
    payments,
  };
}

export function projectGroupActivityLog(group: Group): ActivityLogProjection {
  return projectActivityLog([group]);
}