import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getStoredThemeMode, storeThemeMode } from '@/src/storage/themeStorage';

type ColorSchemeContextValue = {
  isDark: boolean;
  colorScheme: 'light' | 'dark';
  toggleTheme: () => void;
};

const ColorSchemeContext = createContext<ColorSchemeContextValue | undefined>(undefined);

export function ColorSchemeProvider({ children }: PropsWithChildren) {
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    const hydrate = async () => {
      const stored = await getStoredThemeMode();
      if (stored && mounted) {
        setColorScheme(stored);
      }
      if (mounted) setHydrated(true);
    };
    hydrate();
    return () => { mounted = false; };
  }, [setColorScheme]);

  const toggleTheme = useCallback(() => {
    const next = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(next);
    storeThemeMode(next);
  }, [colorScheme, setColorScheme]);

  const value = useMemo(
    () => ({
      isDark: colorScheme === 'dark',
      colorScheme: colorScheme ?? 'light',
      toggleTheme,
    }),
    [colorScheme, toggleTheme],
  );

  if (!hydrated) return null;

  return (
    <ColorSchemeContext.Provider value={value}>
      {children}
    </ColorSchemeContext.Provider>
  );
}

export function useColorSchemeContext(): ColorSchemeContextValue {
  const ctx = useContext(ColorSchemeContext);
  if (!ctx) {
    throw new Error('useColorSchemeContext must be used inside ColorSchemeProvider');
  }
  return ctx;
}
