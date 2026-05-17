import AsyncStorage from '@react-native-async-storage/async-storage';

import { GroupCollectionAdapter } from '@/src/modules/groupCollection';
import { Group } from '@/src/types/group';

const GROUP_COLLECTION_STORAGE_KEY = 'fantamoney_group_collection';

type StorageLike = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

export function createAsyncStorageGroupCollectionAdapter(
  storage: StorageLike = AsyncStorage,
): GroupCollectionAdapter {
  return {
    async load() {
      const value = await storage.getItem(GROUP_COLLECTION_STORAGE_KEY);

      if (value === null) {
        return null;
      }

      return JSON.parse(value) as unknown;
    },
    async save(groups: Group[]) {
      await storage.setItem(GROUP_COLLECTION_STORAGE_KEY, JSON.stringify(groups));
    },
  };
}

export function createInMemoryGroupCollectionAdapter(
  initialValue: unknown = null,
): GroupCollectionAdapter & { snapshot: () => unknown } {
  let currentValue = initialValue;

  return {
    async load() {
      return currentValue;
    },
    async save(groups: Group[]) {
      currentValue = JSON.parse(JSON.stringify(groups)) as Group[];
    },
    snapshot() {
      return currentValue;
    },
  };
}