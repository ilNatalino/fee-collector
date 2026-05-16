import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import {
    requestAddPayment,
    requestCreateGroup,
    requestDeleteGroup,
    requestDeletePayment,
    requestToggleMemberPaid,
    requestUpdatePayment,
} from '@/src/data/groupApi';
import { mockGroups } from '@/src/data/mockGroups';
import { CreateGroupInput, Group, Membership, Payment } from '@/src/types/group';
import { deletePaymentInGroups, updatePaymentInGroups, UpdatePaymentInput } from '@/src/utils/groupPayments';

import { getMembershipRemainingAmountCents } from '../utils/membershipMetrics';

type GroupContextValue = {
  groups: Group[];
  addGroup: (input: CreateGroupInput) => void;
  deleteGroup: (groupId: string) => Promise<void>;
  toggleMemberPaid: (groupId: string, membershipId: string) => Promise<void>;
  addMemberToGroup: (groupId: string, fullName: string, quotaAmountCents: number) => void;
  addPayment: (groupId: string, membershipId: string, amountCents: number) => Promise<void>;
  deletePaymentById: (paymentId: string) => Promise<void>;
  updatePaymentById: (paymentId: string, input: UpdatePaymentInput) => Promise<void>;
};

const GroupContext = createContext<GroupContextValue | undefined>(undefined);

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const buildPayment = (group: Group, membership: Membership, amountCents: number, paymentId = createId()): Payment => ({
  id: paymentId,
  membershipId: membership.id,
  amountCents,
  recordedAt: new Date().toISOString(),
  recordedMemberName: membership.member.fullName,
  recordedGroupName: group.name,
});

export function GroupProvider({ children }: PropsWithChildren) {
  const [groups, setGroups] = useState<Group[]>(() => mockGroups);

  const addGroup = useCallback((input: CreateGroupInput) => {
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

  const toggleMemberPaid = useCallback(async (groupId: string, membershipId: string) => {
    setGroups((current) =>
      current.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          memberships: g.memberships.map((membership) => {
            if (membership.id !== membershipId) return membership;

            const remainingAmountCents = getMembershipRemainingAmountCents(membership);
            const nextPayments =
              remainingAmountCents > 0 ? [...membership.payments, buildPayment(g, membership, remainingAmountCents)] : [];

            void requestToggleMemberPaid(groupId, membershipId, remainingAmountCents > 0);

            return { ...membership, payments: nextPayments };
          }),
        };
      }),
    );
  }, []);

  const addMemberToGroup = useCallback((groupId: string, fullName: string, quotaAmountCents: number) => {
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

  const addPayment = useCallback(async (groupId: string, membershipId: string, amountCents: number) => {
    setGroups((current) =>
      current.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          memberships: g.memberships.map((membership) => {
            if (membership.id !== membershipId) return membership;

            void requestAddPayment(groupId, membershipId, amountCents);

            const payment = buildPayment(g, membership, amountCents);

            return { ...membership, payments: [...membership.payments, payment] };
          }),
        };
      }),
    );
  }, []);

  const deletePaymentById = useCallback(async (paymentId: string) => {
    await requestDeletePayment(paymentId);
    setGroups((current) => deletePaymentInGroups(current, paymentId));
  }, []);

  const updatePaymentById = useCallback(async (paymentId: string, input: UpdatePaymentInput) => {
    await requestUpdatePayment(paymentId, input.memberName, input.amountCents);
    setGroups((current) => updatePaymentInGroups(current, paymentId, input));
  }, []);

  const value = useMemo(
    () => ({
      groups,
      addGroup,
      deleteGroup,
      toggleMemberPaid,
      addMemberToGroup,
      addPayment,
      deletePaymentById,
      updatePaymentById,
    }),
    [groups, addGroup, deleteGroup, toggleMemberPaid, addMemberToGroup, addPayment, deletePaymentById, updatePaymentById],
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
