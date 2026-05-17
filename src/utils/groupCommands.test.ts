import { describe, expect, it } from 'vitest';

import { mockGroups } from '../data/mockGroups';

import {
  createGroupInGroups,
    deletePaymentInGroups,
    editPaymentInGroups,
    markMembershipAsPaidInGroups,
    recordPaymentInGroups,
} from './groupCommands';

describe('group commands', () => {
  it('rejects creating a group without memberships', () => {
    const updatedGroups = createGroupInGroups(mockGroups, {
      name: 'Empty Roster',
      targetAmountCents: 1000,
      memberships: [],
    });

    expect(updatedGroups).toBe(mockGroups);
  });

  it('rejects creating a group when quotas do not sum to the group target', () => {
    const updatedGroups = createGroupInGroups(mockGroups, {
      name: 'Broken Target',
      targetAmountCents: 3000,
      memberships: [
        {
          memberName: 'New Member',
          quotaAmountCents: 2000,
        },
      ],
    });

    expect(updatedGroups).toBe(mockGroups);
  });

  it('rejects creating a group with duplicate full names in the same roster', () => {
    const updatedGroups = createGroupInGroups(mockGroups, {
      name: 'Duplicate Names',
      targetAmountCents: 4000,
      memberships: [
        {
          memberName: 'Giulia Rossi',
          quotaAmountCents: 2000,
        },
        {
          memberName: 'Giulia Rossi',
          quotaAmountCents: 2000,
        },
      ],
    });

    expect(updatedGroups).toBe(mockGroups);
  });

  it('reuses an existing member identity for exact full-name matches when creating a group', () => {
    const existingMember = mockGroups[0].memberships[0].member;
    const generatedIds = ['g-new', 'membership-new'];
    const updatedGroups = createGroupInGroups(
      mockGroups,
      {
        name: 'Weekend Escape',
        targetAmountCents: 3000,
        memberships: [
          {
            memberName: existingMember.fullName,
            quotaAmountCents: 3000,
          },
        ],
      },
      {
        createdAt: '2026-03-22T10:00:00.000Z',
        createId: () => generatedIds.shift() ?? 'unused-id',
      },
    );

    expect(updatedGroups).not.toBe(mockGroups);
    expect(updatedGroups[0].memberships[0].member).toEqual(existingMember);
  });

  it('records a payment on the targeted membership', () => {
    const updatedGroups = recordPaymentInGroups(mockGroups, {
      groupId: 'g4',
      membershipId: 'v5',
      amountCents: 7000,
      paymentId: 'p-g4-v5-new',
      recordedAt: '2026-03-20T10:00:00.000Z',
    });

    const updatedMembership = updatedGroups
      .find((group) => group.id === 'g4')
      ?.memberships.find((membership) => membership.id === 'v5');

    expect(updatedMembership?.payments).toContainEqual({
      id: 'p-g4-v5-new',
      membershipId: 'v5',
      amountCents: 7000,
      recordedAt: '2026-03-20T10:00:00.000Z',
      recordedMemberName: 'Paolo Conti',
      recordedGroupName: 'Viaggio Sardegna',
    });
  });

  it('rejects recording a payment that is not strictly positive', () => {
    const updatedGroups = recordPaymentInGroups(mockGroups, {
      groupId: 'g4',
      membershipId: 'v5',
      amountCents: 0,
    });

    expect(updatedGroups).toBe(mockGroups);
  });

  it('rejects recording a payment that would exceed the remaining quota', () => {
    const updatedGroups = recordPaymentInGroups(mockGroups, {
      groupId: 'g4',
      membershipId: 'v3',
      amountCents: 10001,
    });

    expect(updatedGroups).toBe(mockGroups);
  });

  it('edits a payment amount without changing its membership or recorded labels', () => {
    const updatedGroups = editPaymentInGroups(mockGroups, 'p-g4-v3', {
      amountCents: 9000,
    });

    const updatedMembership = updatedGroups
      .find((group) => group.id === 'g4')
      ?.memberships.find((membership) => membership.id === 'v3');
    const updatedPayment = updatedMembership?.payments.find((payment) => payment.id === 'p-g4-v3');

    expect(updatedMembership?.id).toBe('v3');
    expect(updatedPayment).toMatchObject({
      id: 'p-g4-v3',
      membershipId: 'v3',
      amountCents: 9000,
      recordedAt: '2026-03-01T10:00:00.000Z',
      recordedMemberName: 'Luca Ferri',
      recordedGroupName: 'Viaggio Sardegna',
    });
  });

  it('rejects editing a payment to a non-positive amount', () => {
    const updatedGroups = editPaymentInGroups(mockGroups, 'p-g4-v3', {
      amountCents: 0,
    });

    expect(updatedGroups).toBe(mockGroups);
  });

  it('rejects a payment edit that would exceed the membership quota', () => {
    const updatedGroups = editPaymentInGroups(mockGroups, 'p-g1-m15', {
      amountCents: 3000,
    });

    const unchangedPayment = updatedGroups
      .find((group) => group.id === 'g1')
      ?.memberships.find((membership) => membership.id === 'm15')
      ?.payments.find((payment) => payment.id === 'p-g1-m15');

    expect(unchangedPayment?.amountCents).toBe(500);
  });

  it('deletes a payment from its membership', () => {
    const updatedGroups = deletePaymentInGroups(mockGroups, 'p-g4-v3');

    const updatedMembership = updatedGroups
      .find((group) => group.id === 'g4')
      ?.memberships.find((membership) => membership.id === 'v3');

    expect(updatedMembership?.payments).toEqual([]);
  });

  it('marks a membership as paid by recording its remaining amount', () => {
    const updatedGroups = markMembershipAsPaidInGroups(mockGroups, {
      groupId: 'g4',
      membershipId: 'v5',
      paymentId: 'p-g4-v5-paid',
      recordedAt: '2026-03-21T10:00:00.000Z',
    });

    const newPayment = updatedGroups
      .find((group) => group.id === 'g4')
      ?.memberships.find((membership) => membership.id === 'v5')
      ?.payments.find((payment) => payment.id === 'p-g4-v5-paid');

    expect(newPayment?.amountCents).toBe(15000);
  });
});