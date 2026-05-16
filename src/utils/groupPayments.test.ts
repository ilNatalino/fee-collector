import { describe, expect, it } from 'vitest';

import { mockGroups } from '../data/mockGroups';

import { deletePaymentInGroups, editPaymentInGroups } from './groupCommands';
import { getUserActivitiesFromGroups } from './groupPayments';
import { projectGroup } from './groupProjection';

function getCollectedAmountCents(groupId: string, groups = mockGroups): number {
  const group = groups.find((candidateGroup) => candidateGroup.id === groupId);

  expect(group).toBeDefined();

  const projection = projectGroup(group!);

  expect(projection.kind).toBe('group-projection');

  if (projection.kind !== 'group-projection') {
    throw new Error(`Expected a valid group projection for ${groupId}.`);
  }

  return projection.collectedAmountCents;
}

describe('group payments', () => {
  it('keeps activity reads and group totals in sync after editing a payment', () => {
    const targetPaymentId = 'p-g4-v3';
    const originalCollectedAmountCents = getCollectedAmountCents('g4');
    const updatedGroups = editPaymentInGroups(mockGroups, targetPaymentId, {
      amountCents: 9000,
    });
    const updatedGroup = updatedGroups.find((group) => group.id === 'g4');
    const updatedActivity = getUserActivitiesFromGroups(updatedGroups).find((activity) => activity.id === targetPaymentId);

    expect(updatedActivity?.amount).toBe(90);
    expect(updatedGroup).toBeDefined();
    expect(getCollectedAmountCents('g4', updatedGroups)).toBe(originalCollectedAmountCents + 4000);
  });

  it('keeps activity reads and group totals in sync after deleting a payment', () => {
    const targetPaymentId = 'p-g4-v3';
    const updatedGroups = editPaymentInGroups(mockGroups, targetPaymentId, {
      amountCents: 9000,
    });
    const groupsWithoutPayment = deletePaymentInGroups(updatedGroups, targetPaymentId);

    expect(getUserActivitiesFromGroups(groupsWithoutPayment).some((activity) => activity.id === targetPaymentId)).toBe(false);
    expect(getCollectedAmountCents('g4', groupsWithoutPayment)).toBe(getCollectedAmountCents('g4', updatedGroups) - 9000);
  });
});