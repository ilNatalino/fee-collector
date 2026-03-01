import { UpdateQuotaInput } from '@/src/types/quota';

export async function requestDeleteQuota(_quotaId: string): Promise<void> {
  return Promise.resolve();
}

export async function requestUpdateQuota(_quotaId: string, _input: UpdateQuotaInput): Promise<void> {
  return Promise.resolve();
}