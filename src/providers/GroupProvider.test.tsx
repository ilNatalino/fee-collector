import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { describe, expect, it } from 'vitest';

import { GroupCommandResult } from '../modules/groupCollection';
import { createInMemoryGroupCollectionAdapter } from '../storage/groupCollectionStorage';

import { GroupContextValue, GroupProvider, useGroupCollection } from './GroupProvider';

describe('GroupProvider', () => {
  it('hydrates projections and records a Payment through the provider seam', async () => {
    const adapter = createInMemoryGroupCollectionAdapter(null);
    let latestValue: GroupContextValue | null = null;
    let renderer: ReactTestRenderer;

    function getLatestValue(): GroupContextValue {
      if (!latestValue) {
        throw new Error('Expected the Group collection hook to be available.');
      }

      return latestValue;
    }

    function Harness() {
      latestValue = useGroupCollection();
      return null;
    }

    await act(async () => {
      renderer = create(
        <GroupProvider adapter={adapter}>
          <Harness />
        </GroupProvider>,
      );
    });

    expect(getLatestValue().isHydrating).toBe(false);
    expect(getLatestValue().groupCollectionProjection?.totalGroupCount).toBe(4);

    let result: GroupCommandResult | undefined;

    await act(async () => {
      result = await getLatestValue().recordPayment('g4', 'v5', 5000);
    });

    expect(result?.status).toBe('accepted');
    expect(getLatestValue().getGroupView('g4').groupProjection?.collectedAmountCents).toBe(95000);

    renderer!.unmount();
  });
});