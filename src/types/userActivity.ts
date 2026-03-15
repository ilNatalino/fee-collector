export interface UserActivity {
  id: string;
  memberName: string;
  groupName?: string;
  amount: number;
  date: string;
}

export type UpdateUserActivityInput = {
  memberName: string;
  amount: number;
};
