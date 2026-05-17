import { ActivityLogProjection, projectActivityLog } from '@/src/utils/activityLog';
import {
  createGroupInGroups,
  deletePaymentInGroups,
  editPaymentInGroups,
  EditPaymentInput,
  recordPaymentInGroups,
  RecordPaymentInput,
} from '@/src/utils/groupCommands';
import {
  GroupCollectionProjection,
  GroupProjection,
  isInvalidGroupCollectionProjection,
  isInvalidGroupProjection,
  isInvalidMemberQuotaProjection,
  projectGroup,
  projectGroupCollection,
  projectMemberQuota,
  ProjectionIssue,
  ProjectionIssueCode,
} from '@/src/utils/groupProjection';
import { CreateGroupInput, Group, GroupCategory, Membership } from '@/src/types/group';

const GROUP_CATEGORIES: readonly GroupCategory[] = ['food', 'travel', 'home', 'utilities'];

export interface GroupCollectionAdapter {
  load(): Promise<unknown>;
  save(groups: Group[]): Promise<void>;
}

export type GroupCollectionIssueCategory = 'domain' | 'hydration' | 'persistence';

export type GroupCollectionIssueCode =
  | ProjectionIssueCode
  | 'module-hydrating'
  | 'invalid-group-name'
  | 'invalid-group-category'
  | 'invalid-membership-member-name'
  | 'duplicate-member-name'
  | 'group-not-found'
  | 'membership-not-found'
  | 'payment-not-found'
  | 'payment-exceeds-remaining-quota'
  | 'payment-exceeds-editable-amount'
  | 'command-rejected'
  | 'invalid-persisted-group'
  | 'persistence-load-failed'
  | 'persistence-save-failed';

export interface GroupCollectionIssue {
  category: GroupCollectionIssueCategory;
  code: GroupCollectionIssueCode;
  message: string;
  path?: string;
  groupId?: string;
}

export type GroupCollectionSyncStatus = 'idle' | 'syncing' | 'error';

export interface GroupCollectionState {
  groups: Group[];
  isHydrating: boolean;
  syncStatus: GroupCollectionSyncStatus;
  issues: GroupCollectionIssue[];
}

export interface GroupCollectionView {
  groupCollectionProjection: GroupCollectionProjection | null;
  activityLogProjection: ActivityLogProjection | null;
  isHydrating: boolean;
  syncStatus: GroupCollectionSyncStatus;
  issues: GroupCollectionIssue[];
}

export interface SelectedGroupView {
  groupProjection: GroupProjection | null;
  issues: GroupCollectionIssue[];
  isMissing: boolean;
}

export type GroupCommandStatus = 'accepted' | 'rejected' | 'rolled-back';

export interface GroupCommandResult {
  status: GroupCommandStatus;
  issues: GroupCollectionIssue[];
}

export interface PreparedGroupCommand {
  kind: 'prepared-group-command';
  nextGroups: Group[];
  optimisticState: GroupCollectionState;
  rollbackState: GroupCollectionState;
}

export interface RejectedGroupCommand {
  kind: 'rejected-group-command';
  result: GroupCommandResult;
}

export type GroupCommandPreparation = PreparedGroupCommand | RejectedGroupCommand;

export interface SettledGroupCommand {
  state: GroupCollectionState;
  result: GroupCommandResult;
}

export function createInitialGroupCollectionState(): GroupCollectionState {
  return {
    groups: [],
    isHydrating: true,
    syncStatus: 'idle',
    issues: [],
  };
}

export async function hydrateGroupCollectionState(
  adapter: GroupCollectionAdapter,
  seedGroups: Group[],
): Promise<GroupCollectionState> {
  try {
    const loadedGroups = await adapter.load();

    if (loadedGroups === null) {
      return {
        groups: seedGroups,
        isHydrating: false,
        syncStatus: 'idle',
        issues: [],
      };
    }

    const hydration = hydratePersistedGroups(loadedGroups);

    return {
      groups: hydration.groups,
      isHydrating: false,
      syncStatus: 'idle',
      issues: hydration.issues,
    };
  } catch (error) {
    return {
      groups: [],
      isHydrating: false,
      syncStatus: 'error',
      issues: [
        buildIssue(
          'persistence',
          'persistence-load-failed',
          getErrorMessage(error, 'Could not load the persisted Group collection.'),
        ),
      ],
    };
  }
}

