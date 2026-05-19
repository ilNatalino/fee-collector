import { Picker } from '@react-native-picker/picker';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
 

import { MemberQuotaProjection } from '@/src/utils/groupProjection';
import { formatCents, parseEuroInputToCents } from '@/src/utils/money';

import {
    CompactFormField,
    CompactFormModal,
    CompactFormPickerSurface,
    CompactFormTextInput,
} from './CompactFormModal';

type AddPaymentMemberOption = Pick<MemberQuotaProjection, 'membershipId' | 'memberFullName' | 'remainingAmountCents'>;

type AddPaymentModalProps = Readonly<{
  visible: boolean;
  members: AddPaymentMemberOption[];
  onCancel: () => void;
  onSubmit: (membershipId: string, amountCents: number) => void;
}>;

export function AddPaymentModal({ visible, members, onCancel, onSubmit }: AddPaymentModalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [selectedMembershipId, setSelectedMembershipId] = useState<string>('');
  const [amountInput, setAmountInput] = useState('');
  const selectedMember = members.find((member) => member.membershipId === selectedMembershipId);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setSelectedMembershipId('');
    setAmountInput('');
  }, [visible, members]);

  const parsedAmountCents = parseEuroInputToCents(amountInput);
  const hasValidAmount = selectedMember
    ? parsedAmountCents !== null
      && parsedAmountCents > 0
      && parsedAmountCents <= selectedMember.remainingAmountCents
    : false;
  const memberHelperText = selectedMember
    ? `Remaining quota: €${formatCents(selectedMember.remainingAmountCents)}`
    : 'Select a member to enable amount input.';
  const amountHelperText = (() => {
    if (!selectedMember) {
      return undefined;
    }

    if (!amountInput.trim()) {
      return 'Enter a positive amount in euros.';
    }

    if (parsedAmountCents === null || parsedAmountCents <= 0) {
      return 'Enter an amount greater than 0';
    }

    if (parsedAmountCents > selectedMember.remainingAmountCents) {
      return `Enter an amount up to €${formatCents(selectedMember.remainingAmountCents)}`;
    }

    return 'Enter a positive amount in euros.';
  })();
  const amountHelperTone = selectedMember
    && amountInput.trim()
    && (!hasValidAmount)
      ? 'error'
      : 'default';

  const handleMembershipChange = (membershipId: string) => {
    const nextMember = members.find((member) => member.membershipId === membershipId);
    const currentAmountCents = parseEuroInputToCents(amountInput);

    setSelectedMembershipId(membershipId);

    if (!nextMember) {
      setAmountInput('');
      return;
    }

    if (currentAmountCents !== null && currentAmountCents > nextMember.remainingAmountCents) {
      setAmountInput('');
    }
  };

  const handleSave = () => {
    if (!selectedMember || !hasValidAmount || parsedAmountCents === null) {
      return;
    }

    onSubmit(selectedMembershipId, parsedAmountCents);
  };

  return (
    <CompactFormModal
      visible={visible}
      title="Add payment"
      confirmLabel="Add"
      cancelAccessibilityLabel="Cancel add payment"
      confirmAccessibilityLabel="Confirm add payment"
      confirmDisabled={!selectedMember || !hasValidAmount}
      onCancel={onCancel}
      onConfirm={handleSave}
    >
      <CompactFormField label="Member" helperText={memberHelperText}>
        <CompactFormPickerSurface>
          <Picker
            selectedValue={selectedMembershipId}
            onValueChange={(itemValue) => handleMembershipChange(String(itemValue))}
            style={{
              minHeight: 52,
              width: '100%',
              color: isDark ? '#f4f4f5' : '#18181b',
              backgroundColor: 'transparent',
              marginHorizontal: -8,
            }}
            dropdownIconColor={isDark ? '#a1a1aa' : '#71717a'}
            prompt="Select a member"
          >
            <Picker.Item label="Select a member" value="" color={isDark ? '#71717a' : '#94a3b8'} />
            {members.map((member) => (
              <Picker.Item
                key={member.membershipId}
                label={member.memberFullName}
                value={member.membershipId}
                color={isDark ? '#f4f4f5' : '#18181b'}
              />
            ))}
          </Picker>
        </CompactFormPickerSurface>
      </CompactFormField>

      <CompactFormField
        label="Amount"
        helperText={amountHelperText}
        helperTone={amountHelperTone}
      >
        <CompactFormTextInput
          value={amountInput}
          onChangeText={setAmountInput}
          placeholder="0.00"
          keyboardType="decimal-pad"
          disabled={!selectedMember}
        />
      </CompactFormField>
    </CompactFormModal>
  );
}
