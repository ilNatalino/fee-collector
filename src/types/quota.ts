import { MoneyCents } from './group';

export interface QuotaSummary {
  totalMemberships: number;
  paidMemberships: number;
  partialMemberships: number;
  unpaidMemberships: number;
  totalAmountCents: MoneyCents;
  collectedAmountCents: MoneyCents;
  remainingAmountCents: MoneyCents;
  progress: number;
}