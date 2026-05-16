import { Group, Membership, Payment } from '@/src/types/group';

import { projectMemberQuota } from './groupProjection';

export type RecordPaymentInput = {
  groupId: string;
  membershipId: string;
  amountCents: number;
  paymentId?: string;
  recordedAt?: string;
};

export type EditPaymentInput = {
  amountCents: number;
};

export type MarkMembershipAsPaidInput = Omit<RecordPaymentInput, 'amountCents'>;

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function isValidPaymentAmount(amountCents: number): boolean {
  return Number.isInteger(amountCents) && amountCents > 0;
}

function buildPayment(group: Group, membership: Membership, input: RecordPaymentInput): Payment {
  return {
    id: input.paymentId ?? createId(),
    membershipId: membership.id,
    amountCents: input.amountCents,
    recordedAt: input.recordedAt ?? new Date().toISOString(),
    recordedMemberName: membership.member.fullName,
    recordedGroupName: group.name,
  };
}

export function recordPaymentInGroups(groups: Group[], input: RecordPaymentInput): Group[] {
  if (!isValidPaymentAmount(input.amountCents)) {
    return groups;
  }

  let didRecordPayment = false;

  const nextGroups = groups.map((group) => {
    if (group.id !== input.groupId) {
      return group;
    }

    let changedGroup = false;

    const nextMemberships = group.memberships.map((membership) => {
      if (membership.id !== input.membershipId) {
        return membership;
      }

      const memberQuotaProjection = projectMemberQuota(membership);
      if (memberQuotaProjection.kind !== 'member-quota-projection') {
        return membership;
      }

      const remainingAmountCents = memberQuotaProjection.remainingAmountCents;
      if (input.amountCents > remainingAmountCents) {
        return membership;
      }

      changedGroup = true;
      didRecordPayment = true;

      return {
        ...membership,
        payments: [...membership.payments, buildPayment(group, membership, input)],
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

  return didRecordPayment ? nextGroups : groups;
}

export function markMembershipAsPaidInGroups(groups: Group[], input: MarkMembershipAsPaidInput): Group[] {
  const group = groups.find((candidateGroup) => candidateGroup.id === input.groupId);
  const membership = group?.memberships.find((candidateMembership) => candidateMembership.id === input.membershipId);

  if (!membership) {
    return groups;
  }

  const memberQuotaProjection = projectMemberQuota(membership);
  if (memberQuotaProjection.kind !== 'member-quota-projection') {
    return groups;
  }

  const remainingAmountCents = memberQuotaProjection.remainingAmountCents;
  if (remainingAmountCents <= 0) {
    return groups;
  }

  return recordPaymentInGroups(groups, {
    ...input,
    amountCents: remainingAmountCents,
  });
}

export function editPaymentInGroups(groups: Group[], paymentId: string, input: EditPaymentInput): Group[] {
  if (!isValidPaymentAmount(input.amountCents)) {
    return groups;
  }

  let didEditPayment = false;

  const nextGroups = groups.map((group) => {
    let changedGroup = false;

    const nextMemberships = group.memberships.map((membership) => {
      const paymentIndex = membership.payments.findIndex((payment) => payment.id === paymentId);
      if (paymentIndex === -1) {
        return membership;
      }

      const memberQuotaProjection = projectMemberQuota(membership);
      if (memberQuotaProjection.kind !== 'member-quota-projection') {
        return membership;
      }

      const payment = membership.payments[paymentIndex];
      const maxEditableAmountCents = memberQuotaProjection.remainingAmountCents + payment.amountCents;

      if (input.amountCents > maxEditableAmountCents) {
        return membership;
      }

      changedGroup = true;
      didEditPayment = true;

      return {
        ...membership,
        payments: membership.payments.map((candidatePayment) =>
          candidatePayment.id === paymentId
            ? {
                ...candidatePayment,
                amountCents: input.amountCents,
              }
            : candidatePayment,
        ),
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

  return didEditPayment ? nextGroups : groups;
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