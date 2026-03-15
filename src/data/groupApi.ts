import { CreateGroupInput } from '@/src/types/group';

export async function requestCreateGroup(_input: CreateGroupInput): Promise<void> {
  return Promise.resolve();
}

export async function requestDeleteGroup(_groupId: string): Promise<void> {
  return Promise.resolve();
}

export async function requestToggleMemberPaid(
  _groupId: string,
  _memberId: string,
  _hasPaid: boolean,
): Promise<void> {
  return Promise.resolve();
}
