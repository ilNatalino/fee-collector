import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import { requestCreateGroup, requestDeleteGroup, requestToggleMemberPaid } from '@/src/data/groupApi';
import { mockActivities, mockGroups } from '@/src/data/mockGroups';
import { ActivityEntry, CreateGroupInput, Group } from '@/src/types/group';

type GroupContextValue = {
  groups: Group[];
  activities: ActivityEntry[];
  addGroup: (input: CreateGroupInput) => void;
  deleteGroup: (groupId: string) => Promise<void>;
  toggleMemberPaid: (groupId: string, memberId: string) => Promise<void>;
  addMemberToGroup: (groupId: string, name: string, amountDue: number) => void;
};

const GroupContext = createContext<GroupContextValue | undefined>(undefined);

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function GroupProvider({ children }: PropsWithChildren) {
  const [groups, setGroups] = useState<Group[]>(() => mockGroups);
  const [activities, setActivities] = useState<ActivityEntry[]>(() => mockActivities);

  const addGroup = useCallback((input: CreateGroupInput) => {
    const newGroup: Group = {
      id: createId(),
      name: input.name,
      emoji: input.emoji,
      createdDate: new Date().toISOString(),
      totalAmount: input.totalAmount,
      members: input.members.map((m) => ({
        id: createId(),
        name: m.name,
        amountDue: m.amountDue,
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
            void requestToggleMemberPaid(groupId, memberId, newPaid);

            if (newPaid) {
              const activity: ActivityEntry = {
                id: createId(),
                groupId,
                groupName: g.name,
                memberName: m.name,
                amount: m.amountDue,
                date: new Date().toISOString(),
                status: 'confirmed',
              };
              setActivities((prev) => [activity, ...prev]);
            }

            return { ...m, hasPaid: newPaid };
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
              hasPaid: false,
              insertedDate: new Date().toISOString(),
            },
          ],
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
    }),
    [groups, activities, addGroup, deleteGroup, toggleMemberPaid, addMemberToGroup],
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
