import { MotiView } from 'moti';
import { Text } from 'react-native';

type StatCardProps = {
  label: string;
  value: string;
  valueColor?: string;
  delay?: number;
};

export function StatCard({ label, value, valueColor, delay = 0 }: StatCardProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500, delay }}
      className="w-[48.5%] rounded-4xl border-[0.5px] border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-4 px-3.5"
    >
      <Text className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
        {label}
      </Text>
      <Text
        className="text-2xl font-light text-zinc-900 dark:text-zinc-100"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </Text>
    </MotiView>
  );
}
