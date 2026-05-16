import { Group, Payment } from '@/src/types/group';
import { UserActivity } from '@/src/types/userActivity';

import { centsToEuros } from './money';

export type UpdatePaymentInput = {
  memberName: string;
  amountCents: number;
};

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

export function updatePaymentInGroups(groups: Group[], paymentId: string, input: UpdatePaymentInput): Group[] {
  let foundPayment = false;

  const nextGroups = groups.map((group) => {
    let changedGroup = false;

    const nextMemberships = group.memberships.map((membership) => {
      let changedMembership = false;

      const nextPayments = membership.payments.map((payment) => {
        if (payment.id !== paymentId) {
          return payment;
        }

        foundPayment = true;
        changedGroup = true;
        changedMembership = true;

        return {
          ...payment,
          amountCents: input.amountCents,
          recordedMemberName: input.memberName,
        };
      });

      if (!changedMembership) {
        return membership;
      }

      return {
        ...membership,
        payments: nextPayments,
      };
    });

    if (!changedGroup) {
      return group;
    }

    return {
      ...group,
      memberships: nextMemberships,
    };
  });

  return foundPayment ? nextGroups : groups;
}

export function deletePaymentInGroups(groups: Group[], paymentId: string): Group[] {
  let foundPayment = false;

  const nextGroups = groups.map((group) => {
    let changedGroup = false;

    const nextMemberships = group.memberships.map((membership) => {
      const nextPayments = membership.payments.filter((payment) => payment.id !== paymentId);

      if (nextPayments.length === membership.payments.length) {
        return membership;
      }

      foundPayment = true;
      changedGroup = true;

      return {
        ...membership,
        payments: nextPayments,
      };
    });

    if (!changedGroup) {
      return group;
    }

    return {
      ...group,
      memberships: nextMemberships,
    };
  });

  return foundPayment ? nextGroups : groups;
}