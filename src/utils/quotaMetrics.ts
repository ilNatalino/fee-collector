import { QuotaSummary, UserQuota } from '@/src/types/quota';

export const getQuotaSummary = (users: UserQuota[]): QuotaSummary => {
  const totalUsers = users.length;
  const paidUsers = users.filter((user) => user.hasPaid).length;
  const unpaidUsers = totalUsers - paidUsers;

  const totalAmount = users.reduce((sum, user) => sum + user.amountDue, 0);
  const collectedAmount = users
    .filter((user) => user.hasPaid)
    .reduce((sum, user) => sum + user.amountDue, 0);
  const pendingAmount = totalAmount - collectedAmount;

  const progress = totalUsers === 0 ? 0 : Math.round((paidUsers / totalUsers) * 100);

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
