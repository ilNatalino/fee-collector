import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { mockGroups } from '@/src/data/mockGroups';
import {
  buildGroupCollectionView,
  createInitialGroupCollectionState,
  GroupCollectionAdapter,
  GroupCollectionIssue,
  GroupCollectionSyncStatus,
  GroupCommandPreparation,
  GroupCommandResult,
  hydrateGroupCollectionState,
  prepareCreateGroupCommand,
  prepareDeleteGroupCommand,
  prepareDeletePaymentCommand,
  prepareEditPaymentCommand,
  prepareRecordPaymentCommand,
  selectGroupView,
  settlePreparedGroupCommand,
} from '@/src/modules/groupCollection';
import { createAsyncStorageGroupCollectionAdapter } from '@/src/storage/groupCollectionStorage';
import { CreateGroupInput } from '@/src/types/group';
import {
  EditPaymentInput,
} from '@/src/utils/groupCommands';
import { ActivityLogProjection } from '@/src/utils/activityLog';
import { GroupCollectionProjection, GroupProjection } from '@/src/utils/groupProjection';

export type GroupContextValue = {
  groupCollectionProjection: GroupCollectionProjection | null;
  activityLogProjection: ActivityLogProjection | null;
  isHydrating: boolean;
  syncStatus: GroupCollectionSyncStatus;
  issues: GroupCollectionIssue[];
  getGroupView: (groupId: string | undefined) => {
    groupProjection: GroupProjection | null;
    issues: GroupCollectionIssue[];
    isMissing: boolean;
  };
  createGroup: (input: CreateGroupInput) => Promise<GroupCommandResult>;
  deleteGroup: (groupId: string) => Promise<GroupCommandResult>;
  recordPayment: (groupId: string, membershipId: string, amountCents: number) => Promise<GroupCommandResult>;
  deletePayment: (paymentId: string) => Promise<GroupCommandResult>;
  editPayment: (paymentId: string, input: EditPaymentInput) => Promise<GroupCommandResult>;
};

const GroupContext = createContext<GroupContextValue | undefined>(undefined);

type GroupProviderProps = PropsWithChildren<{
  adapter?: GroupCollectionAdapter;
}>;

export function GroupProvider({ children, adapter }: GroupProviderProps) {
  const defaultAdapterRef = useRef<GroupCollectionAdapter | null>(null);
  if (!defaultAdapterRef.current) {
    defaultAdapterRef.current = createAsyncStorageGroupCollectionAdapter();
  }

  const resolvedAdapter = adapter ?? defaultAdapterRef.current;
  const [state, setState] = useState(createInitialGroupCollectionState);
  const stateRef = useRef(state);
  const commandQueueRef = useRef<Promise<void>>(Promise.resolve());

  const commitState = useCallback((nextState: ReturnType<typeof createInitialGroupCollectionState>) => {
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let mounted = true;

    commitState(createInitialGroupCollectionState());

    void hydrateGroupCollectionState(resolvedAdapter, mockGroups).then((hydratedState) => {
      if (mounted) {
        commitState(hydratedState);
      }
    });

    return () => {
      mounted = false;
    };
  }, [commitState, resolvedAdapter]);

  const runCommand = useCallback((prepare: (currentState: typeof state) => GroupCommandPreparation) => {
    const scheduledCommand = commandQueueRef.current.then(async () => {
      const preparation = prepare(stateRef.current);

      if (preparation.kind === 'rejected-group-command') {
        return preparation.result;
      }

      commitState(preparation.optimisticState);

      const settlement = await settlePreparedGroupCommand(resolvedAdapter, preparation);
      commitState(settlement.state);

      return settlement.result;
    });

    commandQueueRef.current = scheduledCommand.then(() => undefined, () => undefined);

    return scheduledCommand;
  }, [commitState, resolvedAdapter]);

  const createGroup = useCallback((input: CreateGroupInput) => {
    return runCommand((currentState) => prepareCreateGroupCommand(currentState, input));
  }, [runCommand]);

  const deleteGroup = useCallback((groupId: string) => {
    return runCommand((currentState) => prepareDeleteGroupCommand(currentState, groupId));
  }, [runCommand]);

  const recordPayment = useCallback((groupId: string, membershipId: string, amountCents: number) => {
    return runCommand((currentState) => prepareRecordPaymentCommand(currentState, {
      groupId,
      membershipId,
      amountCents,
    }));
  }, [runCommand]);

  const deletePayment = useCallback((paymentId: string) => {
    return runCommand((currentState) => prepareDeletePaymentCommand(currentState, paymentId));
  }, [runCommand]);

  const editPayment = useCallback((paymentId: string, input: EditPaymentInput) => {
    return runCommand((currentState) => prepareEditPaymentCommand(currentState, paymentId, input));
  }, [runCommand]);

  const view = useMemo(() => buildGroupCollectionView(state), [state]);

  const getGroupView = useCallback((groupId: string | undefined) => {
    return selectGroupView(stateRef.current, groupId);
  }, []);

  const value = useMemo(
    () => ({
      groupCollectionProjection: view.groupCollectionProjection,
      activityLogProjection: view.activityLogProjection,
      isHydrating: view.isHydrating,
      syncStatus: view.syncStatus,
      issues: view.issues,
      getGroupView,
      createGroup,
      deleteGroup,
      recordPayment,
      deletePayment,
      editPayment,
    }),
    [
      view.groupCollectionProjection,
      view.activityLogProjection,
      view.isHydrating,
      view.syncStatus,
      view.issues,
      getGroupView,
      createGroup,
      deleteGroup,
      recordPayment,
      deletePayment,
      editPayment,
    ],
  );

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
}

export function useGroupCollection(): GroupContextValue {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroupCollection must be used inside GroupProvider');
  }
  return context;
}
