import { Tabs } from 'expo-router';
import { FileText, LayoutGrid, Settings } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Header } from '@/src/components/Header';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        header: () => <Header />,
        tabBarStyle: {
          backgroundColor: isDark ? '#18181b' : '#ffffff',
          borderTopColor: isDark ? '#27272a' : '#e4e4e7',
        },
        tabBarActiveTintColor: isDark ? '#818cf8' : '#6366f1',
        tabBarInactiveTintColor: isDark ? '#71717a' : '#a1a1aa',
        sceneStyle: { backgroundColor: isDark ? '#09090b' : '#fafafa' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <LayoutGrid color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Activity Log',
          tabBarLabel: 'Activity Log',
          tabBarIcon: ({ color, size }) => (
            <FileText color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
