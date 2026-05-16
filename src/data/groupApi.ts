import { CreateGroupInput } from '@/src/types/group';

export async function requestCreateGroup(_input: CreateGroupInput): Promise<void> {
  return Promise.resolve();
}

export async function requestDeleteGroup(_groupId: string): Promise<void> {
  return Promise.resolve();
}

export async function requestRecordPayment(
  _groupId: string,
  _membershipId: string,
  _amountCents: number,
): Promise<void> {
  return Promise.resolve();
}

export async function requestDeletePayment(_paymentId: string): Promise<void> {
  return Promise.resolve();
}

export async function requestEditPayment(
  _paymentId: string,
  _amountCents: number,
): Promise<void> {
  return Promise.resolve();
}
