import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/src/hooks/useTheme';

export type UserQuotaListItemProps = Readonly<{
  name: string;
  insertedDate: string;
  amount: string;
}>;

export function UserQuotaListItem({ name, insertedDate, amount }: UserQuotaListItemProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
      <View>
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.insertedDate, { color: colors.muted }]}>{insertedDate}</Text>
      </View>

      <Text style={[styles.amount, { color: colors.text }]}>{amount}</Text>
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
  insertedDate: {
    fontSize: 13,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
});