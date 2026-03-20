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
      className="w-[48.5%] rounded-4xl shadow-sm shadow-zinc-950/5 ring-1 ring-zinc-950/5 dark:ring-white/10 bg-white dark:bg-zinc-900 py-4 px-3.5"
    >
      <Text className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2">
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
