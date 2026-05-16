import { useState } from 'react';

import { DeleteConfirmationModal } from '@/src/components/DeleteConfirmationModal';
import { QuotaFormModal } from '@/src/components/QuotaFormModal';
import { Screen } from '@/src/components/Screen';
import { SwipeableList } from '@/src/components/SwipeableList';
import { UserActivityItem } from '@/src/components/UserActivityItem';
import { useGroups } from '@/src/hooks/useGroups';
import { useUserActivities } from '@/src/hooks/useUserActivities';
import { UserActivity } from '@/src/types/userActivity';
import { eurosToCents } from '@/src/utils/money';

export default function PaymentsScreen() {
  const { activities } = useUserActivities();
  const { deletePayment, editPayment } = useGroups();
  const [activityToDelete, setActivityToDelete] = useState<UserActivity | null>(null);
  const [activityToEdit, setActivityToEdit] = useState<UserActivity | null>(null);

  const closeDeleteModal = () => setActivityToDelete(null);
  const closeEditModal = () => setActivityToEdit(null);

  const handleConfirmDelete = async () => {
    if (!activityToDelete) {
      return;
    }

    await deletePayment(activityToDelete.id);
    closeDeleteModal();
  };

  const handleConfirmEdit = async ({ amount }: { amount: number }) => {
    if (!activityToEdit) {
      return;
    }

    await editPayment(activityToEdit.id, {
      amountCents: eurosToCents(amount),
    });
    closeEditModal();
  };

  return (
    <Screen>
      <SwipeableList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={(item) => <UserActivityItem activity={item} />}
        editFeature
        onRequestEdit={setActivityToEdit}
        deleteFeature
        onRequestDelete={setActivityToDelete}
      />

      <QuotaFormModal
        visible={Boolean(activityToEdit)}
        title="Edit payment"
        description={activityToEdit ? `Recorded for ${activityToEdit.memberName}` : undefined}
        confirmLabel="Save"
        cancelAccessibilityLabel="Cancel edit payment"
        confirmAccessibilityLabel="Confirm edit payment"
        initialAmount={activityToEdit?.amount}
        onCancel={closeEditModal}
        onSubmit={(payload) => {
          void handleConfirmEdit(payload);
        }}
      />

      <DeleteConfirmationModal
        visible={Boolean(activityToDelete)}
        title="Delete payment"
        message={`Are you sure you want to delete the payment recorded for ${activityToDelete?.memberName ?? 'this member'}?`}
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
