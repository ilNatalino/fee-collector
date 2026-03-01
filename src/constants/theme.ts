import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';

export type ThemeMode = 'light' | 'dark';

export type ThemeColors = {
  background: string;
  surface: string;
  text: string;
  muted: string;
  primary: string;
  success: string;
  danger: string;
  border: string;
  track: string;
};

const lightColors: ThemeColors = {
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  muted: '#64748b',
  primary: '#2563eb',
  success: '#16a34a',
  danger: '#dc2626',
  border: '#e2e8f0',
  track: '#dbeafe',
};

const darkColors: ThemeColors = {
  background: '#0b1220',
  surface: '#111827',
  text: '#f8fafc',
  muted: '#94a3b8',
  primary: '#60a5fa',
  success: '#4ade80',
  danger: '#f87171',
  border: '#1f2937',
  track: '#1e3a8a',
};

export const themePalette: Record<ThemeMode, ThemeColors> = {
  light: lightColors,
  dark: darkColors,
};

export const getNavigationTheme = (mode: ThemeMode): Theme => {
  const base = mode === 'dark' ? DarkTheme : DefaultTheme;
  const colors = themePalette[mode];

  return {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
      notification: colors.primary,
    },
  };
};