export function buildGroupCollectionView(state: GroupCollectionState): GroupCollectionView {
  if (state.isHydrating) {
    return {
      groupCollectionProjection: null,
      activityLogProjection: null,
      isHydrating: true,
      syncStatus: state.syncStatus,
      issues: state.issues,
    };
  }

  const projection = projectGroupCollection(state.groups);

  if (isInvalidGroupCollectionProjection(projection)) {
    return {
      groupCollectionProjection: null,
      activityLogProjection: null,
      isHydrating: false,
      syncStatus: state.syncStatus,
      issues: [...state.issues, ...mapProjectionIssues(projection.issues, 'domain')],
    };
  }

  return {
    groupCollectionProjection: projection,
    activityLogProjection: projectActivityLog(state.groups),
    isHydrating: false,
    syncStatus: state.syncStatus,
    issues: state.issues,
  };
}

export function selectGroupView(state: GroupCollectionState, groupId: string | undefined): SelectedGroupView {
  if (!groupId) {
    return {
      groupProjection: null,
      issues: [],
      isMissing: false,
    };
  }

  if (state.isHydrating) {
    return {
      groupProjection: null,
      issues: [buildIssue('hydration', 'module-hydrating', 'The Group collection is still hydrating.')],
      isMissing: false,
    };
  }

  const group = state.groups.find((candidateGroup) => candidateGroup.id === groupId);

  if (!group) {
    return {
      groupProjection: null,
      issues: state.issues.filter((issue) => issue.groupId === groupId),
      isMissing: true,
    };
  }

  const projection = projectGroup(group);

  if (isInvalidGroupProjection(projection)) {
    return {
      groupProjection: null,
      issues: mapProjectionIssues(projection.issues, 'domain', groupId),
      isMissing: false,
    };
  }

  return {
    groupProjection: projection,
    issues: [],
    isMissing: false,
  };
}

export function prepareCreateGroupCommand(
  state: GroupCollectionState,
  input: CreateGroupInput,
): GroupCommandPreparation {
  const hydrationRejection = rejectWhileHydrating(state);

  if (hydrationRejection) {
    return hydrationRejection;
  }

  const issues = validateCreateGroupInput(input);

  if (issues.length > 0) {
    return rejectCommand(issues);
  }

  const nextGroups = createGroupInGroups(state.groups, input);

  if (nextGroups === state.groups) {
    return rejectCommand([
      buildIssue('domain', 'command-rejected', 'The Group could not be created.'),
    ]);
  }

  return acceptCommand(state, nextGroups);
}

export function prepareDeleteGroupCommand(
  state: GroupCollectionState,
  groupId: string,
): GroupCommandPreparation {
  const hydrationRejection = rejectWhileHydrating(state);

  if (hydrationRejection) {
    return hydrationRejection;
  }

  if (!state.groups.some((group) => group.id === groupId)) {
    return rejectCommand([
      buildIssue('domain', 'group-not-found', 'The requested Group does not exist.', 'groupId', groupId),
    ]);
  }

  return acceptCommand(
    state,
    state.groups.filter((group) => group.id !== groupId),
  );
}

export function prepareRecordPaymentCommand(
  state: GroupCollectionState,
  input: RecordPaymentInput,
): GroupCommandPreparation {
  const hydrationRejection = rejectWhileHydrating(state);

  if (hydrationRejection) {
    return hydrationRejection;
  }

  const issues = validateRecordPaymentInput(state.groups, input);

  if (issues.length > 0) {
    return rejectCommand(issues);
  }

  const nextGroups = recordPaymentInGroups(state.groups, input);

  if (nextGroups === state.groups) {
    return rejectCommand([
      buildIssue('domain', 'command-rejected', 'The Payment could not be recorded.'),
    ]);
  }

  return acceptCommand(state, nextGroups);
}

