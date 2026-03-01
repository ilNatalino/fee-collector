export interface UserQuota {
  id: string;
  name: string;
  amountDue: number;
  hasPaid: boolean;
  insertedDate: string;
}

export interface QuotaSummary {
  totalUsers: number;
  paidUsers: number;
  unpaidUsers: number;
  totalAmount: number;
  collectedAmount: number;
  pendingAmount: number;
  progress: number;
}
