import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => undefined),
  },
}));

import { GroupCommandResult } from '../modules/groupCollection';
import { createInMemoryGroupCollectionAdapter } from '../storage/groupCollectionStorage';

import { GroupContextValue, GroupProvider, useGroupCollection } from './GroupProvider';

describe('GroupProvider', () => {
  const getItemMock = vi.mocked(AsyncStorage.getItem);
  const setItemMock = vi.mocked(AsyncStorage.setItem);

  beforeEach(() => {
    getItemMock.mockReset();
    getItemMock.mockResolvedValue(null);
    setItemMock.mockReset();
    setItemMock.mockResolvedValue(undefined);
  });

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
    expect(getLatestValue().getMembershipActivityView('g4', 'v3').payments.map((payment) => payment.paymentId)).toEqual(['p-g4-v3']);

    let result: GroupCommandResult | undefined;

    await act(async () => {
      result = await getLatestValue().recordPayment('g4', 'v5', 5000);
    });

    expect(result?.status).toBe('accepted');
    expect(getLatestValue().getGroupView('g4').groupProjection?.collectedAmountCents).toBe(95000);

    renderer!.unmount();
  });

  it('hydrates once with the default adapter across provider rerenders', async () => {
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
        <GroupProvider>
          <Harness />
        </GroupProvider>,
      );
    });

    expect(getLatestValue().isHydrating).toBe(false);
    expect(getLatestValue().groupCollectionProjection?.totalGroupCount).toBe(4);
    expect(getItemMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      await getLatestValue().createGroup({
        name: 'Gym',
        targetAmountCents: 10000,
        memberships: [
          {
            memberName: 'Alice',
            quotaAmountCents: 10000,
          },
        ],
      });
    });

    expect(getItemMock).toHaveBeenCalledTimes(1);

    renderer!.unmount();
  });
});