'use client';

import { useTheme as useNextThemesTheme } from 'next-themes';

export type Theme = 'light' | 'dark' | 'system';

/**
 * Thin wrapper around next-themes' useTheme so existing consumers
 * (ThemeToggle, AppearanceSettings) keep the same API. Theme state,
 * system detection, and persistence are handled by next-themes.
 */
export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextThemesTheme();

  return {
    theme: (theme ?? 'system') as Theme,
    resolvedTheme: (resolvedTheme ?? 'light') as 'light' | 'dark',
    setTheme: (nextTheme: Theme) => setTheme(nextTheme),
  };
}
