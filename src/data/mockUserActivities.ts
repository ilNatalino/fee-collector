import { UserActivity } from '../types/userActivity';

const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

export const mockUserActivities: UserActivity[] = [
  {
    id: 'act_1',
    memberName: 'Alice',
    groupName: 'Trip to Paris',
    amount: 150.0,
    date: twoHoursAgo,
  },
  {
    id: 'act_2',
    memberName: 'Bob',
    groupName: 'Dinner Party',
    amount: 45.5,
    date: oneDayAgo,
  },
  {
    id: 'act_3',
    memberName: 'Charlie',
    groupName: 'Weekend Getaway',
    amount: 80.0,
    date: twoDaysAgo,
  },
  {
    id: 'act_4',
    memberName: 'David',
    groupName: 'Rent Bill',
    amount: 500.0,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
