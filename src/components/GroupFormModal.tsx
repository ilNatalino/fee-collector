import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/src/hooks/useTheme';

type MemberInput = {
  key: string;
  name: string;
  amount: string;
};

type GroupFormModalProps = Readonly<{
  visible: boolean;
  onCancel: () => void;
  onSubmit: (payload: {
    name: string;
    emoji: string;
    totalAmount: number;
    members: { name: string; amountDue: number }[];
  }) => void;
}>;

const EMOJI_OPTIONS = ['🎁', '🍽️', '🎂', '✈️', '🎉', '🏠', '💰', '🎓'];

const createMemberKey = () => `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export function GroupFormModal({ visible, onCancel, onSubmit }: GroupFormModalProps) {
  const { colors } = useTheme();
  const [groupName, setGroupName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_OPTIONS[0]);
  const [totalAmount, setTotalAmount] = useState('');
  const [members, setMembers] = useState<MemberInput[]>([
    { key: createMemberKey(), name: '', amount: '' },
  ]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setGroupName('');
    setSelectedEmoji(EMOJI_OPTIONS[0]);
    setTotalAmount('');
    setMembers([{ key: createMemberKey(), name: '', amount: '' }]);
    setError(null);
  }, [visible]);

  const addMember = () => {
    setMembers((prev) => [...prev, { key: createMemberKey(), name: '', amount: '' }]);
  };

  const removeMember = (key: string) => {
    setMembers((prev) => prev.filter((m) => m.key !== key));
  };

  const updateMember = (key: string, field: 'name' | 'amount', value: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.key === key ? { ...m, [field]: value } : m)),
    );
  };

  const handleSubmit = () => {
    const parsedTotal = Number.parseFloat(totalAmount.replace(',', '.'));
    if (!groupName.trim()) {
      setError('Enter a group name');
      return;
    }
    if (!Number.isFinite(parsedTotal) || parsedTotal <= 0) {
      setError('Enter a valid total amount');
      return;
    }

    const validMembers = members
      .filter((m) => m.name.trim())
      .map((m) => ({
        name: m.name.trim(),
        amountDue: Number.parseFloat(m.amount.replace(',', '.')) || 0,
      }));

    if (validMembers.length === 0) {
      setError('Add at least one member');
      return;
    }

    onSubmit({
      name: groupName.trim(),
      emoji: selectedEmoji,
      totalAmount: parsedTotal,
      members: validMembers,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>New Group</Text>

          <TextInput
            value={groupName}
            onChangeText={(v) => { setGroupName(v); setError(null); }}
            placeholder="Group name (e.g. Birthday party)"
            placeholderTextColor={colors.muted}
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          />

          <Text style={[styles.label, { color: colors.muted }]}>Choose an icon</Text>
          <View style={styles.emojiRow}>
            {EMOJI_OPTIONS.map((emoji) => (
              <Pressable
                key={emoji}
                onPress={() => setSelectedEmoji(emoji)}
                style={[
                  styles.emojiItem,
                  {
                    borderColor: emoji === selectedEmoji ? colors.primary : colors.border,
                    backgroundColor: emoji === selectedEmoji ? colors.primary + '18' : 'transparent',
                  },
                ]}>
                <Text style={styles.emojiText}>{emoji}</Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            value={totalAmount}
            onChangeText={(v) => { setTotalAmount(v); setError(null); }}
            placeholder="Total amount (€)"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          />

          <View style={styles.membersHeader}>
            <Text style={[styles.label, { color: colors.muted }]}>Members</Text>
            <Pressable onPress={addMember} accessibilityLabel="Add member">
              <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
            </Pressable>
          </View>

          <ScrollView style={styles.membersList} nestedScrollEnabled>
            {members.map((member) => (
              <View key={member.key} style={styles.memberRow}>
                <TextInput
                  value={member.name}
                  onChangeText={(v) => updateMember(member.key, 'name', v)}
                  placeholder="Name"
                  placeholderTextColor={colors.muted}
                  style={[styles.memberNameInput, { color: colors.text, borderColor: colors.border }]}
                />
                <TextInput
                  value={member.amount}
                  onChangeText={(v) => updateMember(member.key, 'amount', v)}
                  placeholder="€"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  style={[styles.memberAmountInput, { color: colors.text, borderColor: colors.border }]}
                />
                {members.length > 1 ? (
                  <Pressable onPress={() => removeMember(member.key)} accessibilityLabel="Remove member">
                    <Ionicons name="close-circle" size={20} color={colors.danger} />
                  </Pressable>
                ) : null}
              </View>
            ))}
          </ScrollView>

          {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}

          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel="Cancel create group">
              <Text style={[styles.secondaryButtonLabel, { color: colors.text }]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              accessibilityRole="button"
              accessibilityLabel="Create group">
              <Text style={styles.primaryButtonLabel}>Create</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    backgroundColor: '#00000055',
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    maxHeight: '85%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  emojiRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  emojiItem: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 18,
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membersList: {
    maxHeight: 160,
  },
  memberRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  memberNameInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  memberAmountInput: {
    width: 70,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  errorText: {
    fontSize: 12,
  },
  actions: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  secondaryButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  primaryButtonLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
