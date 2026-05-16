import { Membership, MoneyCents } from '@/src/types/group';

export type QuotaStatus = 'unpaid' | 'partial' | 'paid';

export function getMembershipCollectedAmountCents(membership: Membership): MoneyCents {
  return membership.payments.reduce((sum, payment) => sum + payment.amountCents, 0);
}

export function getMembershipRemainingAmountCents(membership: Membership): MoneyCents {
  return Math.max(0, membership.quota.amountCents - getMembershipCollectedAmountCents(membership));
}

export function getMembershipQuotaStatus(membership: Membership): QuotaStatus {
  const collectedAmountCents = getMembershipCollectedAmountCents(membership);

  if (collectedAmountCents <= 0) {
    return 'unpaid';
  }

  if (collectedAmountCents >= membership.quota.amountCents) {
    return 'paid';
  }

  return 'partial';
}