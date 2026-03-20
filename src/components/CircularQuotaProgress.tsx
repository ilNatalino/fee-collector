import { useColorScheme } from 'nativewind';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type CircularQuotaProgressProps = {
  progress: number;
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerSubLabel?: string;
};

export function CircularQuotaProgress({
  progress,
  size = 190,
  strokeWidth = 14,
  centerLabel,
  centerSubLabel,
}: CircularQuotaProgressProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const normalizedProgress = Math.max(0, Math.min(100, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  const trackColor = isDark ? '#27272a' : '#e4e4e7'; // zinc-800 / zinc-200
  const primaryColor = isDark ? '#818cf8' : '#6366f1'; // indigo-400 / indigo-500

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle
          stroke={trackColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={primaryColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>

      <View className="absolute items-center">
        <Text className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          {Math.round(normalizedProgress)}%
        </Text>
        {centerLabel ? (
          <Text className="mt-0.5 text-[13px] font-medium text-zinc-400 dark:text-zinc-500">
            {centerLabel}
          </Text>
        ) : null}
        {centerSubLabel ? (
          <Text className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
            {centerSubLabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
