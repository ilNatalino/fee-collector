import { MotiView } from 'moti';
import { Modal, Pressable, Text, View } from 'react-native';

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
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 justify-center px-[18px] bg-black/30">
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 200 }}
        >
          <View className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 gap-y-2.5 bg-white dark:bg-zinc-900">
            <Text className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{title}</Text>
            <Text className="text-sm leading-5 text-zinc-400 dark:text-zinc-500">{message}</Text>

            <View className="mt-1 flex-row justify-end gap-x-2.5">
              <Pressable
                onPress={onCancel}
                className="border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-3.5"
                accessibilityRole="button"
                accessibilityLabel={cancelAccessibilityLabel ?? cancelLabel}
              >
                <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{cancelLabel}</Text>
              </Pressable>

              <Pressable
                onPress={onConfirm}
                className="bg-red-500 rounded-xl py-2 px-3.5"
                accessibilityRole="button"
                accessibilityLabel={confirmAccessibilityLabel ?? confirmLabel}
              >
                <Text className="text-sm font-bold text-white">{confirmLabel}</Text>
              </Pressable>
            </View>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
}
