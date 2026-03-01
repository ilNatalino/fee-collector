import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getNavigationTheme, ThemeColors, ThemeMode, themePalette } from '@/src/constants/theme';
import { getStoredThemeMode, storeThemeMode } from '@/src/storage/themeStorage';

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  navigationTheme: ReturnType<typeof getNavigationTheme>;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    let isMounted = true;

    const hydrateTheme = async () => {
      const storedTheme = await getStoredThemeMode();
      if (storedTheme && isMounted) {
        setMode(storedTheme);
      }
    };

    hydrateTheme();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((currentMode) => {
      const nextMode = currentMode === 'dark' ? 'light' : 'dark';
      storeThemeMode(nextMode);
      return nextMode;
    });
  }, []);

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === 'dark',
      colors: themePalette[mode],
      navigationTheme: getNavigationTheme(mode),
      toggleTheme,
    }),
    [mode, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useAppTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used inside AppThemeProvider');
  }

  return context;
};
