import { useState } from 'react';

import { DeleteConfirmationModal } from '@/src/components/DeleteConfirmationModal';
import { QuotaFormModal } from '@/src/components/QuotaFormModal';
import { Screen } from '@/src/components/Screen';
import { SwipeableList } from '@/src/components/SwipeableList';
import { UserActivityItem } from '@/src/components/UserActivityItem';
import { useUserActivities } from '@/src/hooks/useUserActivities';
import { UserActivity } from '@/src/types/userActivity';

export default function PaymentsScreen() {
  const { activities, deleteActivityById, updateActivityById } = useUserActivities();
  const [activityToDelete, setActivityToDelete] = useState<UserActivity | null>(null);
  const [activityToEdit, setActivityToEdit] = useState<UserActivity | null>(null);

  const closeDeleteModal = () => setActivityToDelete(null);
  const closeEditModal = () => setActivityToEdit(null);

  const handleConfirmDelete = async () => {
    if (!activityToDelete) {
      return;
    }

    await deleteActivityById(activityToDelete.id);
    closeDeleteModal();
  };

  const handleConfirmEdit = async ({ name, amount }: { name: string; amount: number }) => {
    if (!activityToEdit) {
      return;
    }

    await updateActivityById(activityToEdit.id, {
      memberName: name,
      amount: amount,
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
        title="Edit activity"
        confirmLabel="Save"
        cancelAccessibilityLabel="Cancel edit activity"
        confirmAccessibilityLabel="Confirm edit activity"
        initialName={activityToEdit?.memberName}
        initialAmount={activityToEdit?.amount}
        onCancel={closeEditModal}
        onSubmit={(payload) => {
          void handleConfirmEdit(payload);
        }}
      />

      <DeleteConfirmationModal
        visible={Boolean(activityToDelete)}
        title="Delete activity"
        message={`Are you sure you want to delete activity of ${activityToDelete?.memberName ?? 'this user'}?`}
        cancelLabel="Cancel"
        confirmLabel="Delete"
        cancelAccessibilityLabel="Cancel delete activity"
        confirmAccessibilityLabel="Confirm delete activity"
        onCancel={closeDeleteModal}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
      />
    </Screen>
  );
}
