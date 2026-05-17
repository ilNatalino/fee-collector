import { useGroups } from './useGroups';

import { projectActivityLog } from '../utils/activityLog';

export function useActivityLogProjection() {
  const { groups } = useGroups();

  return {
    activityLogProjection: projectActivityLog(groups),
    isLoading: false,
  };
}