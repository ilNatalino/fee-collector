import { describe, expect, it } from 'vitest';

import { mockGroups } from './mockGroups';

describe('mock group fixtures', () => {
  it('represent groups through memberships, members, and payments', () => {
    expect(mockGroups.length).toBeGreaterThan(0);

    for (const group of mockGroups) {
      expect(group.memberships.length).toBeGreaterThan(0);

      for (const membership of group.memberships) {
        expect(membership.member.fullName.length).toBeGreaterThan(0);
        expect(membership.quota.amountCents).toBeGreaterThan(0);
        expect(membership).not.toHaveProperty('hasPaid');
        expect(membership).not.toHaveProperty('amountPaid');

        for (const payment of membership.payments) {
          expect(payment.membershipId).toBe(membership.id);
          expect(payment.amountCents).toBeGreaterThan(0);
        }
      }
    }
  });
});