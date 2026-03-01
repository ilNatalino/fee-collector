import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/src/hooks/useTheme';

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
  const { colors } = useTheme();

  const normalizedProgress = Math.max(0, Math.min(100, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Circle
          stroke={colors.track}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={colors.primary}
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

      <View style={styles.center}>
        <Text style={[styles.progressText, { color: colors.text }]}>{Math.round(normalizedProgress)}%</Text>
        {centerLabel ? <Text style={[styles.centerLabel, { color: colors.muted }]}>{centerLabel}</Text> : null}
        {centerSubLabel ? (
          <Text style={[styles.centerSubLabel, { color: colors.muted }]}>{centerSubLabel}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 36,
    fontWeight: '700',
  },
  centerLabel: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '500',
  },
  centerSubLabel: {
    marginTop: 2,
    fontSize: 12,
  },
});
