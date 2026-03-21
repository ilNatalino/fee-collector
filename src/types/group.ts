import { UserQuota } from './quota';

export type GroupCategory = 'food' | 'travel' | 'home' | 'utilities';

export interface Group {
  id: string;
  name: string;
  category?: GroupCategory;
  emoji?: string;
  createdDate: string;
  dueDate?: string;
  totalAmount: number;
  members: UserQuota[];
}

export interface GroupSummary {
  totalGroups: number;
  activeGroups: number;
  totalCollected: number;
  todayCollected: number;
  totalPendingMembers: number;
}

export interface ActivityEntry {
  id: string;
  groupId: string;
  groupName: string;
  memberName: string;
  amount: number;
  date: string;
  status: 'confirmed' | 'pending';
}

export type CreateGroupInput = {
  name: string;
  category: GroupCategory;
  emoji?: string;
  totalAmount: number;
  members: { name: string; amountDue: number }[];
};