export function prepareDeletePaymentCommand(
  state: GroupCollectionState,
  paymentId: string,
): GroupCommandPreparation {
  const hydrationRejection = rejectWhileHydrating(state);

  if (hydrationRejection) {
    return hydrationRejection;
  }

  if (!findPaymentOwner(state.groups, paymentId)) {
    return rejectCommand([
      buildIssue('domain', 'payment-not-found', 'The requested Payment does not exist.', 'paymentId'),
    ]);
  }

  const nextGroups = deletePaymentInGroups(state.groups, paymentId);

  if (nextGroups === state.groups) {
    return rejectCommand([
      buildIssue('domain', 'command-rejected', 'The Payment could not be deleted.'),
    ]);
  }

  return acceptCommand(state, nextGroups);
}

export function prepareEditPaymentCommand(
  state: GroupCollectionState,
  paymentId: string,
  input: EditPaymentInput,
): GroupCommandPreparation {
  const hydrationRejection = rejectWhileHydrating(state);

  if (hydrationRejection) {
    return hydrationRejection;
  }

  const issues = validateEditPaymentInput(state.groups, paymentId, input);

  if (issues.length > 0) {
    return rejectCommand(issues);
  }

  const nextGroups = editPaymentInGroups(state.groups, paymentId, input);

  if (nextGroups === state.groups) {
    return rejectCommand([
      buildIssue('domain', 'command-rejected', 'The Payment could not be edited.'),
    ]);
  }

  return acceptCommand(state, nextGroups);
}

export async function settlePreparedGroupCommand(
  adapter: GroupCollectionAdapter,
  command: PreparedGroupCommand,
): Promise<SettledGroupCommand> {
  try {
    await adapter.save(command.nextGroups);

    return {
      state: {
        ...command.optimisticState,
        syncStatus: 'idle',
        issues: removeIssuesByCode(command.optimisticState.issues, ['persistence-save-failed']),
      },
      result: {
        status: 'accepted',
        issues: [],
      },
    };
  } catch (error) {
    const issue = buildIssue(
      'persistence',
      'persistence-save-failed',
      getErrorMessage(error, 'Could not persist the latest Group changes.'),
    );

    return {
      state: {
        ...command.rollbackState,
        syncStatus: 'error',
        issues: [...removeIssuesByCode(command.rollbackState.issues, ['persistence-save-failed']), issue],
      },
      result: {
        status: 'rolled-back',
        issues: [issue],
      },
    };
  }
}

function acceptCommand(state: GroupCollectionState, nextGroups: Group[]): PreparedGroupCommand {
  return {
    kind: 'prepared-group-command',
    nextGroups,
    optimisticState: {
      groups: nextGroups,
      isHydrating: false,
      syncStatus: 'syncing',
      issues: removeIssuesByCode(state.issues, ['persistence-save-failed']),
    },
    rollbackState: state,
  };
}

function rejectWhileHydrating(state: GroupCollectionState): RejectedGroupCommand | null {
  if (!state.isHydrating) {
    return null;
  }

  return rejectCommand([
    buildIssue('hydration', 'module-hydrating', 'The Group collection is still hydrating.'),
  ]);
}

function rejectCommand(issues: GroupCollectionIssue[]): RejectedGroupCommand {
  return {
    kind: 'rejected-group-command',
    result: {
      status: 'rejected',
      issues,
    },
  };
}

function hydratePersistedGroups(candidate: unknown): Pick<GroupCollectionState, 'groups' | 'issues'> {
  if (!Array.isArray(candidate)) {
    return {
      groups: [],
      issues: [
        buildIssue(
          'hydration',
          'invalid-persisted-group',
          'Persisted Group data must be an array of Groups.',
          'groups',
        ),
      ],
    };
  }

  return candidate.reduce<Pick<GroupCollectionState, 'groups' | 'issues'>>((current, groupCandidate, index) => {
    const validation = validatePersistedGroup(groupCandidate, index);

    if (validation.group) {
      current.groups.push(validation.group);
    }

    current.issues.push(...validation.issues);
    return current;
  }, {
    groups: [],
    issues: [],
  });
}

