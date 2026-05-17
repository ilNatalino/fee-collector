import { Group, GroupCategory, Membership, MoneyCents } from '@/src/types/group';

export type GroupStatus = 'collecting' | 'completed';
export type DueState = 'not-applicable' | 'no-deadline' | 'upcoming' | 'overdue';
export type QuotaStatus = 'unpaid' | 'partial' | 'paid';

export type ProjectionIssueCode =
  | 'group-has-no-memberships'
  | 'invalid-group-target'
  | 'group-target-mismatch'
  | 'invalid-due-date'
  | 'invalid-quota'
  | 'invalid-payment-amount'
  | 'payment-membership-mismatch'
  | 'membership-overpaid';

export interface ProjectionIssue {
  code: ProjectionIssueCode;
  message: string;
  path: string;
}

export interface QuotaBreakdown {
  unpaidMembershipCount: number;
  partialMembershipCount: number;
  paidMembershipCount: number;
}

export interface MemberQuotaProjection {
  kind: 'member-quota-projection';
  membershipId: string;
  memberId: string;
  memberFullName: string;
  quotaAmountCents: MoneyCents;
  collectedAmountCents: MoneyCents;
  remainingAmountCents: MoneyCents;
  quotaStatus: QuotaStatus;
}

export interface InvalidMemberQuotaProjection {
  kind: 'invalid-member-quota-projection';
  membershipId: string;
  issues: ProjectionIssue[];
}

export type MemberQuotaProjectionResult = MemberQuotaProjection | InvalidMemberQuotaProjection;

export interface GroupProjection {
  kind: 'group-projection';
  groupId: string;
  groupName: string;
  groupCategory?: GroupCategory;
  groupEmoji?: string;
  createdDate: string;
  dueDate?: string;
  targetAmountCents: MoneyCents;
  membershipCount: number;
  groupStatus: GroupStatus;
  groupProgressPercentage: number;
  dueState: DueState;
  collectedAmountCents: MoneyCents;
  remainingAmountCents: MoneyCents;
  quotaBreakdown: QuotaBreakdown;
  memberQuotaProjections: MemberQuotaProjection[];
}

export interface InvalidGroupProjection {
  kind: 'invalid-group-projection';
  groupId: string;
  issues: ProjectionIssue[];
}

export type GroupProjectionResult = GroupProjection | InvalidGroupProjection;

export interface GroupCollectionProjection {
  kind: 'group-collection-projection';
  totalGroupCount: number;
  collectingGroupCount: number;
  completedGroupCount: number;
  totalCollectedAmountCents: MoneyCents;
  totalRemainingAmountCents: MoneyCents;
  quotaBreakdown: QuotaBreakdown;
  groupProjections: GroupProjection[];
}

export interface InvalidGroupCollectionProjection {
  kind: 'invalid-group-collection-projection';
  issues: ProjectionIssue[];
}

export type GroupCollectionProjectionResult = GroupCollectionProjection | InvalidGroupCollectionProjection;

type ProjectionOptions = {
  now?: Date;
};

const ZERO_QUOTA_BREAKDOWN: QuotaBreakdown = {
  unpaidMembershipCount: 0,
  partialMembershipCount: 0,
  paidMembershipCount: 0,
};

function buildIssue(code: ProjectionIssueCode, path: string, message: string): ProjectionIssue {
  return {
    code,
    path,
    message,
  };
}

function isPositiveIntegerAmount(amountCents: number): boolean {
  return Number.isInteger(amountCents) && amountCents > 0;
}

function getCollectedAmountCents(membership: Membership): MoneyCents {
  return membership.payments.reduce((sum, payment) => sum + payment.amountCents, 0);
}

function getQuotaStatus(collectedAmountCents: MoneyCents, quotaAmountCents: MoneyCents): QuotaStatus {
  if (collectedAmountCents <= 0) {
    return 'unpaid';
  }

  if (collectedAmountCents >= quotaAmountCents) {
    return 'paid';
  }

  return 'partial';
}

function buildQuotaBreakdown(memberQuotaProjections: MemberQuotaProjection[]): QuotaBreakdown {
  return memberQuotaProjections.reduce<QuotaBreakdown>((breakdown, projection) => {
    if (projection.quotaStatus === 'paid') {
      breakdown.paidMembershipCount += 1;
      return breakdown;
    }

    if (projection.quotaStatus === 'partial') {
      breakdown.partialMembershipCount += 1;
      return breakdown;
    }

    breakdown.unpaidMembershipCount += 1;
    return breakdown;
  }, {
    unpaidMembershipCount: 0,
    partialMembershipCount: 0,
    paidMembershipCount: 0,
  });
}

