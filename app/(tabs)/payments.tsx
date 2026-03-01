import { useState } from 'react';

import { DeleteConfirmationModal } from '@/src/components/DeleteConfirmationModal';
import { Screen } from '@/src/components/Screen';
import { ActionList } from '@/src/components/UserQuotaList';
import { useQuotas } from '@/src/hooks/useQuotas';
import { UserQuota } from '@/src/types/quota';

export default function PaymentsScreen() {
  const { quotas, deleteQuotaById } = useQuotas();
  const [quotaToDelete, setQuotaToDelete] = useState<UserQuota | null>(null);

  const closeDeleteModal = () => setQuotaToDelete(null);

  const handleConfirmDelete = async () => {
    if (!quotaToDelete) {
      return;
    }

    await deleteQuotaById(quotaToDelete.id);
    closeDeleteModal();
  };

  return (
    <Screen>
      <ActionList quotas={quotas} deleteFeature onRequestDelete={setQuotaToDelete} />

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
