import { Check, Clock } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useColorScheme } from 'nativewind';
import { ScrollView, Text, View } from 'react-native';

import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { UserQuota } from '@/src/types/quota';

interface GroupMembersListProps {
  members: UserQuota[];
}

export function GroupMembersList({ members }: GroupMembersListProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getFirstName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[1][0]}.`;
    }
    return parts[0];
  };

  return (
    <ScrollView 
      showsVerticalScrollIndicator={false} 
      contentContainerStyle={{ paddingBottom: 24 }}
      className="w-full"
    >
      {members.map((member, index) => {
        const amountPaid = member.amountPaid ?? (member.hasPaid ? member.amountDue : 0);
        const isPartial = amountPaid > 0 && amountPaid < member.amountDue;
        const isFullyPaid = member.hasPaid || amountPaid >= member.amountDue;

        return (
          <MotiView
            key={member.id}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 90, delay: index * 50 }}
            className="w-full mb-3"
          >
            <AnimatedPressable className="flex-row items-center w-full bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm shadow-zinc-950/5 ring-1 ring-zinc-950/5 dark:ring-white/10">
              <View className="relative mr-4">
                <View className={`w-12 h-12 rounded-full items-center justify-center ${
                  isFullyPaid ? 'bg-emerald-50 dark:bg-emerald-500/10' : 
                  isPartial ? 'bg-amber-50 dark:bg-amber-500/10' :
                  'bg-zinc-100 dark:bg-zinc-800'
                }`}>
                  <Text className={`text-base font-semibold ${
                    isFullyPaid ? 'text-emerald-700 dark:text-emerald-400' : 
                    isPartial ? 'text-amber-700 dark:text-amber-400' :
                    'text-zinc-900 dark:text-zinc-100'
                  }`}>
                    {getInitials(member.name)}
                  </Text>
                </View>
                
                <View className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full items-center justify-center border-2 border-white dark:border-zinc-900 ${
                  isFullyPaid ? 'bg-emerald-500' : 
                  isPartial ? 'bg-amber-500' :
                  'bg-zinc-300 dark:bg-zinc-700'
                }`}>
                  {isFullyPaid ? (
                    <Check size={10} color="#ffffff" strokeWidth={3.5} />
                  ) : (
                    <Clock size={10} color="#ffffff" strokeWidth={3} />
                  )}
                </View>
              </View>
              
              <View className="flex-1 justify-center">
                <Text className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100" numberOfLines={1}>
                  {member.name}
                </Text>
                <Text className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5" numberOfLines={1}>
                  {isFullyPaid ? 'Paid in full' : isPartial ? 'Partially paid' : ''}
                </Text>
              </View>
              
              <View className="items-end justify-center ml-2">
                <Text className={`text-base font-bold ${
                  isFullyPaid ? 'text-emerald-600 dark:text-emerald-400' : 
                  isPartial ? 'text-amber-600 dark:text-amber-400' :
                  'text-zinc-900 dark:text-zinc-100'
                }`}>
                  €{member.amountDue.toFixed(2)}
                </Text>
                {isPartial && (
                  <Text className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                    €{amountPaid.toFixed(2)} paid
                  </Text>
                )}
              </View>
            </AnimatedPressable>
          </MotiView>
        );
      })}
    </ScrollView>
  );
}