function validatePersistedGroup(candidate: unknown, index: number): { group?: Group; issues: GroupCollectionIssue[] } {
  if (!candidate || typeof candidate !== 'object') {
    return {
      issues: [
        buildIssue(
          'hydration',
          'invalid-persisted-group',
          'A persisted Group entry is not an object.',
          `groups[${index}]`,
        ),
      ],
    };
  }

  const group = candidate as Group;
  const groupId = typeof group.id === 'string' ? group.id : undefined;

  try {
    const projection = projectGroup(group);

    if (isInvalidGroupProjection(projection)) {
      return {
        issues: mapProjectionIssues(
          projection.issues.map((issue) => ({
            ...issue,
            path: `groups[${index}].${issue.path}`,
          })),
          'hydration',
          groupId,
        ),
      };
    }

    return {
      group,
      issues: [],
    };
  } catch {
    return {
      issues: [
        buildIssue(
          'hydration',
          'invalid-persisted-group',
          'A persisted Group entry could not be hydrated.',
          `groups[${index}]`,
          groupId,
        ),
      ],
    };
  }
}

function validateCreateGroupInput(input: CreateGroupInput): GroupCollectionIssue[] {
  const issues: GroupCollectionIssue[] = [];
  const groupName = input.name.trim();
  const normalizedMemberships = input.memberships.map((membership) => ({
    memberName: membership.memberName.trim(),
    quotaAmountCents: membership.quotaAmountCents,
  }));

  if (!groupName) {
    issues.push(buildIssue('domain', 'invalid-group-name', 'Group name is required.', 'name'));
  }

  if (!isPositiveIntegerAmount(input.targetAmountCents)) {
    issues.push(buildIssue('domain', 'invalid-group-target', 'Group Target must be a positive cent-precise integer.', 'targetAmountCents'));
  }

  if (input.category !== undefined && !GROUP_CATEGORIES.includes(input.category)) {
    issues.push(buildIssue('domain', 'invalid-group-category', 'Group Category must be one of the supported values.', 'category'));
  }

  if (normalizedMemberships.length === 0) {
    issues.push(buildIssue('domain', 'group-has-no-memberships', 'A Group must include at least one Membership.', 'memberships'));
  }

  normalizedMemberships.forEach((membership, index) => {
    if (!membership.memberName) {
      issues.push(
        buildIssue(
          'domain',
          'invalid-membership-member-name',
          'Membership member name is required.',
          `memberships[${index}].memberName`,
        ),
      );
    }

    if (!isPositiveIntegerAmount(membership.quotaAmountCents)) {
      issues.push(
        buildIssue(
          'domain',
          'invalid-quota',
          'Quota amount must be a positive cent-precise integer.',
          `memberships[${index}].quotaAmountCents`,
        ),
      );
    }
  });

  const memberNames = normalizedMemberships.map((membership) => membership.memberName).filter(Boolean);
  if (new Set(memberNames).size !== memberNames.length) {
    issues.push(
      buildIssue(
        'domain',
        'duplicate-member-name',
        'Each Member can appear only once in a Group.',
        'memberships',
      ),
    );
  }

  const hasOnlyValidQuotas = normalizedMemberships.every((membership) => isPositiveIntegerAmount(membership.quotaAmountCents));
  const totalQuotaAmountCents = normalizedMemberships.reduce(
    (sum, membership) => sum + (Number.isInteger(membership.quotaAmountCents) ? membership.quotaAmountCents : 0),
    0,
  );

  if (hasOnlyValidQuotas && isPositiveIntegerAmount(input.targetAmountCents) && totalQuotaAmountCents !== input.targetAmountCents) {
    issues.push(
      buildIssue(
        'domain',
        'group-target-mismatch',
        'Group Target must equal the sum of Membership quotas.',
        'targetAmountCents',
      ),
    );
  }

  return issues;
}

