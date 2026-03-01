import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/src/hooks/useTheme';

type StatCardProps = {
  label: string;
  value: string;
  valueColor?: string;
};

export function StatCard({ label, value, valueColor }: StatCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.value, { color: valueColor ?? colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48.5%',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
  },
});
