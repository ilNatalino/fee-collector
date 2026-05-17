import { describe, expect, it } from 'vitest';

import { mockGroups } from '../data/mockGroups';
import type { Group } from '../types/group';

import { projectActivityLog } from './activityLog';
import { deletePaymentInGroups, editPaymentInGroups } from './groupCommands';

function cloneGroups(groups: Group[]): Group[] {
  return groups.map((group) => ({
    ...group,
    memberships: group.memberships.map((membership) => ({
      ...membership,
      member: { ...membership.member },
      quota: { ...membership.quota },
      payments: membership.payments.map((payment) => ({ ...payment })),
    })),
  }));
}

describe('activity log projection', () => {
  it('projects payments in reverse chronological order', () => {
    const groups: Group[] = [
      {
        id: 'g-chronological',
        name: 'Chronological Group',
        createdDate: '2026-03-01T08:00:00.000Z',
        targetAmountCents: 3000,
        memberships: [
          {
            id: 'm-1',
            joinedAt: '2026-03-01T08:00:00.000Z',
            member: {
              id: 'member-1',
              fullName: 'Older Payment',
              createdAt: '2026-03-01T08:00:00.000Z',
            },
            quota: {
              amountCents: 1000,
            },
            payments: [
              {
                id: 'payment-oldest',
                membershipId: 'm-1',
                amountCents: 1000,
                recordedAt: '2026-03-01T08:00:00.000Z',
                recordedMemberName: 'Older Payment',
                recordedGroupName: 'Chronological Group',
              },
            ],
          },
          {
            id: 'm-2',
            joinedAt: '2026-03-01T08:00:00.000Z',
            member: {
              id: 'member-2',
              fullName: 'Newest Payment',
              createdAt: '2026-03-01T08:00:00.000Z',
            },
            quota: {
              amountCents: 1000,
            },
            payments: [
              {
                id: 'payment-newest',
                membershipId: 'm-2',
                amountCents: 1000,
                recordedAt: '2026-03-03T08:00:00.000Z',
                recordedMemberName: 'Newest Payment',
                recordedGroupName: 'Chronological Group',
              },
            ],
          },
          {
            id: 'm-3',
            joinedAt: '2026-03-01T08:00:00.000Z',
            member: {
              id: 'member-3',
              fullName: 'Middle Payment',
              createdAt: '2026-03-01T08:00:00.000Z',
            },
            quota: {
              amountCents: 1000,
            },
            payments: [
              {
                id: 'payment-middle',
                membershipId: 'm-3',
                amountCents: 1000,
                recordedAt: '2026-03-02T08:00:00.000Z',
                recordedMemberName: 'Middle Payment',
                recordedGroupName: 'Chronological Group',
              },
            ],
          },
        ],
      },
    ];

    const projection = projectActivityLog(groups);

    expect(projection.payments.map((payment) => payment.paymentId)).toEqual([
      'payment-newest',
      'payment-middle',
      'payment-oldest',
    ]);
  });

  it('keeps original recorded labels and recorded date after editing a payment', () => {
    const renamedGroups = cloneGroups(mockGroups);
    const renamedGroup = renamedGroups.find((group) => group.id === 'g4');

    expect(renamedGroup).toBeDefined();

    renamedGroup!.name = 'Renamed Current Group';
    renamedGroup!.memberships[2].member.fullName = 'Renamed Current Member';

    const editedGroups = editPaymentInGroups(renamedGroups, 'p-g4-v3', {
      amountCents: 9000,
    });
    const paymentProjection = projectActivityLog(editedGroups).payments.find(
      (payment) => payment.paymentId === 'p-g4-v3',
    );

    expect(paymentProjection).toBeDefined();
    expect(paymentProjection).toMatchObject({
      paymentId: 'p-g4-v3',
      groupId: 'g4',
      membershipId: 'v3',
      recordedGroupName: 'Viaggio Sardegna',
      recordedMemberName: 'Luca Ferri',
      recordedAt: '2026-03-01T10:00:00.000Z',
      amountCents: 9000,
    });
    expect(paymentProjection?.recordedGroupName).not.toBe(renamedGroup!.name);
    expect(paymentProjection?.recordedMemberName).not.toBe(renamedGroup!.memberships[2].member.fullName);
  });

  it('removes deleted payments from the current activity log', () => {
    const groupsWithoutPayment = deletePaymentInGroups(mockGroups, 'p-g4-v3');
    const projection = projectActivityLog(groupsWithoutPayment);

    expect(projection.payments.some((payment) => payment.paymentId === 'p-g4-v3')).toBe(false);
  });
});