function toLocalCalendarDayNumber(date: Date): number {
  return date.getFullYear() * 10_000 + (date.getMonth() + 1) * 100 + date.getDate();
}

function getDueState(group: Group, groupStatus: GroupStatus, now: Date): DueState {
  if (groupStatus === 'completed') {
    return 'not-applicable';
  }

  if (!group.dueDate) {
    return 'no-deadline';
  }

  const dueDate = new Date(group.dueDate);

  return toLocalCalendarDayNumber(dueDate) < toLocalCalendarDayNumber(now) ? 'overdue' : 'upcoming';
}

function getMembershipProjectionIssues(membership: Membership): ProjectionIssue[] {
  const issues: ProjectionIssue[] = [];

  if (!isPositiveIntegerAmount(membership.quota.amountCents)) {
    issues.push(
      buildIssue(
        'invalid-quota',
        'quota.amountCents',
        'Quota amount must be a positive cent-precise integer.',
      ),
    );
  }

  membership.payments.forEach((payment, index) => {
    if (!isPositiveIntegerAmount(payment.amountCents)) {
      issues.push(
        buildIssue(
          'invalid-payment-amount',
          `payments[${index}].amountCents`,
          'Payment amount must be a positive cent-precise integer.',
        ),
      );
    }

    if (payment.membershipId !== membership.id) {
      issues.push(
        buildIssue(
          'payment-membership-mismatch',
          `payments[${index}].membershipId`,
          'Payment membershipId must match the owning membership.',
        ),
      );
    }
  });

  const collectedAmountCents = getCollectedAmountCents(membership);
  if (isPositiveIntegerAmount(membership.quota.amountCents) && collectedAmountCents > membership.quota.amountCents) {
    issues.push(
      buildIssue(
        'membership-overpaid',
        'payments',
        'Current payments cannot exceed the membership quota.',
      ),
    );
  }

  return issues;
}

function getGroupProjectionIssues(group: Group): ProjectionIssue[] {
  const issues: ProjectionIssue[] = [];

  if (group.memberships.length === 0) {
    issues.push(
      buildIssue(
        'group-has-no-memberships',
        'memberships',
        'A group must include at least one membership.',
      ),
    );
  }

  if (!isPositiveIntegerAmount(group.targetAmountCents)) {
    issues.push(
      buildIssue(
        'invalid-group-target',
        'targetAmountCents',
        'Group Target must be a positive cent-precise integer.',
      ),
    );
  }

  if (group.dueDate && Number.isNaN(Date.parse(group.dueDate))) {
    issues.push(
      buildIssue(
        'invalid-due-date',
        'dueDate',
        'Due date must be a valid ISO date string when present.',
      ),
    );
  }

  const quotaTotalCents = group.memberships.reduce((sum, membership) => sum + membership.quota.amountCents, 0);
  if (group.memberships.length > 0 && isPositiveIntegerAmount(group.targetAmountCents) && quotaTotalCents !== group.targetAmountCents) {
    issues.push(
      buildIssue(
        'group-target-mismatch',
        'targetAmountCents',
        'Group Target must equal the sum of membership quotas.',
      ),
    );
  }

  return issues;
}

export function isInvalidMemberQuotaProjection(
  projection: MemberQuotaProjectionResult,
): projection is InvalidMemberQuotaProjection {
  return projection.kind === 'invalid-member-quota-projection';
}

export function isInvalidGroupProjection(projection: GroupProjectionResult): projection is InvalidGroupProjection {
  return projection.kind === 'invalid-group-projection';
}

export function isInvalidGroupCollectionProjection(
  projection: GroupCollectionProjectionResult,
): projection is InvalidGroupCollectionProjection {
  return projection.kind === 'invalid-group-collection-projection';
}

export function projectMemberQuota(membership: Membership): MemberQuotaProjectionResult {
  const issues = getMembershipProjectionIssues(membership);

  if (issues.length > 0) {
    return {
      kind: 'invalid-member-quota-projection',
      membershipId: membership.id,
      issues,
    };
  }

  const collectedAmountCents = getCollectedAmountCents(membership);
  const remainingAmountCents = membership.quota.amountCents - collectedAmountCents;

  return {
    kind: 'member-quota-projection',
    membershipId: membership.id,
    memberId: membership.member.id,
    memberFullName: membership.member.fullName,
    quotaAmountCents: membership.quota.amountCents,
    collectedAmountCents,
    remainingAmountCents,
    quotaStatus: getQuotaStatus(collectedAmountCents, membership.quota.amountCents),
  };
}

