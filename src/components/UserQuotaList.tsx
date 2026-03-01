import { useCallback, useRef } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { UserQuota } from '@/src/types/quota';

import { UserQuotaListItem } from './UserQuotaListItem';
import { ListRow, type ListRowAction } from './UserQuotaRow';

type ActionListProps = Readonly<{
  quotas: UserQuota[];
  deleteFeature?: boolean;
  onRequestDelete?: (userQuota: UserQuota) => void;
}>;

function ItemSeparator() {
  return <View style={styles.separator} />;
}

export function ActionList({ quotas, deleteFeature = false, onRequestDelete }: ActionListProps) {
  const openSwipeableIdRef = useRef<string | null>(null);
  const closeActionsRef = useRef<Record<string, () => void>>({});
  const baseActions: ListRowAction[] =
    deleteFeature && onRequestDelete
      ? [
          {
            title: 'Delete',
            icon: 'trash',
            callback: onRequestDelete,
          },
        ]
      : [];
  const hasActions = baseActions.length > 0;

  const handleRegisterCloser = useCallback((quotaId: string, close: (() => void) | null) => {
    if (!close) {
      delete closeActionsRef.current[quotaId];
      if (openSwipeableIdRef.current === quotaId) {
        openSwipeableIdRef.current = null;
      }
      return;
    }

    closeActionsRef.current[quotaId] = close;
  }, []);

  const handleSwipeableWillOpen = useCallback((quotaId: string) => {
    const previousOpenId = openSwipeableIdRef.current;
    if (previousOpenId && previousOpenId !== quotaId) {
      closeActionsRef.current[previousOpenId]?.();
    }
    openSwipeableIdRef.current = quotaId;
  }, []);

  return (
    <FlatList
      data={quotas}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ListRow
          userQuota={item}
          ItemComponent={UserQuotaListItem}
          actions={baseActions}
          onRegisterCloser={hasActions ? handleRegisterCloser : undefined}
          onSwipeableWillOpen={hasActions ? handleSwipeableWillOpen : undefined}
        />
      )}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={ItemSeparator}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    marginTop: 10,
    paddingBottom: 10,
  },
  separator: {
    height: 8,
  },
});
