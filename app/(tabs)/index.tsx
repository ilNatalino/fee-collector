import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { CircularQuotaProgress } from '@/src/components/CircularQuotaProgress';
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
  const [nameInput, setNameInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);

  const closeModal = () => {
    setIsModalVisible(false);
    setNameInput('');
    setAmountInput('');
    setAmountError(null);
  };

  const handleSave = () => {
    const parsedAmount = Number.parseFloat(amountInput.replace(',', '.'));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setAmountError('Enter an amount greater than 0');
      return;
    }

    addPaidQuota(nameInput.trim() || 'New User', parsedAmount);
    closeModal();
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

        <Modal
          visible={isModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeModal}>
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add paid quota</Text>

              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Name"
                placeholderTextColor={colors.muted}
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              />

              <TextInput
                value={amountInput}
                onChangeText={(value) => {
                  setAmountInput(value);
                  if (amountError) {
                    setAmountError(null);
                  }
                }}
                placeholder="Amount (€)"
                placeholderTextColor={colors.muted}
                keyboardType="decimal-pad"
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              />

              {amountError ? <Text style={[styles.errorText, { color: colors.danger }]}>{amountError}</Text> : null}

              <View style={styles.modalActions}>
                <Pressable
                  onPress={closeModal}
                  style={[styles.secondaryButton, { borderColor: colors.border }]}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel add paid quota">
                  <Text style={[styles.secondaryButtonLabel, { color: colors.text }]}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={handleSave}
                  style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                  accessibilityRole="button"
                  accessibilityLabel="Save paid quota">
                  <Text style={styles.primaryButtonLabel}>Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    backgroundColor: '#00000055',
  },
  modalCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
  },
  modalActions: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  secondaryButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  primaryButtonLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
