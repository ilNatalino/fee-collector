import { type ReactNode, useCallback, useRef } from 'react';
import { FlatList, StyleProp, View, ViewStyle } from 'react-native';

import { ListItem, type ListItemAction } from './ListItem';

type SwipeableListProps<T> = Readonly<{
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  editFeature?: boolean;
  onRequestEdit?: (item: T) => void;
  deleteFeature?: boolean;
  onRequestDelete?: (item: T) => void;
  scrollEnabled?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}>;

function ItemSeparator() {
  return <View className="h-2" />;
}

export function SwipeableList<T>({
  data,
  keyExtractor,
  renderItem,
  editFeature = false,
  onRequestEdit,
  deleteFeature = false,
  onRequestDelete,
  scrollEnabled = true,
  contentContainerStyle,
}: SwipeableListProps<T>) {
  const openSwipeableIdRef = useRef<string | null>(null);
  const closeActionsRef = useRef<Record<string, () => void>>({});

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
      data={data}
      keyExtractor={keyExtractor}
      renderItem={({ item }) => {
        const actions: ListItemAction[] = [];
        const itemId = keyExtractor(item);

        if (editFeature && onRequestEdit) {
          actions.push({
            title: 'Edit',
            icon: 'pencil',
            tone: 'primary',
            callback: () => onRequestEdit(item),
          });
        }

        if (deleteFeature && onRequestDelete) {
          actions.push({
            title: 'Delete',
            icon: 'trash',
            tone: 'danger',
            callback: () => onRequestDelete(item),
          });
        }

        const hasActions = actions.length > 0;

        return (
          <ListItem
            id={itemId}
            actions={actions}
            onRegisterCloser={hasActions ? handleRegisterCloser : undefined}
            onSwipeableWillOpen={hasActions ? handleSwipeableWillOpen : undefined}
          >
            {renderItem(item)}
          </ListItem>
        );
      }}
      contentContainerStyle={contentContainerStyle ?? { marginTop: 10, paddingBottom: 10 }}
      ItemSeparatorComponent={ItemSeparator}
      showsVerticalScrollIndicator={false}
      scrollEnabled={scrollEnabled}
    />
  );
}