export function projectGroup(group: Group, options: ProjectionOptions = {}): GroupProjectionResult {
  const memberQuotaProjectionResults = group.memberships.map((membership, index) => {
    const projection = projectMemberQuota(membership);

    if (!isInvalidMemberQuotaProjection(projection)) {
      return projection;
    }

    return {
      ...projection,
      issues: projection.issues.map((issue) => ({
        ...issue,
        path: `memberships[${index}].${issue.path}`,
      })),
    } satisfies InvalidMemberQuotaProjection;
  });
  const issues = [
    ...getGroupProjectionIssues(group),
    ...memberQuotaProjectionResults.flatMap((projection) =>
      isInvalidMemberQuotaProjection(projection) ? projection.issues : [],
    ),
  ];

  if (issues.length > 0) {
    return {
      kind: 'invalid-group-projection',
      groupId: group.id,
      issues,
    };
  }

  const memberQuotaProjections = memberQuotaProjectionResults.filter(
    (projection): projection is MemberQuotaProjection => !isInvalidMemberQuotaProjection(projection),
  );
  const collectedAmountCents = memberQuotaProjections.reduce(
    (sum, projection) => sum + projection.collectedAmountCents,
    0,
  );
  const remainingAmountCents = group.targetAmountCents - collectedAmountCents;
  const groupStatus: GroupStatus = remainingAmountCents === 0 ? 'completed' : 'collecting';

  return {
    kind: 'group-projection',
    groupId: group.id,
    groupName: group.name,
    groupCategory: group.category,
    groupEmoji: group.emoji,
    createdDate: group.createdDate,
    dueDate: group.dueDate,
    targetAmountCents: group.targetAmountCents,
    membershipCount: group.memberships.length,
    groupStatus,
    groupProgressPercentage: Math.min(100, Math.round((collectedAmountCents / group.targetAmountCents) * 100)),
    dueState: getDueState(group, groupStatus, options.now ?? new Date()),
    collectedAmountCents,
    remainingAmountCents,
    quotaBreakdown: buildQuotaBreakdown(memberQuotaProjections),
    memberQuotaProjections,
  };
}

export function projectGroupCollection(
  groups: Group[],
  options: ProjectionOptions = {},
): GroupCollectionProjectionResult {
  const groupProjectionResults = groups.map((group) => projectGroup(group, options));
  const invalidGroupProjections = groupProjectionResults.filter(isInvalidGroupProjection);

  if (invalidGroupProjections.length > 0) {
    return {
      kind: 'invalid-group-collection-projection',
      issues: invalidGroupProjections.flatMap((projection) =>
        projection.issues.map((issue) => ({
          ...issue,
          path: `groups.${projection.groupId}.${issue.path}`,
        })),
      ),
    };
  }

  const groupProjections = groupProjectionResults.filter(
    (projection): projection is GroupProjection => !isInvalidGroupProjection(projection),
  );
  const quotaBreakdown = groupProjections.reduce<QuotaBreakdown>(
    (current, projection) => ({
      unpaidMembershipCount: current.unpaidMembershipCount + projection.quotaBreakdown.unpaidMembershipCount,
      partialMembershipCount: current.partialMembershipCount + projection.quotaBreakdown.partialMembershipCount,
      paidMembershipCount: current.paidMembershipCount + projection.quotaBreakdown.paidMembershipCount,
    }),
    ZERO_QUOTA_BREAKDOWN,
  );

  return {
    kind: 'group-collection-projection',
    totalGroupCount: groupProjections.length,
    collectingGroupCount: groupProjections.filter((projection) => projection.groupStatus === 'collecting').length,
    completedGroupCount: groupProjections.filter((projection) => projection.groupStatus === 'completed').length,
    totalCollectedAmountCents: groupProjections.reduce(
      (sum, projection) => sum + projection.collectedAmountCents,
      0,
    ),
    totalRemainingAmountCents: groupProjections.reduce(
      (sum, projection) => sum + projection.remainingAmountCents,
      0,
    ),
    quotaBreakdown,
    groupProjections,
  };
}