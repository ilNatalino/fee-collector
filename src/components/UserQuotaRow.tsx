import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps, type ComponentType, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { useTheme } from '@/src/hooks/useTheme';
import { UserQuota } from '@/src/types/quota';

import { type UserQuotaListItemProps } from './UserQuotaListItem';

export type ListRowAction = {
  title: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  callback: (userQuota: UserQuota) => void;
};

type ListRowProps = Readonly<{
  userQuota: UserQuota;
  ItemComponent: ComponentType<UserQuotaListItemProps>;
  actions?: ListRowAction[];
  onRegisterCloser?: (quotaId: string, close: (() => void) | null) => void;
  onSwipeableWillOpen?: (quotaId: string) => void;
}>;

type SwipeableRefMethods = {
  close: () => void;
  openLeft: () => void;
  openRight: () => void;
  reset: () => void;
};

export function ListRow({
  userQuota,
  ItemComponent,
  actions = [],
  onRegisterCloser,
  onSwipeableWillOpen,
}: ListRowProps) {
  const { colors } = useTheme();
  const swipeableRef = useRef<SwipeableRefMethods | null>(null);
  const formattedAmount = `${userQuota.amountDue.toFixed(2)}€`;
  const insertedDate = new Date(userQuota.insertedDate).toLocaleDateString();
  const canSwipe = actions.length > 0;

  useEffect(() => {
    if (!canSwipe || !onRegisterCloser) {
      return;
    }

    onRegisterCloser(userQuota.id, () => {
      swipeableRef.current?.close();
    });

    return () => {
      onRegisterCloser(userQuota.id, null);
    };
  }, [canSwipe, onRegisterCloser, userQuota.id]);

  const renderRightActions = () => (
    <View style={styles.actionsContainer}>
      {actions.map((action, index) => (
        <Pressable
          key={`${action.title}-${index}`}
          onPress={() => {
            swipeableRef.current?.close();
            action.callback(userQuota);
          }}
          style={[styles.deleteAction, { backgroundColor: colors.danger }]}
          accessibilityRole="button"
          accessibilityLabel={`${action.title} ${userQuota.name}`}>
          <Ionicons name={action.icon} size={18} color="#ffffff" />
          {/* <Text style={styles.deleteActionLabel}>{action.title}</Text> */}
        </Pressable>
      ))}
    </View>
  );

  const rowContent = <ItemComponent name={userQuota.name} insertedDate={insertedDate} amount={formattedAmount} />;

  if (!canSwipe) {
    return rowContent;
  }

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      overshootRight={false}
      renderRightActions={renderRightActions}
      onSwipeableWillOpen={() => onSwipeableWillOpen?.(userQuota.id)}>
      {rowContent}
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
  },
  deleteAction: {
    minWidth: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    marginLeft: 8,
  },
  deleteActionLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
