import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import { requestAddPayment, requestCreateGroup, requestDeleteGroup, requestToggleMemberPaid } from '@/src/data/groupApi';
import { mockActivities, mockGroups } from '@/src/data/mockGroups';
import { ActivityEntry, CreateGroupInput, Group } from '@/src/types/group';

type GroupContextValue = {
  groups: Group[];
  activities: ActivityEntry[];
  addGroup: (input: CreateGroupInput) => void;
  deleteGroup: (groupId: string) => Promise<void>;
  toggleMemberPaid: (groupId: string, memberId: string) => Promise<void>;
  addMemberToGroup: (groupId: string, name: string, amountDue: number) => void;
  addPayment: (groupId: string, memberId: string, amount: number) => Promise<void>;
};

const GroupContext = createContext<GroupContextValue | undefined>(undefined);

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function GroupProvider({ children }: PropsWithChildren) {
  const [groups, setGroups] = useState<Group[]>(() =>
    mockGroups.map((g) => ({
      ...g,
      members: g.members.map((m) => ({
        ...m,
        amountPaid: m.amountPaid ?? (m.hasPaid ? m.amountDue : 0),
      })),
    }))
  );
  const [activities, setActivities] = useState<ActivityEntry[]>(() => mockActivities);

  const addGroup = useCallback((input: CreateGroupInput) => {
    const newGroup: Group = {
      id: createId(),
      name: input.name,
      category: input.category,
      emoji: input.emoji,
      createdDate: new Date().toISOString(),
      totalAmount: input.totalAmount,
      members: input.members.map((m) => ({
        id: createId(),
        name: m.name,
        amountDue: m.amountDue,
        amountPaid: 0,
        hasPaid: false,
        insertedDate: new Date().toISOString(),
      })),
    };
    void requestCreateGroup(input);
    setGroups((current) => [newGroup, ...current]);
  }, []);

  const deleteGroup = useCallback(async (groupId: string) => {
    await requestDeleteGroup(groupId);
    setGroups((current) => current.filter((g) => g.id !== groupId));
  }, []);

  const toggleMemberPaid = useCallback(async (groupId: string, memberId: string) => {
    setGroups((current) =>
      current.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          members: g.members.map((m) => {
            if (m.id !== memberId) return m;
            const newPaid = !m.hasPaid;
            const newAmountPaid = newPaid ? m.amountDue : 0;
            void requestToggleMemberPaid(groupId, memberId, newPaid);

            if (newPaid) {
              const activity: ActivityEntry = {
                id: createId(),
                groupId,
                groupName: g.name,
                memberName: m.name,
                amount: m.amountDue - (m.amountPaid ?? 0),
                date: new Date().toISOString(),
                status: 'confirmed',
              };
              setActivities((prev) => [activity, ...prev]);
            }

            return { ...m, hasPaid: newPaid, amountPaid: newAmountPaid };
          }),
        };
      }),
    );
  }, []);

  const addMemberToGroup = useCallback((groupId: string, name: string, amountDue: number) => {
    setGroups((current) =>
      current.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          members: [
            ...g.members,
            {
              id: createId(),
              name,
              amountDue,
              amountPaid: 0,
              hasPaid: false,
              insertedDate: new Date().toISOString(),
            },
          ],
        };
      }),
    );
  }, []);

  const addPayment = useCallback(async (groupId: string, memberId: string, amount: number) => {
    setGroups((current) =>
      current.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          members: g.members.map((m) => {
            if (m.id !== memberId) return m;
            
            // Add the payment to amountPaid
            const currentPaid = m.amountPaid ?? 0;
            const newAmountPaid = currentPaid + amount;
            const newPaid = newAmountPaid >= m.amountDue;

            void requestAddPayment(groupId, memberId, amount);

            const activity: ActivityEntry = {
              id: createId(),
              groupId,
              groupName: g.name,
              memberName: m.name,
              amount: amount,
              date: new Date().toISOString(),
              status: 'confirmed',
            };
            setActivities((prev) => [activity, ...prev]);

            return { ...m, amountPaid: newAmountPaid, hasPaid: newPaid || m.hasPaid };
          }),
        };
      }),
    );
  }, []);

  const value = useMemo(
    () => ({
      groups,
      activities,
      addGroup,
      deleteGroup,
      toggleMemberPaid,
      addMemberToGroup,
      addPayment,
    }),
    [groups, activities, addGroup, deleteGroup, toggleMemberPaid, addMemberToGroup, addPayment],
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
