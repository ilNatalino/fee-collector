import { useState } from 'react';

import { DeleteConfirmationModal } from '@/src/components/DeleteConfirmationModal';
import { QuotaFormModal } from '@/src/components/QuotaFormModal';
import { Screen } from '@/src/components/Screen';
import { SwipeableList } from '@/src/components/SwipeableList';
import { UserQuotaListItem } from '@/src/components/UserQuotaListItem';
import { useQuotas } from '@/src/hooks/useQuotas';
import { UserQuota } from '@/src/types/quota';

export default function PaymentsScreen() {
  const { quotas, deleteQuotaById, updateQuotaById } = useQuotas();
  const [quotaToDelete, setQuotaToDelete] = useState<UserQuota | null>(null);
  const [quotaToEdit, setQuotaToEdit] = useState<UserQuota | null>(null);

  const closeDeleteModal = () => setQuotaToDelete(null);
  const closeEditModal = () => setQuotaToEdit(null);

  const handleConfirmDelete = async () => {
    if (!quotaToDelete) {
      return;
    }

    await deleteQuotaById(quotaToDelete.id);
    closeDeleteModal();
  };

  const handleConfirmEdit = async ({ name, amount }: { name: string; amount: number }) => {
    if (!quotaToEdit) {
      return;
    }

    await updateQuotaById(quotaToEdit.id, {
      name,
      amountDue: amount,
    });
    closeEditModal();
  };

  return (
    <Screen>
      <SwipeableList
        data={quotas}
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <UserQuotaListItem
            name={item.name}
            insertedDate={new Date(item.insertedDate).toLocaleDateString()}
            amount={`${item.amountDue.toFixed(2)}€`}
          />
        )}
        editFeature
        onRequestEdit={setQuotaToEdit}
        deleteFeature
        onRequestDelete={setQuotaToDelete}
      />

      <QuotaFormModal
        visible={Boolean(quotaToEdit)}
        title="Edit payment"
        confirmLabel="Save"
        cancelAccessibilityLabel="Cancel edit payment"
        confirmAccessibilityLabel="Confirm edit payment"
        initialName={quotaToEdit?.name}
        initialAmount={quotaToEdit?.amountDue}
        onCancel={closeEditModal}
        onSubmit={(payload) => {
          void handleConfirmEdit(payload);
        }}
      />

      <DeleteConfirmationModal
        visible={Boolean(quotaToDelete)}
        title="Delete payment"
        message={`Are you sure you want to delete payment of ${quotaToDelete?.name ?? 'this user'}?`}
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
