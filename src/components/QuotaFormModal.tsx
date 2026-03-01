import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '@/src/hooks/useTheme';

type QuotaFormModalProps = Readonly<{
  visible: boolean;
  title: string;
  confirmLabel: string;
  cancelLabel?: string;
  cancelAccessibilityLabel: string;
  confirmAccessibilityLabel: string;
  initialName?: string;
  initialAmount?: number;
  onCancel: () => void;
  onSubmit: (payload: { name: string; amount: number }) => void;
}>;

export function QuotaFormModal({
  visible,
  title,
  confirmLabel,
  cancelLabel = 'Cancel',
  cancelAccessibilityLabel,
  confirmAccessibilityLabel,
  initialName = '',
  initialAmount,
  onCancel,
  onSubmit,
}: QuotaFormModalProps) {
  const { colors } = useTheme();
  const [nameInput, setNameInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setNameInput(initialName);
    setAmountInput(initialAmount ? `${initialAmount}` : '');
    setAmountError(null);
  }, [initialAmount, initialName, visible]);

  const handleSave = () => {
    const parsedAmount = Number.parseFloat(amountInput.replace(',', '.'));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setAmountError('Enter an amount greater than 0');
      return;
    }

    onSubmit({
      name: nameInput.trim() || 'New User',
      amount: parsedAmount,
    });
    setAmountError(null);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>

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
              onPress={onCancel}
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel={cancelAccessibilityLabel}>
              <Text style={[styles.secondaryButtonLabel, { color: colors.text }]}>{cancelLabel}</Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              accessibilityRole="button"
              accessibilityLabel={confirmAccessibilityLabel}>
              <Text style={styles.primaryButtonLabel}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
