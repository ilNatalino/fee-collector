import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps, type ReactNode, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { useTheme } from '@/src/hooks/useTheme';

export type ListItemAction = {
  title: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  tone?: 'danger' | 'primary';
  callback: () => void;
};

type ListItemProps = Readonly<{
  id: string;
  children: ReactNode;
  actions?: ListItemAction[];
  onRegisterCloser?: (id: string, close: (() => void) | null) => void;
  onSwipeableWillOpen?: (id: string) => void;
}>;

type SwipeableRefMethods = {
  close: () => void;
  openLeft: () => void;
  openRight: () => void;
  reset: () => void;
};

export function ListItem({
  id,
  children,
  actions = [],
  onRegisterCloser,
  onSwipeableWillOpen,
}: ListItemProps) {
  const { colors } = useTheme();
  const swipeableRef = useRef<SwipeableRefMethods | null>(null);
  const canSwipe = actions.length > 0;

  useEffect(() => {
    if (!canSwipe || !onRegisterCloser) {
      return;
    }

    onRegisterCloser(id, () => {
      swipeableRef.current?.close();
    });

    return () => {
      onRegisterCloser(id, null);
    };
  }, [canSwipe, onRegisterCloser, id]);

  const renderRightActions = () => (
    <View style={styles.actionsContainer}>
      {actions.map((action, index) => (
        <Pressable
          key={`${action.title}-${index}`}
          onPress={() => {
            swipeableRef.current?.close();
            action.callback();
          }}
          style={[styles.deleteAction, { backgroundColor: colors[action.tone ?? 'danger'] }]}
          accessibilityRole="button"
          accessibilityLabel={`${action.title}`}>
          <Ionicons name={action.icon} size={18} color="#ffffff" />
          {/* <Text style={styles.deleteActionLabel}>{action.title}</Text> */}
        </Pressable>
      ))}
    </View>
  );

  if (!canSwipe) {
    return <>{children}</>;
  }

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      overshootRight={false}
      renderRightActions={renderRightActions}
      onSwipeableWillOpen={() => onSwipeableWillOpen?.(id)}>
      {children}
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
