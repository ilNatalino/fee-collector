import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import {
    requestCreateGroup,
    requestDeleteGroup,
    requestDeletePayment,
    requestEditPayment,
    requestRecordPayment,
} from '@/src/data/groupApi';
import { mockGroups } from '@/src/data/mockGroups';
import { CreateGroupInput, Group } from '@/src/types/group';
import { deletePaymentInGroups, editPaymentInGroups, EditPaymentInput, recordPaymentInGroups } from '@/src/utils/groupCommands';
import { projectMemberQuota } from '@/src/utils/groupProjection';

type GroupContextValue = {
  groups: Group[];
  createGroup: (input: CreateGroupInput) => void;
  deleteGroup: (groupId: string) => Promise<void>;
  addMembership: (groupId: string, fullName: string, quotaAmountCents: number) => void;
  recordPayment: (groupId: string, membershipId: string, amountCents: number) => Promise<void>;
  markMembershipAsPaid: (groupId: string, membershipId: string) => Promise<void>;
  deletePayment: (paymentId: string) => Promise<void>;
  editPayment: (paymentId: string, input: EditPaymentInput) => Promise<void>;
};

const GroupContext = createContext<GroupContextValue | undefined>(undefined);

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function GroupProvider({ children }: PropsWithChildren) {
  const [groups, setGroups] = useState<Group[]>(() => mockGroups);

  const createGroup = useCallback((input: CreateGroupInput) => {
    const createdAt = new Date().toISOString();
    const newGroup: Group = {
      id: createId(),
      name: input.name,
      category: input.category,
      emoji: input.emoji,
      createdDate: createdAt,
      targetAmountCents: input.targetAmountCents,
      memberships: input.memberships.map((membershipInput) => ({
        id: createId(),
        joinedAt: createdAt,
        member: {
          id: createId(),
          fullName: membershipInput.memberName,
          createdAt,
        },
        quota: {
          amountCents: membershipInput.quotaAmountCents,
        },
        payments: [],
      })),
    };
    void requestCreateGroup(input);
    setGroups((current) => [newGroup, ...current]);
  }, []);

  const deleteGroup = useCallback(async (groupId: string) => {
    await requestDeleteGroup(groupId);
    setGroups((current) => current.filter((g) => g.id !== groupId));
  }, []);

  const addMembership = useCallback((groupId: string, fullName: string, quotaAmountCents: number) => {
    const createdAt = new Date().toISOString();
    setGroups((current) =>
      current.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          memberships: [
            ...g.memberships,
            {
              id: createId(),
              joinedAt: createdAt,
              member: {
                id: createId(),
                fullName,
                createdAt,
              },
              quota: {
                amountCents: quotaAmountCents,
              },
              payments: [],
            },
          ],
        };
      }),
    );
  }, []);

  const recordPayment = useCallback(async (groupId: string, membershipId: string, amountCents: number) => {
    const nextGroups = recordPaymentInGroups(groups, {
      groupId,
      membershipId,
      amountCents,
    });

    if (nextGroups === groups) {
      return;
    }

    setGroups(nextGroups);
    await requestRecordPayment(groupId, membershipId, amountCents);
  }, [groups]);

  const markMembershipAsPaid = useCallback(async (groupId: string, membershipId: string) => {
    const membership = groups
      .find((group) => group.id === groupId)
      ?.memberships.find((candidateMembership) => candidateMembership.id === membershipId);

    if (!membership) {
      return;
    }

    const memberQuotaProjection = projectMemberQuota(membership);
    if (memberQuotaProjection.kind !== 'member-quota-projection') {
      return;
    }

    const remainingAmountCents = memberQuotaProjection.remainingAmountCents;
    if (remainingAmountCents <= 0) {
      return;
    }

    await recordPayment(groupId, membershipId, remainingAmountCents);
  }, [groups, recordPayment]);

  const deletePayment = useCallback(async (paymentId: string) => {
    const nextGroups = deletePaymentInGroups(groups, paymentId);

    if (nextGroups === groups) {
      return;
    }

    await requestDeletePayment(paymentId);
    setGroups(nextGroups);
  }, [groups]);

  const editPayment = useCallback(async (paymentId: string, input: EditPaymentInput) => {
    const nextGroups = editPaymentInGroups(groups, paymentId, input);

    if (nextGroups === groups) {
      return;
    }

    await requestEditPayment(paymentId, input.amountCents);
    setGroups(nextGroups);
  }, [groups]);

  const value = useMemo(
    () => ({
      groups,
      createGroup,
      deleteGroup,
      addMembership,
      recordPayment,
      markMembershipAsPaid,
      deletePayment,
      editPayment,
    }),
    [groups, createGroup, deleteGroup, addMembership, recordPayment, markMembershipAsPaid, deletePayment, editPayment],
  );

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
}

export function useGroupContext(): GroupContextValue {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroupContext must be used inside GroupProvider');
  }
  return context;
}
