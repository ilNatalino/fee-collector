import { CirclePlus, XCircle } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
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

  const primaryColor = isDark ? '#818cf8' : '#6366f1';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 justify-center px-[18px] bg-black/30">
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 200 }}
        >
          <View className="shadow-lg shadow-zinc-950/10 dark:ring-white/10 rounded-2xl p-4 gap-y-2.5 bg-white dark:bg-zinc-900 max-h-[85%]">
            <Text className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">New Group</Text>

            <TextInput
              value={groupName}
              onChangeText={(v) => { setGroupName(v); setError(null); }}
              placeholder="Group name (e.g. Birthday party)"
              placeholderTextColor="#a1a1aa"
              className="border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100"
            />

            <Text className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400">Choose an icon</Text>
            <View className="flex-row gap-2 flex-wrap">
              {EMOJI_OPTIONS.map((emoji) => (
                <Pressable
                  key={emoji}
                  onPress={() => setSelectedEmoji(emoji)}
                  className={`w-[38px] h-[38px] rounded-[10px] border-[1.5px] items-center justify-center ${
                    emoji === selectedEmoji
                      ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-500/10 dark:bg-indigo-400/10'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <Text className="text-lg">{emoji}</Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              value={totalAmount}
              onChangeText={(v) => { setTotalAmount(v); setError(null); }}
              placeholder="Total amount (€)"
              placeholderTextColor="#a1a1aa"
              keyboardType="decimal-pad"
              className="border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100"
            />

            <View className="flex-row justify-between items-center">
              <Text className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400">Members</Text>
              <Pressable onPress={addMember} accessibilityLabel="Add member">
                <CirclePlus size={22} color={primaryColor} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled>
              {members.map((member) => (
                <View key={member.key} className="flex-row gap-x-2 items-center mb-2">
                  <TextInput
                    value={member.name}
                    onChangeText={(v) => updateMember(member.key, 'name', v)}
                    placeholder="Name"
                    placeholderTextColor="#a1a1aa"
                    className="flex-1 border border-zinc-200 dark:border-zinc-800 rounded-[10px] px-2.5 py-2 text-[13px] text-zinc-900 dark:text-zinc-100"
                  />
                  <TextInput
                    value={member.amount}
                    onChangeText={(v) => updateMember(member.key, 'amount', v)}
                    placeholder="€"
                    placeholderTextColor="#a1a1aa"
                    keyboardType="decimal-pad"
                    className="w-[70px] border border-zinc-200 dark:border-zinc-800 rounded-[10px] px-2.5 py-2 text-[13px] text-zinc-900 dark:text-zinc-100"
                  />
                  {members.length > 1 ? (
                    <Pressable onPress={() => removeMember(member.key)} accessibilityLabel="Remove member">
                      <XCircle size={20} color="#ef4444" />
                    </Pressable>
                  ) : null}
                </View>
              ))}
            </ScrollView>

            {error ? <Text className="text-xs text-red-500 dark:text-red-400">{error}</Text> : null}

            <View className="mt-1 flex-row justify-end gap-x-2.5">
              <Pressable
                onPress={onCancel}
                className="border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-3.5"
                accessibilityRole="button"
                accessibilityLabel="Cancel create group"
              >
                <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                className="bg-indigo-500 dark:bg-indigo-400 rounded-xl py-2 px-3.5"
                accessibilityRole="button"
                accessibilityLabel="Create group"
              >
                <Text className="text-sm font-bold text-white">Create</Text>
              </Pressable>
            </View>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
}
