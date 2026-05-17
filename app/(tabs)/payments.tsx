import { useState } from 'react';
import { Text } from 'react-native';

import { DeleteConfirmationModal } from '@/src/components/DeleteConfirmationModal';
import { QuotaFormModal } from '@/src/components/QuotaFormModal';
import { Screen } from '@/src/components/Screen';
import { SwipeableList } from '@/src/components/SwipeableList';
import { UserActivityItem } from '@/src/components/UserActivityItem';
import { useGroupCollection } from '@/src/hooks/useGroupCollection';
import { PaymentProjection } from '@/src/utils/activityLog';

export default function PaymentsScreen() {
  const { activityLogProjection, deletePayment, editPayment, isHydrating } = useGroupCollection();
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentProjection | null>(null);
  const [paymentToEdit, setPaymentToEdit] = useState<PaymentProjection | null>(null);

  if (isHydrating || !activityLogProjection) {
    return (
      <Screen>
        <Text className="text-center text-sm py-5 text-zinc-500 dark:text-zinc-400">Loading payments...</Text>
      </Screen>
    );
  }

  const closeDeleteModal = () => setPaymentToDelete(null);
  const closeEditModal = () => setPaymentToEdit(null);

  const handleConfirmDelete = async () => {
    if (!paymentToDelete) {
      return;
    }

    await deletePayment(paymentToDelete.paymentId);
    closeDeleteModal();
  };

  const handleConfirmEdit = async ({ amountCents }: { amountCents: number }) => {
    if (!paymentToEdit) {
      return;
    }

    await editPayment(paymentToEdit.paymentId, {
      amountCents,
    });
    closeEditModal();
  };

  return (
    <Screen>
      <SwipeableList
        data={activityLogProjection.payments}
        keyExtractor={(item) => item.paymentId}
        renderItem={(item) => <UserActivityItem activity={item} />}
        editFeature
        onRequestEdit={setPaymentToEdit}
        deleteFeature
        onRequestDelete={setPaymentToDelete}
      />

      <QuotaFormModal
        visible={Boolean(paymentToEdit)}
        title="Edit payment"
        description={paymentToEdit ? `Recorded for ${paymentToEdit.recordedMemberName}` : undefined}
        confirmLabel="Save"
        cancelAccessibilityLabel="Cancel edit payment"
        confirmAccessibilityLabel="Confirm edit payment"
        initialAmountCents={paymentToEdit?.amountCents}
        maxAmountCents={paymentToEdit?.maxEditableAmountCents}
        onCancel={closeEditModal}
        onSubmit={(payload) => {
          void handleConfirmEdit(payload);
        }}
      />

      <DeleteConfirmationModal
        visible={Boolean(paymentToDelete)}
        title="Delete payment"
        message={`Are you sure you want to delete the payment recorded for ${paymentToDelete?.recordedMemberName ?? 'this member'}?`}
        cancelLabel="Cancel"
        confirmLabel="Delete"
        cancelAccessibilityLabel="Cancel delete payment"
        confirmAccessibilityLabel="Confirm delete payment"
        onCancel={closeDeleteModal}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
      />
    </Screen>
  );
}
