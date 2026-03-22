import { Group } from '@/src/types/group';
import { QuotaSummary, UserQuota } from '@/src/types/quota';

export const getGroupProgress = (group: Group) => {
  const totalMembers = group.members.length;
  const paidMembers = group.members.filter((m) => m.hasPaid).length;
  const unpaidMembers = totalMembers - paidMembers;
  const collectedAmount = group.members
    .reduce((sum, m) => sum + (m.amountPaid ?? (m.hasPaid ? m.amountDue : 0)), 0);
  const remainingAmount = group.totalAmount - collectedAmount;
  const progress = group.totalAmount === 0 ? 0 : Math.min(100, Math.round((collectedAmount / group.totalAmount) * 100));

  return {
    totalMembers,
    paidMembers,
    unpaidMembers,
    collectedAmount,
    remainingAmount,
    progress,
  };
};

export const getGroupsSummary = (groups: Group[]) => {
  const totalGroups = groups.length;
  const activeGroups = groups.filter((g) => {
    const progress = getGroupProgress(g);
    return progress.progress < 100;
  }).length;

  const totalCollected = groups.reduce((sum, g) => {
    const progress = getGroupProgress(g);
    return sum + progress.collectedAmount;
  }, 0);

  const totalPendingMembers = groups.reduce((sum, g) => {
    const progress = getGroupProgress(g);
    return sum + progress.unpaidMembers;
  }, 0);

  return {
    totalGroups,
    activeGroups,
    totalCollected,
    todayCollected: 75,
    totalPendingMembers,
  };
};

export const getQuotaSummary = (users: UserQuota[]): QuotaSummary => {
  const totalUsers = users.length;
  const paidUsers = users.filter((user) => user.hasPaid).length;
  const unpaidUsers = totalUsers - paidUsers;

  const totalAmount = users.reduce((sum, user) => sum + user.amountDue, 0);
  const collectedAmount = users
    .reduce((sum, user) => sum + (user.amountPaid ?? (user.hasPaid ? user.amountDue : 0)), 0);
  const pendingAmount = totalAmount - collectedAmount;

  const progress = totalAmount === 0 ? 0 : Math.min(100, Math.round((collectedAmount / totalAmount) * 100));

  return {
    totalUsers,
    paidUsers,
    unpaidUsers,
    totalAmount,
    collectedAmount,
    pendingAmount,
    progress,
  };
};
