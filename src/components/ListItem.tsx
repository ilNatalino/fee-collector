import { Pencil, Trash2 } from 'lucide-react-native';
import { type ReactNode, useEffect, useRef } from 'react';
import { Pressable, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

export type ListItemAction = {
  title: string;
  icon: 'pencil' | 'trash';
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

const ICON_MAP = {
  pencil: Pencil,
  trash: Trash2,
} as const;

const TONE_CLASSES = {
  danger: 'bg-red-500',
  primary: 'bg-indigo-500',
} as const;

export function ListItem({
  id,
  children,
  actions = [],
  onRegisterCloser,
  onSwipeableWillOpen,
}: ListItemProps) {
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
    <View className="flex-row">
      {actions.map((action, index) => {
        const Icon = ICON_MAP[action.icon];
        return (
          <Pressable
            key={`${action.title}-${index}`}
            onPress={() => {
              swipeableRef.current?.close();
              action.callback();
            }}
            className={`min-w-[50px] rounded-2xl items-center justify-center flex-row gap-x-1.5 ml-2 ${TONE_CLASSES[action.tone ?? 'danger']}`}
            accessibilityRole="button"
            accessibilityLabel={action.title}
          >
            <Icon size={16} color="#ffffff" />
          </Pressable>
        );
      })}
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
      onSwipeableWillOpen={() => onSwipeableWillOpen?.(id)}
    >
      {children}
    </ReanimatedSwipeable>
  );
}
