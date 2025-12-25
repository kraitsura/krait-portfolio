'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export type AppTheme = 'dark' | 'light';

interface AppThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const AppThemeContext = createContext<AppThemeContextType | undefined>(undefined);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const { setTheme: setNextTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use resolvedTheme to get the actual theme (handles system theme)
  // Default to 'dark' before mounting to match SSR
  const theme: AppTheme = mounted
    ? (resolvedTheme === 'light' ? 'light' : 'dark')
    : 'dark';

  // Apply data-theme attribute for any CSS that uses it
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: AppTheme) => {
    setNextTheme(newTheme);
  };

  const toggleTheme = () => {
    setNextTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <AppThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within an AppThemeProvider');
  }
  return context;
}
