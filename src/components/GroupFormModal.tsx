import { MOCK_USERS } from '@/src/data/mockUsers';
import { Picker } from '@react-native-picker/picker';
import { Home, Plane, UserPlus, Utensils, XCircle, Zap } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    category: any;
    totalAmount: number;
    members: { name: string; amountDue: number }[];
  }) => void;
}>;

const CATEGORIES = [
  { id: 'food', icon: Utensils, emoji: '🍽️' },
  { id: 'travel', icon: Plane, emoji: '✈️' },
  { id: 'home', icon: Home, emoji: '🏠' },
  { id: 'energy', icon: Zap, emoji: '⚡' },
];

const EMOJI_OPTIONS = ['🎁', '🍽️', '🎂', '✈️', '🎉', '🏠', '💰', '🎓'];

const createMemberKey = () => `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export function GroupFormModal({ visible, onCancel, onSubmit }: GroupFormModalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [groupName, setGroupName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(CATEGORIES[0].emoji);
  const [totalAmount, setTotalAmount] = useState('');
  const [members, setMembers] = useState<MemberInput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState(MOCK_USERS.map(u => u.name));
  const [selectedUserToAdd, setSelectedUserToAdd] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserSurname, setNewUserSurname] = useState('');

  useEffect(() => {
    if (!visible) return;
    setGroupName('');
    setSelectedEmoji(CATEGORIES[0].emoji);
    setTotalAmount('');
    setMembers([]);
    setError(null);
    setShowCreateUserModal(false);
    setShowAddMemberModal(false);
    setAvailableUsers(MOCK_USERS.map(u => u.name));
    setSelectedUserToAdd('');
    setNewUserName('');
    setNewUserSurname('');
  }, [visible]);

  const addMember = (name = '') => {
    setMembers((prev) => [...prev, { key: createMemberKey(), name, amount: '' }]);
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

    const catId = CATEGORIES.find(c => c.emoji === selectedEmoji)?.id || 'food';
    onSubmit({
      name: groupName.trim(),
      emoji: selectedEmoji,
      category: catId,
      totalAmount: parsedTotal,
      members: validMembers,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} presentationStyle="pageSheet" onRequestClose={onCancel}>
      <SafeAreaView className="flex-1 bg-black dark:bg-zinc-950">
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300 }}
            className="flex-1"
          >
            {/* Header */}
            <View className="flex-row justify-between items-center px-6 py-4">
              <Pressable onPress={onCancel} className="p-2 -ml-2">
                <Text className="text-[17px] font-semibold text-slate-500 dark:text-zinc-400">Cancel</Text>
              </Pressable>
              <Text className="text-[19px] font-bold text-slate-700 dark:text-zinc-100">New Group</Text>
              <Pressable onPress={handleSubmit} className="p-2 -mr-2">
                <Text className="text-[17px] font-bold text-slate-600 dark:text-zinc-300">Create</Text>
              </Pressable>
            </View>

            <ScrollView className="flex-1 px-8" showsVerticalScrollIndicator={false}>
              
              {/* Photo & Group Name */}
              <View className="items-center mt-6">
                
                <TextInput
                  value={groupName}
                  onChangeText={(v) => { setGroupName(v); setError(null); }}
                  placeholder="Group Name"
                  placeholderTextColor="#cbd5e1"
                  className="mt-6 text-3xl font-bold text-slate-400 dark:text-zinc-300 text-center w-full min-w-[200px]"
                />
                <View className="h-[2px] w-16 bg-slate-200 dark:bg-zinc-800 mt-2" />
              </View>

              {/* Total Amount */}
              <View className="items-center mt-12">
                <Text className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-zinc-400 mb-6 uppercase">
                  Total Amount
                </Text>
                <View className="flex-row items-center justify-center">
                  <TextInput
                    value={totalAmount}
                    onChangeText={(v) => { setTotalAmount(v); setError(null); }}
                    placeholder="0.00"
                    placeholderTextColor="#e2e8f0"
                    keyboardType="decimal-pad"
                    className="text-[64px] font-bold text-slate-200 dark:text-zinc text-center min-w-[120px]"
                    style={{ includeFontPadding: false, padding: 0 }}
                  />
                  <Text className="text-[40px] font-semibold text-slate-400 dark:text-zinc-500 ml-6">€</Text>
                </View>
                
              </View>

              {/* Category */}
              <View className="items-center mt-12 w-full">
                <Text className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-zinc-400 mb-6 uppercase">
                  Group Category
                </Text>
                <View className="flex-row justify-center gap-x-5 w-full">
                  {CATEGORIES.map((cat) => {
                    const isActive = cat.emoji === selectedEmoji;
                    const Icon = cat.icon;
                    return (
                      <Pressable
                        key={cat.id}
                        onPress={() => setSelectedEmoji(cat.emoji)}
                        className={`w-16 h-16 rounded-[20px] items-center justify-center ${
                          isActive
                            ? 'bg-blue-100 dark:bg-blue-900/40'
                            : 'bg-slate-100/80 dark:bg-zinc-900'
                        }`}
                      >
                        <Icon 
                          size={24} 
                          color={isActive ? (isDark ? '#93c5fd' : '#1e3a8a') : (isDark ? '#d4d4d8' : '#334155')} 
                          strokeWidth={isActive ? 2.5 : 2} 
                        />
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Members */}
              <View className="w-full mt-14 mb-8">
                <View className="flex-row justify-between items-center z-50 mb-6">
                  <Text className="text-[22px] font-bold text-slate-800 dark:text-zinc-100">Members</Text>
                  <Pressable 
                    onPress={() => {
                      setShowAddMemberModal(true);
                      setSelectedUserToAdd('');
                    }}
                    className="flex-row items-center bg-slate-100 dark:bg-zinc-900 px-4 py-2 rounded-xl"
                  >
                    <UserPlus size={16} color={isDark ? '#d4d4d8' : '#334155'} strokeWidth={2.5} style={{ marginRight: 8 }} />
                    <Text className="text-[15px] font-medium text-slate-700 dark:text-zinc-300">Add Member</Text>
                  </Pressable>
                </View>
                
                <View className="mt-2">

                {members.length === 0 ? (
                  <View className="py-6 items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl mb-4">
                    <Text className="text-[15px] font-medium text-zinc-500 dark:text-zinc-400 text-center px-4">
                      No members added yet. Tap "Add Member" to include people in this group.
                    </Text>
                  </View>
                ) : (
                  members.map((member, index) => {
                    const initial = member.name ? member.name.charAt(0).toUpperCase() : '?';
                    return (
                      <View key={member.key} className="flex-row items-center justify-between mb-5">
                        <View className="flex-row items-center flex-1">
                          <View className="w-12 h-12 rounded-full bg-blue-50 dark:bg-zinc-800 items-center justify-center mr-4">
                            <Text className="text-[17px] font-medium text-slate-700 dark:text-zinc-300">{initial}</Text>
                          </View>
                          <View className="flex-1 mr-4">
                            <TextInput
                              value={member.name}
                              onChangeText={(v) => updateMember(member.key, 'name', v)}
                              placeholder="Name"
                              placeholderTextColor="#94a3b8"
                              className="text-[17px] font-bold text-slate-800 dark:text-zinc-100 p-0"
                            />
                          </View>
                        </View>
                        
                        <Pressable onPress={() => removeMember(member.key)} className="ml-3 pl-1">
                          <XCircle size={18} color="#ef4444" strokeWidth={2} />
                        </Pressable>
                      </View>
                    );
                  })
                )}

                {error ? (
                  <Text className="text-sm font-medium text-red-500 dark:text-red-400 mt-4 text-center">{error}</Text>
                ) : null}
                
                <View className="h-10" />
              </View>
              </View>
            </ScrollView>
          </MotiView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <View className="absolute inset-0 z-50 px-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View className="flex-1 justify-center items-center">
              <View className="w-full max-w-sm bg-white dark:bg-zinc-800 rounded-3xl p-6 shadow-zinc-950/5 ring-1 ring-zinc-950/5">
                <Text className="text-[19px] font-bold text-slate-800 dark:text-zinc-100 mb-6">Select Member</Text>
                
                <View className="flex-row items-center space-x-3 mb-6 gap-x-3">
                  <View className="flex-1 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl min-h-[48px] justify-center border border-zinc-200 dark:border-zinc-700/50">
                    <Picker
                      selectedValue={selectedUserToAdd}
                      onValueChange={(v) => setSelectedUserToAdd(v)}
                      style={{ minHeight: 48, width: '100%', color: isDark ? '#d4d4d8' : '#334155' }}
                      dropdownIconColor={isDark ? '#d4d4d8' : '#334155'}
                      mode="dropdown"
                    >
                      <Picker.Item label="Select a user..." value="" color={isDark ? '#71717a' : '#94a3b8'} />
                      {availableUsers.map((name, idx) => (
                        <Picker.Item key={idx} label={name} value={name} color={isDark ? '#f4f4f5' : '#09090b'} />
                      ))}
                    </Picker>
                  </View>
                  
                  <Pressable 
                    onPress={() => setShowCreateUserModal(true)}
                    className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700/50 h-[48px] px-4 rounded-xl items-center justify-center flex-row"
                  >
                    <UserPlus size={18} color={isDark ? '#d4d4d8' : '#334155'} strokeWidth={2.5} />
                  </Pressable>
                </View>

                <View className="flex-row justify-end gap-x-3">
                  <Pressable 
                    onPress={() => setShowAddMemberModal(false)}
                    className="px-5 py-2.5 rounded-xl items-center justify-center bg-zinc-100 dark:bg-zinc-800"
                  >
                    <Text className="text-[16px] font-semibold text-slate-600 dark:text-zinc-300">Cancel</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => {
                      if (selectedUserToAdd) {
                        addMember(selectedUserToAdd);
                        setShowAddMemberModal(false);
                        setSelectedUserToAdd('');
                      }
                    }}
                    className={`px-5 py-2.5 rounded-xl items-center justify-center shadow-sm ${selectedUserToAdd ? 'bg-slate-800 dark:bg-zinc-100' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                    disabled={!selectedUserToAdd}
                  >
                    <Text className={`text-[16px] font-bold ${selectedUserToAdd ? 'text-white dark:text-zinc-900' : 'text-slate-400 dark:text-zinc-500'}`}>Save</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}

      {/* Create New User Modal */}
      {showCreateUserModal && (
        <View className="absolute inset-0 z-[60] px-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View className="flex-1 justify-center items-center">
              <View className="w-full max-w-sm bg-white dark:bg-zinc-800 rounded-3xl p-6 shadow-zinc-950/5 ring-1 ring-zinc-950/5">
                <Text className="text-[19px] font-bold text-slate-800 dark:text-zinc-100 mb-6">Create New User</Text>
                
                <TextInput
                  value={newUserName}
                  onChangeText={setNewUserName}
                  placeholder="First Name"
                  placeholderTextColor={isDark ? '#71717a' : '#94a3b8'}
                  className="bg-zinc-50 dark:bg-zinc-900/50 px-4 py-3.5 rounded-xl text-[16px] text-slate-800 dark:text-zinc-100 mb-3 border border-zinc-200 dark:border-zinc-700/50"
                />
                <TextInput
                  value={newUserSurname}
                  onChangeText={setNewUserSurname}
                  placeholder="Surname"
                  placeholderTextColor={isDark ? '#71717a' : '#94a3b8'}
                  className="bg-zinc-50 dark:bg-zinc-900/50 px-4 py-3.5 rounded-xl text-[16px] text-slate-800 dark:text-zinc-100 mb-8 border border-zinc-200 dark:border-zinc-700/50"
                />
                
                <View className="flex-row justify-end gap-x-3">
                  <Pressable 
                    onPress={() => setShowCreateUserModal(false)}
                    className="px-5 py-2.5 rounded-xl items-center justify-center bg-zinc-100 dark:bg-zinc-800"
                  >
                    <Text className="text-[16px] font-semibold text-slate-600 dark:text-zinc-300">Cancel</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => {
                      const fullName = `${newUserName.trim()} ${newUserSurname.trim()}`.trim();
                      if (fullName) {
                        setAvailableUsers(prev => [...prev, fullName]);
                        setSelectedUserToAdd(fullName);
                        setShowCreateUserModal(false);
                        setNewUserName('');
                        setNewUserSurname('');
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl items-center justify-center bg-slate-800 dark:bg-zinc-100 shadow-sm"
                  >
                    <Text className="text-[16px] font-bold text-white dark:text-zinc-900">Add User</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </Modal>
  );
}
