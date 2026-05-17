import { Picker } from '@react-native-picker/picker';
import { MotiView } from 'moti';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

import { MemberQuotaProjection } from '@/src/utils/groupProjection';
import { formatCents, parseEuroInputToCents } from '@/src/utils/money';

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
  const [amountError, setAmountError] = useState<string | null>(null);
  const [memberError, setMemberError] = useState<string | null>(null);
  const selectedMember = members.find((member) => member.membershipId === selectedMembershipId);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (members.length > 0) {
      setSelectedMembershipId(members[0].membershipId);
    } else {
      setSelectedMembershipId('');
    }
    setAmountInput('');
    setAmountError(null);
    setMemberError(null);
  }, [visible, members]);

  const handleSave = () => {
    let hasError = false;

    if (!selectedMembershipId || !selectedMember) {
      setMemberError('Please select a member');
      hasError = true;
    }

    const parsedAmountCents = parseEuroInputToCents(amountInput);
    if (parsedAmountCents === null || parsedAmountCents <= 0) {
      setAmountError('Enter an amount greater than 0');
      hasError = true;
    }

    if (selectedMember && parsedAmountCents !== null && parsedAmountCents > selectedMember.remainingAmountCents) {
      setAmountError(`Enter an amount up to €${formatCents(selectedMember.remainingAmountCents)}`);
      hasError = true;
    }

    if (hasError || parsedAmountCents === null) return;

    onSubmit(selectedMembershipId, parsedAmountCents);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-center px-[18px] bg-black/30">
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'timing', duration: 200 }}
            >
              <View className="shadow-lg shadow-zinc-950/10 dark:ring-white/10 rounded-2xl p-4 gap-y-2.5 bg-white dark:bg-zinc-900 shadow-zinc-950/5 ring-1 ring-zinc-950/5">
                <Text className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">Add Payment</Text>

            <View className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden">
              <Picker
                selectedValue={selectedMembershipId}
                onValueChange={(itemValue) => {
                  setSelectedMembershipId(itemValue);
                  if (memberError) setMemberError(null);
                }}
                style={{
                  color: isDark ? '#f4f4f5' : '#18181b',
                  backgroundColor: 'transparent',
                  marginHorizontal: -8, // compensate for inner padding if needed
                }}
                dropdownIconColor={isDark ? '#a1a1aa' : '#71717a'}
                prompt="Select a member"
              >
                <Picker.Item label="Select a member..." value="" color={isDark ? '#a1a1aa' : '#71717a'} />
                {members.map((member) => (
                  <Picker.Item
                    key={member.membershipId}
                    label={member.memberFullName}
                    value={member.membershipId}
                    color={isDark ? '#f4f4f5' : '#18181b'}
                  />
                ))}
              </Picker>
            </View>
            {memberError ? (
              <Text className="text-xs text-red-500 dark:text-red-400 -mt-1">{memberError}</Text>
            ) : null}

            {selectedMember ? (
              <Text className="text-xs text-zinc-500 dark:text-zinc-400 -mt-1">
                Remaining quota: €{formatCents(selectedMember.remainingAmountCents)}
              </Text>
            ) : null}

            <TextInput
              value={amountInput}
              onChangeText={(value) => {
                setAmountInput(value);
                if (amountError) setAmountError(null);
              }}
              placeholder="Amount (€)"
              placeholderTextColor="#a1a1aa"
              keyboardType="decimal-pad"
              className="border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100"
            />
            {amountError ? (
              <Text className="text-xs text-red-500 dark:text-red-400 -mt-1">{amountError}</Text>
            ) : null}

            <View className="mt-1 flex-row justify-end gap-x-2.5">
              <Pressable
                onPress={onCancel}
                className="border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-3.5"
                accessibilityRole="button"
                accessibilityLabel="Cancel adding payment"
              >
                <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleSave}
                className="bg-indigo-500 dark:bg-indigo-400 rounded-xl py-2 px-3.5"
                accessibilityRole="button"
                accessibilityLabel="Confirm adding payment"
              >
                <Text className="text-sm font-semibold text-white">Add</Text>
              </Pressable>
            </View>
          </View>
        </MotiView>
      </View>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}
