import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/src/hooks/useTheme';
import { UserQuota } from '@/src/types/quota';

type UserQuotaRowProps = {
  userQuota: UserQuota;
};

export function UserQuotaRow({ userQuota }: UserQuotaRowProps) {
  const { colors } = useTheme();
  const statusLabel = userQuota.hasPaid ? 'Paid' : 'Unpaid';
  const formattedAmount = `€ ${userQuota.amountDue.toFixed(2)}`;

  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View>
        <Text style={[styles.name, { color: colors.text }]}>{userQuota.name}</Text>
        <Text style={[styles.amount, { color: colors.muted }]}>{formattedAmount}</Text>
      </View>

      <View
        style={[
          styles.badge,
          { backgroundColor: userQuota.hasPaid ? `${colors.success}1F` : `${colors.danger}1F` },
        ]}>
        <Text style={[styles.badgeText, { color: userQuota.hasPaid ? colors.success : colors.danger }]}>
          {statusLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  amount: {
    fontSize: 13,
  },
  badge: {
    minWidth: 74,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
