import { MotiView } from 'moti';
import { ScrollView, Text, View } from 'react-native';

import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { UserQuota } from '@/src/types/quota';

interface GroupMembersListProps {
  members: UserQuota[];
}

export function GroupMembersList({ members }: GroupMembersListProps) {
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
      horizontal 
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={{ paddingRight: 20 }}
    >
      {members.map((member, index) => (
        <MotiView
          key={member.id}
          from={{ opacity: 0, scale: 0.9, translateY: 10 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: index * 100 }}
          className="mr-5"
        >
          <AnimatedPressable className="items-center w-[72px]">
            <View className="w-16 h-16 rounded-3xl shadow-sm shadow-zinc-950/5 dark:ring-white/10 bg-white dark:bg-zinc-900 items-center justify-center mb-2.5">
              <Text className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {getInitials(member.name)}
              </Text>
            </View>
            <Text className="text-xs text-center text-zinc-500 dark:text-zinc-400" numberOfLines={1}>
              {getFirstName(member.name)}
            </Text>
          </AnimatedPressable>
        </MotiView>
      ))}
    </ScrollView>
  );
}
