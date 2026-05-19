import { useEffect, useMemo, useState } from 'react';

import { formatCents, parseEuroInputToCents } from '@/src/utils/money';

import { CompactFormField, CompactFormModal, CompactFormTextInput } from './CompactFormModal';

export type PaymentFormModalProps = Readonly<{
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  amountLabel?: string;
  amountPlaceholder?: string;
  amountHelperText?: string;
  cancelAccessibilityLabel: string;
  confirmAccessibilityLabel: string;
  initialAmountCents?: number;
  maxAmountCents?: number;
  onCancel: () => void;
  onSubmit: (payload: { amountCents: number }) => void;
}>;

function getAmountFeedback(
  amountInput: string,
  parsedAmountCents: number | null,
  amountHelperText: string | undefined,
  maxAmountCents: number | undefined,
) {
  if (!amountInput.trim()) {
    return { helperText: amountHelperText, helperTone: 'default' as const };
  }

  if (parsedAmountCents === null || parsedAmountCents <= 0) {
    return { helperText: 'Enter an amount greater than 0', helperTone: 'error' as const };
  }

  if (maxAmountCents !== undefined && parsedAmountCents > maxAmountCents) {
    return {
      helperText: `Enter an amount up to €${formatCents(maxAmountCents)}`,
      helperTone: 'error' as const,
    };
  }

  return { helperText: amountHelperText, helperTone: 'default' as const };
}

export function PaymentFormModal({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  amountLabel = 'Amount',
  amountPlaceholder = '0.00',
  amountHelperText,
  cancelAccessibilityLabel,
  confirmAccessibilityLabel,
  initialAmountCents,
  maxAmountCents,
  onCancel,
  onSubmit,
}: PaymentFormModalProps) {
  const [amountInput, setAmountInput] = useState('');

  useEffect(() => {
    if (!visible) {
      return;
    }

    setAmountInput(initialAmountCents !== undefined ? formatCents(initialAmountCents) : '');
  }, [initialAmountCents, visible]);

  const parsedAmountCents = useMemo(() => parseEuroInputToCents(amountInput), [amountInput]);
  const isAmountValid =
    parsedAmountCents !== null
    && parsedAmountCents > 0
    && (maxAmountCents === undefined || parsedAmountCents <= maxAmountCents);
  const amountFeedback = getAmountFeedback(
    amountInput,
    parsedAmountCents,
    amountHelperText,
    maxAmountCents,
  );

  const handleConfirm = () => {
    if (!isAmountValid || parsedAmountCents === null) {
      return;
    }

    onSubmit({ amountCents: parsedAmountCents });
  };

  return (
    <CompactFormModal
      visible={visible}
      title={title}
      description={description}
      cancelLabel={cancelLabel}
      confirmLabel={confirmLabel}
      cancelAccessibilityLabel={cancelAccessibilityLabel}
      confirmAccessibilityLabel={confirmAccessibilityLabel}
      confirmDisabled={!isAmountValid}
      onCancel={onCancel}
      onConfirm={handleConfirm}
    >
      <CompactFormField
        label={amountLabel}
        helperText={amountFeedback.helperText}
        helperTone={amountFeedback.helperTone}
      >
        <CompactFormTextInput
          value={amountInput}
          onChangeText={setAmountInput}
          placeholder={amountPlaceholder}
          keyboardType="decimal-pad"
        />
      </CompactFormField>
    </CompactFormModal>
  );
}