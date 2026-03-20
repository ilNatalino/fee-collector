import * as Haptics from 'expo-haptics';
import { type ComponentProps, useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

type AnimatedPressableProps = ComponentProps<typeof Pressable> & {
  scaleValue?: number;
  haptic?: boolean;
};

export function AnimatedPressable({
  scaleValue = 0.96,
  haptic = true,
  onPressIn,
  onPressOut,
  children,
  style,
  ...props
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (e: any) => {
      scale.value = withTiming(scaleValue, { duration: 100 });
      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPressIn?.(e);
    },
    [haptic, onPressIn, scale, scaleValue],
  );

  const handlePressOut = useCallback(
    (e: any) => {
      scale.value = withTiming(1, { duration: 150 });
      onPressOut?.(e);
    },
    [onPressOut, scale],
  );

  return (
    <AnimatedPressableBase
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
      {...props}
    >
      {children}
    </AnimatedPressableBase>
  );
}
