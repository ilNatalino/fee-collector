import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/src/hooks/useTheme';

type DashboardStatCardProps = {
  label: string;
  value: string;
  subLabel?: string;
  subLabelColor?: string;
};

export function DashboardStatCard({ label, value, subLabel, subLabelColor }: DashboardStatCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      {subLabel ? (
        <Text style={[styles.subLabel, { color: subLabelColor ?? colors.success }]}>{subLabel}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
