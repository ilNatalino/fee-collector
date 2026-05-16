import { getUserActivitiesFromGroups } from '../utils/groupPayments';
import { useGroups } from './useGroups';

export function useUserActivities() {
  const { groups } = useGroups();

  return {
    activities: getUserActivitiesFromGroups(groups),
    isLoading: false,
  };
}
