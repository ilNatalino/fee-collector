import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';

export type ThemeMode = 'light' | 'dark';

export const getNavigationTheme = (mode: ThemeMode): Theme => {
  const base = mode === 'dark' ? DarkTheme : DefaultTheme;

  if (mode === 'dark') {
    return {
      ...base,
      colors: {
        ...base.colors,
        background: '#09090b', // zinc-950
        card: '#18181b',       // zinc-900
        text: '#fafafa',       // zinc-50
        border: '#27272a',     // zinc-800
        primary: '#818cf8',    // indigo-400
        notification: '#818cf8',
      },
    };
  }

  return {
    ...base,
    colors: {
      ...base.colors,
      background: '#fafafa',   // zinc-50
      card: '#ffffff',         // white
      text: '#09090b',         // zinc-950
      border: '#e4e4e7',       // zinc-200
      primary: '#6366f1',      // indigo-500
      notification: '#6366f1',
    },
  };
};
