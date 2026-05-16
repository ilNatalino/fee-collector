import { CreateGroupInput } from '@/src/types/group';

export async function requestCreateGroup(_input: CreateGroupInput): Promise<void> {
  return Promise.resolve();
}

export async function requestDeleteGroup(_groupId: string): Promise<void> {
  return Promise.resolve();
}

export async function requestToggleMemberPaid(
  _groupId: string,
  _membershipId: string,
  _hasPaid: boolean,
): Promise<void> {
  return Promise.resolve();
}

export async function requestAddPayment(
  _groupId: string,
  _membershipId: string,
  _amountCents: number,
): Promise<void> {
  return Promise.resolve();
}

export async function requestDeletePayment(_paymentId: string): Promise<void> {
  return Promise.resolve();
}

export async function requestUpdatePayment(
  _paymentId: string,
  _memberName: string,
  _amountCents: number,
): Promise<void> {
  return Promise.resolve();
}
