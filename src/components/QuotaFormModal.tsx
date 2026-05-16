import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';

type QuotaFormModalProps = Readonly<{
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  cancelAccessibilityLabel: string;
  confirmAccessibilityLabel: string;
  initialAmount?: number;
  onCancel: () => void;
  onSubmit: (payload: { amount: number }) => void;
}>;

export function QuotaFormModal({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  cancelAccessibilityLabel,
  confirmAccessibilityLabel,
  initialAmount,
  onCancel,
  onSubmit,
}: QuotaFormModalProps) {
  const [amountInput, setAmountInput] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setAmountInput(initialAmount ? `${initialAmount}` : '');
    setAmountError(null);
  }, [initialAmount, visible]);

  const handleSave = () => {
    const parsedAmount = Number.parseFloat(amountInput.replace(',', '.'));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setAmountError('Enter an amount greater than 0');
      return;
    }

    onSubmit({
      amount: parsedAmount,
    });
    setAmountError(null);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 justify-center px-[18px] bg-black/30">
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 200 }}
        >
          <View className="shadow-lg shadow-zinc-950/10 dark:ring-white/10 rounded-2xl p-4 gap-y-2.5 bg-white dark:bg-zinc-900">
            <Text className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">{title}</Text>

            {description ? (
              <Text className="text-sm text-zinc-500 dark:text-zinc-400">{description}</Text>
            ) : null}

            <TextInput
              value={amountInput}
              onChangeText={(value) => {
                setAmountInput(value);
                if (amountError) {
                  setAmountError(null);
                }
              }}
              placeholder="Amount (€)"
              placeholderTextColor="#a1a1aa"
              keyboardType="decimal-pad"
              className="border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100"
            />

            {amountError ? (
              <Text className="text-xs text-red-500 dark:text-red-400">{amountError}</Text>
            ) : null}

            <View className="mt-1 flex-row justify-end gap-x-2.5">
              <Pressable
                onPress={onCancel}
                className="border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-3.5"
                accessibilityRole="button"
                accessibilityLabel={cancelAccessibilityLabel}
              >
                <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{cancelLabel}</Text>
              </Pressable>

              <Pressable
                onPress={handleSave}
                className="bg-indigo-500 dark:bg-indigo-400 rounded-xl py-2 px-3.5"
                accessibilityRole="button"
                accessibilityLabel={confirmAccessibilityLabel}
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
