import { describe, expect, it } from 'vitest';

import { mockGroups } from '../data/mockGroups';

import { projectActivityLog } from './activityLog';
import { deletePaymentInGroups, editPaymentInGroups } from './groupCommands';
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

describe('activity log and group projections stay in sync', () => {
  it('reflects the same current payment after editing a payment', () => {
    const targetPaymentId = 'p-g4-v3';
    const originalCollectedAmountCents = getCollectedAmountCents('g4');
    const updatedGroups = editPaymentInGroups(mockGroups, targetPaymentId, {
      amountCents: 9000,
    });
    const updatedPayment = projectActivityLog(updatedGroups).payments.find(
      (payment) => payment.paymentId === targetPaymentId,
    );

    expect(updatedPayment?.amountCents).toBe(9000);
    expect(updatedPayment?.maxEditableAmountCents).toBe(15000);
    expect(getCollectedAmountCents('g4', updatedGroups)).toBe(originalCollectedAmountCents + 4000);
  });

  it('removes deleted payments from the activity log and lowers the group total', () => {
    const targetPaymentId = 'p-g4-v3';
    const updatedGroups = editPaymentInGroups(mockGroups, targetPaymentId, {
      amountCents: 9000,
    });
    const groupsWithoutPayment = deletePaymentInGroups(updatedGroups, targetPaymentId);

    expect(projectActivityLog(groupsWithoutPayment).payments.some((payment) => payment.paymentId === targetPaymentId)).toBe(false);
    expect(getCollectedAmountCents('g4', groupsWithoutPayment)).toBe(getCollectedAmountCents('g4', updatedGroups) - 9000);
  });
});
