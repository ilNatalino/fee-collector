import { useCallback, useRef } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { UserQuota } from '@/src/types/quota';

import { ListRow, type ListRowAction } from './ListRow';
import { UserQuotaListItem } from './UserQuotaListItem';

type ActionListProps = Readonly<{
  quotas: UserQuota[];
  editFeature?: boolean;
  onRequestEdit?: (userQuota: UserQuota) => void;
  deleteFeature?: boolean;
  onRequestDelete?: (userQuota: UserQuota) => void;
}>;

function ItemSeparator() {
  return <View style={styles.separator} />;
}

export function ActionList({
  quotas,
  editFeature = false,
  onRequestEdit,
  deleteFeature = false,
  onRequestDelete,
}: ActionListProps) {
  const openSwipeableIdRef = useRef<string | null>(null);
  const closeActionsRef = useRef<Record<string, () => void>>({});
  const baseActions: ListRowAction[] = [];

  if (editFeature && onRequestEdit) {
    baseActions.push({
      title: 'Edit',
      icon: 'pencil',
      tone: 'primary',
      callback: onRequestEdit,
    });
  }

  if (deleteFeature && onRequestDelete) {
    baseActions.push({
      title: 'Delete',
      icon: 'trash',
      tone: 'danger',
      callback: onRequestDelete,
    });
  }
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
