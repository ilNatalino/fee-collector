import { StyleSheet, Switch, Text, View } from 'react-native';

import { Screen } from '@/src/components/Screen';
import { useTheme } from '@/src/hooks/useTheme';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <Screen>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.row}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Dark mode</Text>
            <Text style={[styles.description, { color: colors.muted }]}>Use a dark visual theme</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.track, true: `${colors.primary}99` }}
            thumbColor={isDark ? colors.primary : '#ffffff'}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 10
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    marginTop: 4,
    fontSize: 13,
  },
});
