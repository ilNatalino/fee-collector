import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeMode } from '@/src/constants/theme';

const THEME_STORAGE_KEY = 'fantamoney_theme_mode';

export const getStoredThemeMode = async (): Promise<ThemeMode | null> => {
  try {
    const value = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (value === 'light' || value === 'dark') {
      return value;
    }

    return null;
  } catch {
    return null;
  }
};

export const storeThemeMode = async (mode: ThemeMode): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // ignore persistence errors to avoid breaking UI
  }
};
