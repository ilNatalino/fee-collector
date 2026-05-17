import { CreateGroupInput, Group, GroupCategory, Member, Membership, Payment } from '@/src/types/group';

import { projectMemberQuota } from './groupProjection';

export type CreateGroupCommandOptions = {
  createId?: () => string;
  createdAt?: string;
};

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
const GROUP_CATEGORIES: readonly GroupCategory[] = ['food', 'travel', 'home', 'utilities'];

function isValidPaymentAmount(amountCents: number): boolean {
  return Number.isInteger(amountCents) && amountCents > 0;
}

function isValidGroupCategory(category: string): category is GroupCategory {
  return GROUP_CATEGORIES.includes(category as GroupCategory);
}

function normalizeFullName(fullName: string): string {
  return fullName.trim();
}

function hasDuplicateFullNames(fullNames: string[]): boolean {
  const seenNames = new Set<string>();

  return fullNames.some((fullName) => {
    if (seenNames.has(fullName)) {
      return true;
    }

    seenNames.add(fullName);
    return false;
  });
}

function buildMemberIndex(groups: Group[]): Map<string, Member> {
  return groups.reduce<Map<string, Member>>((memberIndex, group) => {
    group.memberships.forEach((membership) => {
      if (!memberIndex.has(membership.member.fullName)) {
        memberIndex.set(membership.member.fullName, membership.member);
      }
    });

    return memberIndex;
  }, new Map<string, Member>());
}

export function createGroupInGroups(
  groups: Group[],
  input: CreateGroupInput,
  options: CreateGroupCommandOptions = {},
): Group[] {
  const groupName = input.name.trim();
  const normalizedMemberships = input.memberships.map((membership) => ({
    memberName: normalizeFullName(membership.memberName),
    quotaAmountCents: membership.quotaAmountCents,
  }));

  if (!groupName || !isValidPaymentAmount(input.targetAmountCents)) {
    return groups;
  }

  if (input.category !== undefined && !isValidGroupCategory(input.category)) {
    return groups;
  }

  if (normalizedMemberships.length === 0) {
    return groups;
  }

  if (normalizedMemberships.some((membership) => !membership.memberName || !isValidPaymentAmount(membership.quotaAmountCents))) {
    return groups;
  }

  if (hasDuplicateFullNames(normalizedMemberships.map((membership) => membership.memberName))) {
    return groups;
  }

  const totalQuotaAmountCents = normalizedMemberships.reduce(
    (sum, membership) => sum + membership.quotaAmountCents,
    0,
  );

  if (totalQuotaAmountCents !== input.targetAmountCents) {
    return groups;
  }

  const createdAt = options.createdAt ?? new Date().toISOString();
  const createIdentifier = options.createId ?? createId;
  const existingMembersByFullName = buildMemberIndex(groups);
  const newGroup: Group = {
    id: createIdentifier(),
    name: groupName,
    category: input.category,
    emoji: input.emoji,
    createdDate: createdAt,
    targetAmountCents: input.targetAmountCents,
    memberships: normalizedMemberships.map((membershipInput) => {
      const existingMember = existingMembersByFullName.get(membershipInput.memberName);

      return {
        id: createIdentifier(),
        joinedAt: createdAt,
        member: existingMember
          ? { ...existingMember }
          : {
              id: createIdentifier(),
              fullName: membershipInput.memberName,
              createdAt,
            },
        quota: {
          amountCents: membershipInput.quotaAmountCents,
        },
        payments: [],
      };
    }),
  };

  return [newGroup, ...groups];
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