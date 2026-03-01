import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CircularQuotaProgress } from '@/src/components/CircularQuotaProgress';
import { QuotaFormModal } from '@/src/components/QuotaFormModal';
import { Screen } from '@/src/components/Screen';
import { StatCard } from '@/src/components/StatCard';
import { useQuotas } from '@/src/hooks/useQuotas';
import { useTheme } from '@/src/hooks/useTheme';
import { getQuotaSummary } from '@/src/utils/quotaMetrics';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { quotas, addPaidQuota } = useQuotas();
  const summary = getQuotaSummary(quotas);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.content}>
          <CircularQuotaProgress
            progress={summary.progress}
            centerLabel="Collected"
            centerSubLabel={`${summary.paidUsers}/${summary.totalUsers} users`}
          />

          <View style={styles.statsGrid}>
            <StatCard label="Collected" value={`${summary.collectedAmount} €`} />
            <StatCard label="Pending" value={`${summary.pendingAmount} €`} />
            <StatCard label="Paid" value={`${summary.paidUsers}`} />
            <StatCard
              label="Unpaid"
              value={`${summary.unpaidUsers}`}
              valueColor={colors.danger}
            />
          </View>

          <Text style={[styles.caption, { color: colors.muted }]}>Quota completion rate by users</Text>
        </View>

        <Pressable
          onPress={() => setIsModalVisible(true)}
          style={[styles.fab, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Add paid quota">
          <Text style={styles.fabLabel}>+</Text>
        </Pressable>

        <QuotaFormModal
          visible={isModalVisible}
          title="Add paid quota"
          confirmLabel="Save"
          cancelAccessibilityLabel="Cancel add paid quota"
          confirmAccessibilityLabel="Save paid quota"
          onCancel={closeModal}
          onSubmit={({ name, amount }) => {
            addPaidQuota(name, amount);
            closeModal();
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    gap: 20,
    marginTop: 20,
  },
  statsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  caption: {
    fontSize: 14,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabLabel: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 28,
    fontWeight: '600',
  },
});
