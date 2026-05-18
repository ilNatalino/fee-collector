import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Plus } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { ReactNode, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { DeleteConfirmationModal } from '@/src/components/DeleteConfirmationModal';
import { MembershipPaymentItem } from '@/src/components/MembershipPaymentItem';
import { QuotaFormModal } from '@/src/components/QuotaFormModal';
import { SwipeableList } from '@/src/components/SwipeableList';
import { useGroupCollection } from '@/src/hooks/useGroupCollection';
import { PaymentProjection } from '@/src/utils/activityLog';
import { QuotaStatus } from '@/src/utils/groupProjection';
import { formatCents } from '@/src/utils/money';

const STATUS_STYLES = {
  unpaid: {
    badge: 'bg-zinc-100 dark:bg-zinc-800',
    text: 'text-zinc-700 dark:text-zinc-300',
  },
  partial: {
    badge: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
  },
  paid: {
    badge: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
} as const;

function getQuotaStatusLabel(quotaStatus: QuotaStatus): string {
  switch (quotaStatus) {
    case 'paid':
      return 'Paid';
    case 'partial':
      return 'Partially paid';
    default:
      return 'Unpaid';
  }
}

type MembershipActivityLayoutProps = Readonly<{
  title: string;
  iconColor: string;
  onBack: () => void;
  children: ReactNode;
}>;

function MembershipActivityLayout({ title, iconColor, onBack, children }: MembershipActivityLayoutProps) {
  return (
    <View className="flex-1 bg-zinc-100 dark:bg-zinc-950">
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
          <AnimatedPressable
            onPress={onBack}
            className="w-10 h-10 rounded-xl items-center justify-center shadow-sm shadow-zinc-950/5 dark:ring-white/10 bg-white dark:bg-zinc-900"
          >
            <ChevronLeft size={24} color={iconColor} />
          </AnimatedPressable>
          <Text className="text-lg font-semibold flex-1 text-center text-zinc-900 dark:text-zinc-100" numberOfLines={1}>
            {title}
          </Text>
          <View className="w-10" />
        </View>

        {children}
      </SafeAreaView>
    </View>
  );
}

export default function MembershipActivityScreen() {
  const { id, membershipId } = useLocalSearchParams<{ id: string; membershipId: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#f4f4f5' : '#18181b';
  const {
    deletePayment,
    editPayment,
    recordPayment,
    getMembershipActivityView,
    isHydrating,
  } = useGroupCollection();
  const { groupProjection, membershipProjection, payments, isMissing } = getMembershipActivityView(id, membershipId);

  const [paymentToDelete, setPaymentToDelete] = useState<PaymentProjection | null>(null);
  const [paymentToEdit, setPaymentToEdit] = useState<PaymentProjection | null>(null);
  const [isAddPaymentModalVisible, setIsAddPaymentModalVisible] = useState(false);

  if (isHydrating) {
    return (
      <MembershipActivityLayout title="Loading Activity" iconColor={iconColor} onBack={() => router.back()}>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-sm text-zinc-500 dark:text-zinc-400">Loading activity...</Text>
        </View>
      </MembershipActivityLayout>
    );
  }

  const isUnavailable = !groupProjection || !membershipProjection || payments.length === 0;

  if (isUnavailable) {
    const message = isMissing
      ? 'This membership activity is unavailable.'
      : 'This membership has no recorded payments to show.';

    return (
      <MembershipActivityLayout title="Activity Unavailable" iconColor={iconColor} onBack={() => router.back()}>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-sm text-zinc-500 dark:text-zinc-400">{message}</Text>
        </View>
      </MembershipActivityLayout>
    );
  }

  const statusStyles = STATUS_STYLES[membershipProjection.quotaStatus];
  const closeDeleteModal = () => setPaymentToDelete(null);
  const closeEditModal = () => setPaymentToEdit(null);

  const handleConfirmDelete = async () => {
    if (!paymentToDelete) {
      return;
    }

    const shouldReturnToGroup = payments.length === 1;
    const result = await deletePayment(paymentToDelete.paymentId);
    closeDeleteModal();

    if (result.status === 'accepted' && shouldReturnToGroup) {
      router.back();
    }
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

  const listHeader = (
    <View className="px-5 pb-5 pt-1">
      <View className="rounded-3xl bg-white dark:bg-zinc-900 p-5 shadow-sm shadow-zinc-950/5 ring-1 ring-zinc-950/5 dark:ring-white/10">
        <View className="flex-row items-start justify-between gap-x-3">
          <View className="flex-1">
            <Text className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400">GROUP</Text>
            <Text className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100" numberOfLines={1}>
              {groupProjection.groupName}
            </Text>
          </View>

          <View className={`rounded-full px-3 py-1 ${statusStyles.badge}`}>
            <Text className={`text-xs font-semibold ${statusStyles.text}`}>
              {getQuotaStatusLabel(membershipProjection.quotaStatus)}
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row gap-x-3">
          <View className="flex-1 rounded-2xl bg-zinc-50 dark:bg-zinc-950 px-3 py-3">
            <Text className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400">Quota</Text>
            <Text className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
              €{formatCents(membershipProjection.quotaAmountCents)}
            </Text>
          </View>
          <View className="flex-1 rounded-2xl bg-zinc-50 dark:bg-zinc-950 px-3 py-3">
            <Text className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400">Collected</Text>
            <Text className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
              €{formatCents(membershipProjection.collectedAmountCents)}
            </Text>
          </View>
          <View className="flex-1 rounded-2xl bg-zinc-50 dark:bg-zinc-950 px-3 py-3">
            <Text className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400">Remaining</Text>
            <Text className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
              €{formatCents(membershipProjection.remainingAmountCents)}
            </Text>
          </View>
        </View>
      </View>

      <AnimatedPressable
        className={`mt-4 h-[50px] rounded-2xl flex-row items-center justify-center bg-white dark:bg-zinc-900 shadow-sm shadow-zinc-950/5 ring-1 ring-zinc-950/5 dark:ring-white/10 ${membershipProjection.remainingAmountCents === 0 ? 'opacity-50' : ''}`}
        disabled={membershipProjection.remainingAmountCents === 0}
        onPress={() => setIsAddPaymentModalVisible(true)}
      >
        <Plus size={16} color={iconColor} style={{ marginRight: 6 }} />
        <Text className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">Add payment</Text>
      </AnimatedPressable>

      <View className="mt-6 flex-row justify-between items-center">
        <Text className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400">PAYMENTS</Text>
      </View>
    </View>
  );

  return (
    <>
      <MembershipActivityLayout
        title={membershipProjection.memberFullName}
        iconColor={iconColor}
        onBack={() => router.back()}
      >
        <SwipeableList
          data={payments}
          keyExtractor={(payment) => payment.paymentId}
          renderItem={(payment) => <MembershipPaymentItem payment={payment} />}
          ListHeaderComponent={listHeader}
          editFeature
          onRequestEdit={setPaymentToEdit}
          deleteFeature
          onRequestDelete={setPaymentToDelete}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </MembershipActivityLayout>

      <QuotaFormModal
        visible={isAddPaymentModalVisible}
        title="Add payment"
        description={`Remaining quota: €${formatCents(membershipProjection.remainingAmountCents)}`}
        confirmLabel="Add"
        cancelAccessibilityLabel="Cancel add payment"
        confirmAccessibilityLabel="Confirm add payment"
        maxAmountCents={membershipProjection.remainingAmountCents}
        onCancel={() => setIsAddPaymentModalVisible(false)}
        onSubmit={(payload) => {
          void recordPayment(groupProjection.groupId, membershipProjection.membershipId, payload.amountCents);
          setIsAddPaymentModalVisible(false);
        }}
      />

      <QuotaFormModal
        visible={Boolean(paymentToEdit)}
        title="Edit payment"
        description={`Recorded for ${membershipProjection.memberFullName}`}
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
        message={`Are you sure you want to delete this payment for ${membershipProjection.memberFullName}?`}
        cancelLabel="Cancel"
        confirmLabel="Delete"
        cancelAccessibilityLabel="Cancel delete payment"
        confirmAccessibilityLabel="Confirm delete payment"
        onCancel={closeDeleteModal}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
      />
    </>
  );
}