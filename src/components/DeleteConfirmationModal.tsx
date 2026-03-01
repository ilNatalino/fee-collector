import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/src/hooks/useTheme';

type DeleteConfirmationModalProps = {
  visible: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmAccessibilityLabel?: string;
  cancelAccessibilityLabel?: string;
};

export function DeleteConfirmationModal({
  visible,
  title = 'Delete item',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  confirmAccessibilityLabel,
  cancelAccessibilityLabel,
}: DeleteConfirmationModalProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.modalBody, { color: colors.muted }]}>{message}</Text>

          <View style={styles.modalActions}>
            <Pressable
              onPress={onCancel}
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel={cancelAccessibilityLabel ?? cancelLabel}>
              <Text style={[styles.secondaryButtonLabel, { color: colors.text }]}>{cancelLabel}</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={[styles.deleteButton, { backgroundColor: colors.danger }]}
              accessibilityRole="button"
              accessibilityLabel={confirmAccessibilityLabel ?? confirmLabel}>
              <Text style={styles.deleteButtonLabel}>{confirmLabel}</Text>
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
  },
  modalBody: {
    fontSize: 14,
    lineHeight: 20,
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
  deleteButton: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  deleteButtonLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
