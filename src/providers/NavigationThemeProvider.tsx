import { Theme, ThemeProvider } from '@react-navigation/native';
import { PropsWithChildren } from 'react';

export function NavigationThemeProvider({
  children,
  value,
}: PropsWithChildren<{ value: Theme }>) {
  return <ThemeProvider value={value}>{children}</ThemeProvider>;
}
