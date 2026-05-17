import { describe, expect, it } from 'vitest';

import { mockGroups } from '../data/mockGroups';
import { createInMemoryGroupCollectionAdapter } from '../storage/groupCollectionStorage';

import {
  buildGroupCollectionView,
  GroupCollectionAdapter,
  hydrateGroupCollectionState,
  prepareCreateGroupCommand,
  prepareRecordPaymentCommand,
  settlePreparedGroupCommand,
} from './groupCollection';

async function hydrateSeedState() {
  return hydrateGroupCollectionState(createInMemoryGroupCollectionAdapter(null), mockGroups);
}

describe('group collection module', () => {
  it('hydrates seed Groups when the adapter is empty', async () => {
    const state = await hydrateSeedState();
    const view = buildGroupCollectionView(state);

    expect(state.isHydrating).toBe(false);
    expect(view.groupCollectionProjection?.totalGroupCount).toBe(mockGroups.length);
    expect(view.activityLogProjection?.payments.length).toBeGreaterThan(0);
  });

  it('quarantines invalid persisted Groups and keeps valid projections available', async () => {
    const state = await hydrateGroupCollectionState(
      createInMemoryGroupCollectionAdapter([
        {
          ...mockGroups[0],
          memberships: [],
        },
        mockGroups[1],
      ]),
      mockGroups,
    );
    const view = buildGroupCollectionView(state);

    expect(state.issues.map((issue) => issue.code)).toContain('group-has-no-memberships');
    expect(view.groupCollectionProjection?.groupProjections.map((group) => group.groupId)).toEqual(['g2']);
  });

  it('rejects invalid Group creation with explicit domain issues', async () => {
    const state = await hydrateSeedState();
    const preparation = prepareCreateGroupCommand(state, {
      name: ' ',
      targetAmountCents: 1000,
      memberships: [],
    });

    expect(preparation.kind).toBe('rejected-group-command');

    if (preparation.kind !== 'rejected-group-command') {
      throw new Error('Expected command rejection.');
    }

    expect(preparation.result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['invalid-group-name', 'group-has-no-memberships']),
    );
  });

  it('rolls back an optimistic Payment update when persistence fails', async () => {
    const state = await hydrateSeedState();
    const preparation = prepareRecordPaymentCommand(state, {
      groupId: 'g4',
      membershipId: 'v5',
      amountCents: 5000,
    });
    const failingAdapter: GroupCollectionAdapter = {
      async load() {
        return null;
      },
      async save() {
        throw new Error('save failed');
      },
    };

    expect(preparation.kind).toBe('prepared-group-command');

    if (preparation.kind !== 'prepared-group-command') {
      throw new Error('Expected optimistic command preparation.');
    }

    expect(preparation.optimisticState.syncStatus).toBe('syncing');

    const settlement = await settlePreparedGroupCommand(failingAdapter, preparation);

    expect(settlement.result.status).toBe('rolled-back');
    expect(settlement.state.syncStatus).toBe('error');
    expect(settlement.state.groups).toEqual(state.groups);
    expect(settlement.result.issues.map((issue) => issue.code)).toContain('persistence-save-failed');
  });
});