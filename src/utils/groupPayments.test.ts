import { describe, expect, it } from 'vitest';

import { mockGroups } from '../data/mockGroups';

import { getGroupProgress } from './groupMetrics';
import { deletePaymentInGroups, getUserActivitiesFromGroups, updatePaymentInGroups } from './groupPayments';

describe('group payments', () => {
  it('keeps activity reads and group totals in sync after editing a payment', () => {
    const targetPaymentId = 'p-g4-v3';
    const originalGroup = mockGroups.find((group) => group.id === 'g4');

    expect(originalGroup).toBeDefined();

    const originalCollectedAmountCents = getGroupProgress(originalGroup!).collectedAmountCents;
    const updatedGroups = updatePaymentInGroups(mockGroups, targetPaymentId, {
      memberName: 'Luca Ferri',
      amountCents: 9000,
    });
    const updatedGroup = updatedGroups.find((group) => group.id === 'g4');
    const updatedActivity = getUserActivitiesFromGroups(updatedGroups).find((activity) => activity.id === targetPaymentId);

    expect(updatedActivity?.amount).toBe(90);
    expect(getGroupProgress(updatedGroup!).collectedAmountCents).toBe(originalCollectedAmountCents + 4000);
  });

  it('keeps activity reads and group totals in sync after deleting a payment', () => {
    const targetPaymentId = 'p-g4-v3';
    const updatedGroups = updatePaymentInGroups(mockGroups, targetPaymentId, {
      memberName: 'Luca Ferri',
      amountCents: 9000,
    });
    const updatedGroup = updatedGroups.find((group) => group.id === 'g4');
    const groupsWithoutPayment = deletePaymentInGroups(updatedGroups, targetPaymentId);
    const groupWithoutPayment = groupsWithoutPayment.find((group) => group.id === 'g4');

    expect(getUserActivitiesFromGroups(groupsWithoutPayment).some((activity) => activity.id === targetPaymentId)).toBe(false);
    expect(getGroupProgress(groupWithoutPayment!).collectedAmountCents).toBe(
      getGroupProgress(updatedGroup!).collectedAmountCents - 9000,
    );
  });
});