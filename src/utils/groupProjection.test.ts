import { describe, expect, it } from 'vitest';

import { mockGroups } from '../data/mockGroups';
import type { Group, Membership } from '../types/group';

import { editPaymentInGroups } from './groupCommands';
import {
    GroupProjection,
    GroupProjectionResult,
    MemberQuotaProjection,
    MemberQuotaProjectionResult,
    projectGroup,
    projectGroupCollection,
    projectMemberQuota,
} from './groupProjection';

function cloneGroup(group: Group): Group {
  return {
    ...group,
    memberships: group.memberships.map((membership) => ({
      ...membership,
      member: { ...membership.member },
      quota: { ...membership.quota },
      payments: membership.payments.map((payment) => ({ ...payment })),
    })),
  };
}

function expectGroupProjection(result: GroupProjectionResult): GroupProjection {
  expect(result.kind).toBe('group-projection');

  if (result.kind !== 'group-projection') {
    throw new Error('Expected a valid group projection.');
  }

  return result;
}

function expectMemberQuotaProjection(result: MemberQuotaProjectionResult): MemberQuotaProjection {
  expect(result.kind).toBe('member-quota-projection');

  if (result.kind !== 'member-quota-projection') {
    throw new Error('Expected a valid member quota projection.');
  }

  return result;
}

function findGroup(groupId: string): Group {
  const group = mockGroups.find((candidateGroup) => candidateGroup.id === groupId);

  if (!group) {
    throw new Error(`Missing test group ${groupId}.`);
  }

  return group;
}

function findMembership(group: Group, membershipId: string): Membership {
  const membership = group.memberships.find((candidateMembership) => candidateMembership.id === membershipId);

  if (!membership) {
    throw new Error(`Missing test membership ${membershipId}.`);
  }

  return membership;
}

describe('group projection', () => {
  it('projects group status, progress, due state, amounts, and quota breakdown', () => {
    const projection = expectGroupProjection(projectGroup(findGroup('g4'), { now: new Date('2026-03-15T12:00:00.000Z') }));

    expect(projection.groupName).toBe('Viaggio Sardegna');
    expect(projection.groupCategory).toBe('travel');
    expect(projection.groupEmoji).toBe('✈️');
    expect(projection.createdDate).toBe('2026-03-01T10:00:00.000Z');
    expect(projection.dueDate).toBeUndefined();
    expect(projection.groupStatus).toBe('collecting');
    expect(projection.groupProgressPercentage).toBe(75);
    expect(projection.dueState).toBe('no-deadline');
    expect(projection.collectedAmountCents).toBe(90000);
    expect(projection.remainingAmountCents).toBe(30000);
    expect(projection.quotaBreakdown).toEqual({
      unpaidMembershipCount: 1,
      partialMembershipCount: 2,
      paidMembershipCount: 5,
    });
  });

  it('projects member quota collected and remaining amounts', () => {
    const projection = expectMemberQuotaProjection(projectMemberQuota(findMembership(findGroup('g4'), 'v3')));

    expect(projection.collectedAmountCents).toBe(5000);
    expect(projection.remainingAmountCents).toBe(10000);
    expect(projection.quotaStatus).toBe('partial');
  });

  it('treats a collecting group as upcoming on the due date and overdue after it', () => {
    const group = findGroup('g1');
    const upcomingProjection = expectGroupProjection(projectGroup(group, { now: new Date('2026-04-20T12:00:00.000Z') }));
    const overdueProjection = expectGroupProjection(projectGroup(group, { now: new Date('2026-04-21T12:00:00.000Z') }));

    expect(upcomingProjection.dueState).toBe('upcoming');
    expect(overdueProjection.dueState).toBe('overdue');
  });

  it('reopens a completed group after a payment correction', () => {
    const correctedGroups = editPaymentInGroups(mockGroups, 'p-g3-b1', {
      amountCents: 1000,
    });
    const correctedGroup = correctedGroups.find((group) => group.id === 'g3');

    expect(correctedGroup).toBeDefined();

    const projection = expectGroupProjection(projectGroup(correctedGroup!, { now: new Date('2026-03-05T12:00:00.000Z') }));

    expect(projection.groupStatus).toBe('collecting');
    expect(projection.groupProgressPercentage).toBe(95);
    expect(projection.remainingAmountCents).toBe(1000);
    expect(projection.dueState).toBe('no-deadline');
  });

  it('returns an invalid group projection instead of throwing when the group target is invalid', () => {
    const invalidGroup = {
      ...cloneGroup(findGroup('g4')),
      targetAmountCents: 119999,
    } satisfies Group;
    const projection = projectGroup(invalidGroup);

    expect(projection.kind).toBe('invalid-group-projection');

    if (projection.kind !== 'invalid-group-projection') {
      throw new Error('Expected an invalid group projection.');
    }

    expect(projection.issues.map((issue) => issue.code)).toContain('group-target-mismatch');
  });

  it('returns an invalid collection projection when any group input is invalid', () => {
    const invalidGroup = {
      ...cloneGroup(findGroup('g4')),
      memberships: [],
    } satisfies Group;
    const projection = projectGroupCollection([findGroup('g1'), invalidGroup]);

    expect(projection.kind).toBe('invalid-group-collection-projection');

    if (projection.kind !== 'invalid-group-collection-projection') {
      throw new Error('Expected an invalid group collection projection.');
    }

    expect(projection.issues.map((issue) => issue.code)).toContain('group-has-no-memberships');
  });
});