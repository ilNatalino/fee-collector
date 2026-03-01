import { FlatList, StyleSheet, View } from 'react-native';

import { Screen } from '@/src/components/Screen';
import { UserQuotaRow } from '@/src/components/UserQuotaRow';
import { useQuotas } from '@/src/hooks/useQuotas';

export default function PaymentsScreen() {
  const { quotas } = useQuotas();

  return (
    <Screen>
      <FlatList
        data={quotas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <UserQuotaRow userQuota={item} />}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    marginTop: 10,
    paddingBottom: 10,
  },
  separator: {
    height: 8,
  },
});
