export type GroupCategory = 'food' | 'travel' | 'home' | 'utilities';

export type MoneyCents = number;

export interface Member {
  id: string;
  fullName: string;
  createdAt: string;
}

export interface Quota {
  amountCents: MoneyCents;
}

export interface Payment {
  id: string;
  membershipId: string;
  amountCents: MoneyCents;
  recordedAt: string;
  recordedMemberName: string;
  recordedGroupName: string;
}

export interface Membership {
  id: string;
  member: Member;
  joinedAt: string;
  quota: Quota;
  payments: Payment[];
}

export interface Group {
  id: string;
  name: string;
  category?: GroupCategory;
  emoji?: string;
  createdDate: string;
  dueDate?: string;
  targetAmountCents: MoneyCents;
  memberships: Membership[];
}

export type CreateGroupInput = {
  name: string;
  category?: GroupCategory;
  emoji?: string;
  targetAmountCents: MoneyCents;
  memberships: {
    memberName: string;
    quotaAmountCents: MoneyCents;
  }[];
};
