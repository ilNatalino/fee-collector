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
import {
    createGroupInGroups,
    deletePaymentInGroups,
    editPaymentInGroups,
    EditPaymentInput,
    recordPaymentInGroups,
} from '@/src/utils/groupCommands';

type GroupContextValue = {
  groups: Group[];
  createGroup: (input: CreateGroupInput) => void;
  deleteGroup: (groupId: string) => Promise<void>;
  recordPayment: (groupId: string, membershipId: string, amountCents: number) => Promise<void>;
  deletePayment: (paymentId: string) => Promise<void>;
  editPayment: (paymentId: string, input: EditPaymentInput) => Promise<void>;
};

const GroupContext = createContext<GroupContextValue | undefined>(undefined);

export function GroupProvider({ children }: PropsWithChildren) {
  const [groups, setGroups] = useState<Group[]>(() => mockGroups);

  const createGroup = useCallback((input: CreateGroupInput) => {
    const nextGroups = createGroupInGroups(groups, input);

    if (nextGroups === groups) {
      return;
    }

    void requestCreateGroup(input);
    setGroups(nextGroups);
  }, [groups]);

  const deleteGroup = useCallback(async (groupId: string) => {
    await requestDeleteGroup(groupId);
    setGroups((current) => current.filter((g) => g.id !== groupId));
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
      recordPayment,
      deletePayment,
      editPayment,
    }),
    [groups, createGroup, deleteGroup, recordPayment, deletePayment, editPayment],
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
