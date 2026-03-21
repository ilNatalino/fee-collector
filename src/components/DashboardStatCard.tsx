import { MotiView } from 'moti';
import { Text } from 'react-native';

type DashboardStatCardProps = {
  label: string;
  value: string;
  subLabel?: string;
  subLabelColor?: string;
  delay?: number;
};

export function DashboardStatCard({ label, value, subLabel, delay = 0 }: DashboardStatCardProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500, delay }}
      className="flex-1 rounded-3xl shadow-sm shadow-zinc-950/5 dark:ring-white/10 bg-white dark:bg-zinc-900 py-4 px-3.5"
    >
      {/* center text */}
      <Text className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1.5">
        {label}
      </Text>
      <Text className="text-2xl font-light text-zinc-900 dark:text-zinc-100">
        {value}
      </Text>
      {subLabel ? (
        <Text className="text-[11px] font-medium text-emerald-500 dark:text-emerald-400 mt-1">
          {subLabel}
        </Text>
      ) : null}
    </MotiView>
  );
}