function validateRecordPaymentInput(groups: Group[], input: RecordPaymentInput): GroupCollectionIssue[] {
  const issues: GroupCollectionIssue[] = [];

  if (!isPositiveIntegerAmount(input.amountCents)) {
    issues.push(buildIssue('domain', 'invalid-payment-amount', 'Payment amount must be a positive cent-precise integer.', 'amountCents', input.groupId));
    return issues;
  }

  const locatedMembership = findMembership(groups, input.groupId, input.membershipId);

  if (!locatedMembership) {
    issues.push(
      findGroup(groups, input.groupId)
        ? buildIssue('domain', 'membership-not-found', 'The requested Membership does not exist.', 'membershipId', input.groupId)
        : buildIssue('domain', 'group-not-found', 'The requested Group does not exist.', 'groupId', input.groupId),
    );
    return issues;
  }

  const memberQuotaProjection = projectMemberQuota(locatedMembership.membership);

  if (isInvalidMemberQuotaProjection(memberQuotaProjection)) {
    return mapProjectionIssues(memberQuotaProjection.issues, 'domain', input.groupId);
  }

  if (input.amountCents > memberQuotaProjection.remainingAmountCents) {
    issues.push(
      buildIssue(
        'domain',
        'payment-exceeds-remaining-quota',
        'Payment amount cannot exceed the remaining Quota.',
        'amountCents',
        input.groupId,
      ),
    );
  }

  return issues;
}

function validateEditPaymentInput(
  groups: Group[],
  paymentId: string,
  input: EditPaymentInput,
): GroupCollectionIssue[] {
  if (!isPositiveIntegerAmount(input.amountCents)) {
    return [
      buildIssue('domain', 'invalid-payment-amount', 'Payment amount must be a positive cent-precise integer.', 'amountCents'),
    ];
  }

  const paymentOwner = findPaymentOwner(groups, paymentId);

  if (!paymentOwner) {
    return [
      buildIssue('domain', 'payment-not-found', 'The requested Payment does not exist.', 'paymentId'),
    ];
  }

  const memberQuotaProjection = projectMemberQuota(paymentOwner.membership);

  if (isInvalidMemberQuotaProjection(memberQuotaProjection)) {
    return mapProjectionIssues(memberQuotaProjection.issues, 'domain', paymentOwner.group.id);
  }

  const maxEditableAmountCents = memberQuotaProjection.remainingAmountCents + paymentOwner.payment.amountCents;

  if (input.amountCents > maxEditableAmountCents) {
    return [
      buildIssue(
        'domain',
        'payment-exceeds-editable-amount',
        'Payment amount cannot exceed the editable amount for this Membership.',
        'amountCents',
        paymentOwner.group.id,
      ),
    ];
  }

  return [];
}

function findGroup(groups: Group[], groupId: string): Group | undefined {
  return groups.find((group) => group.id === groupId);
}

function findMembership(
  groups: Group[],
  groupId: string,
  membershipId: string,
): { group: Group; membership: Membership } | undefined {
  const group = findGroup(groups, groupId);
  const membership = group?.memberships.find((candidateMembership) => candidateMembership.id === membershipId);

  if (!group || !membership) {
    return undefined;
  }

  return {
    group,
    membership,
  };
}

function findPaymentOwner(
  groups: Group[],
  paymentId: string,
): { group: Group; membership: Membership; payment: Membership['payments'][number] } | undefined {
  for (const group of groups) {
    for (const membership of group.memberships) {
      const payment = membership.payments.find((candidatePayment) => candidatePayment.id === paymentId);

      if (payment) {
        return {
          group,
          membership,
          payment,
        };
      }
    }
  }

  return undefined;
}

function mapProjectionIssues(
  issues: ProjectionIssue[],
  category: GroupCollectionIssueCategory,
  groupId?: string,
): GroupCollectionIssue[] {
  return issues.map((issue) => ({
    category,
    code: issue.code,
    message: issue.message,
    path: issue.path,
    groupId,
  }));
}

function buildIssue(
  category: GroupCollectionIssueCategory,
  code: GroupCollectionIssueCode,
  message: string,
  path?: string,
  groupId?: string,
): GroupCollectionIssue {
  return {
    category,
    code,
    message,
    path,
    groupId,
  };
}

function isPositiveIntegerAmount(amountCents: number): boolean {
  return Number.isInteger(amountCents) && amountCents > 0;
}

function removeIssuesByCode(
  issues: GroupCollectionIssue[],
  codes: GroupCollectionIssueCode[],
): GroupCollectionIssue[] {
  return issues.filter((issue) => !codes.includes(issue.code));
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}