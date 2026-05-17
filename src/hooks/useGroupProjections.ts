import { useGroups } from './useGroups';

import {
    GroupProjection,
    ProjectionIssue,
    isInvalidGroupCollectionProjection,
    isInvalidGroupProjection,
    projectGroup,
    projectGroupCollection,
} from '../utils/groupProjection';

export function useGroupCollectionProjection() {
  const { groups } = useGroups();
  const projection = projectGroupCollection(groups);

  if (isInvalidGroupCollectionProjection(projection)) {
    return {
      groupCollectionProjection: null,
      issues: projection.issues,
    };
  }

  return {
    groupCollectionProjection: projection,
    issues: [] as ProjectionIssue[],
  };
}

export function useGroupProjection(groupId: string | undefined) {
  const { groups } = useGroups();
  const group = groups.find((candidateGroup) => candidateGroup.id === groupId);

  if (!group) {
    return {
      groupProjection: null,
      issues: [] as ProjectionIssue[],
      isMissing: Boolean(groupId),
    };
  }

  const projection = projectGroup(group);

  if (isInvalidGroupProjection(projection)) {
    return {
      groupProjection: null,
      issues: projection.issues,
      isMissing: false,
    };
  }

  return {
    groupProjection: projection,
    issues: [] as ProjectionIssue[],
    isMissing: false,
  };
}

export function useMemberQuotaProjections(groupProjection: GroupProjection | null) {
  return {
    memberQuotaProjections: groupProjection?.memberQuotaProjections ?? [],
  };
}