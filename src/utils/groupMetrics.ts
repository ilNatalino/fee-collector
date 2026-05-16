import { Group, Membership } from '@/src/types/group';
import { QuotaSummary } from '@/src/types/quota';

import { getMembershipCollectedAmountCents, getMembershipQuotaStatus } from './membershipMetrics';

export const getGroupProgress = (group: Group) => {
  const totalMemberships = group.memberships.length;
  const paidMemberships = group.memberships.filter((membership) => getMembershipQuotaStatus(membership) === 'paid').length;
  const partialMemberships = group.memberships.filter((membership) => getMembershipQuotaStatus(membership) === 'partial').length;
  const unpaidMemberships = totalMemberships - paidMemberships - partialMemberships;
  const collectedAmountCents = group.memberships.reduce(
    (sum, membership) => sum + getMembershipCollectedAmountCents(membership),
    0,
  );
  const remainingAmountCents = Math.max(0, group.targetAmountCents - collectedAmountCents);
  const progress =
    group.targetAmountCents === 0
      ? 0
      : Math.min(100, Math.round((collectedAmountCents / group.targetAmountCents) * 100));

  return {
    totalMemberships,
    paidMemberships,
    partialMemberships,
    unpaidMemberships,
    collectedAmountCents,
    remainingAmountCents,
    progress,
  };
};

export const getGroupsSummary = (groups: Group[]) => {
  const totalGroups = groups.length;
  const activeGroups = groups.filter((g) => {
    const progress = getGroupProgress(g);
    return progress.progress < 100;
  }).length;

  const totalCollected = groups.reduce((sum, g) => {
    const progress = getGroupProgress(g);
    return sum + progress.collectedAmountCents;
  }, 0);

  const totalPendingMemberships = groups.reduce((sum, g) => {
    const progress = getGroupProgress(g);
    return sum + progress.unpaidMemberships + progress.partialMemberships;
  }, 0);

  return {
    totalGroups,
    activeGroups,
    totalCollectedCents: totalCollected,
    todayCollectedCents: 7500,
    totalPendingMemberships,
  };
};

export const getQuotaSummary = (memberships: Membership[]): QuotaSummary => {
  const totalMemberships = memberships.length;
  const paidMemberships = memberships.filter((membership) => getMembershipQuotaStatus(membership) === 'paid').length;
  const partialMemberships = memberships.filter((membership) => getMembershipQuotaStatus(membership) === 'partial').length;
  const unpaidMemberships = totalMemberships - paidMemberships - partialMemberships;

  const totalAmountCents = memberships.reduce((sum, membership) => sum + membership.quota.amountCents, 0);
  const collectedAmountCents = memberships.reduce(
    (sum, membership) => sum + getMembershipCollectedAmountCents(membership),
    0,
  );
  const remainingAmountCents = Math.max(0, totalAmountCents - collectedAmountCents);

  const progress =
    totalAmountCents === 0 ? 0 : Math.min(100, Math.round((collectedAmountCents / totalAmountCents) * 100));

  return {
    totalMemberships,
    paidMemberships,
    partialMemberships,
    unpaidMemberships,
    totalAmountCents,
    collectedAmountCents,
    remainingAmountCents,
    progress,
  };
};
