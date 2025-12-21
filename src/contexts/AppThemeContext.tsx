'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppTheme = 'dark' | 'light';

interface AppThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const AppThemeContext = createContext<AppThemeContextType | undefined>(undefined);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>('dark');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('app-theme') as AppTheme | null;
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      setThemeState(savedTheme);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const htmlElement = document.documentElement;

    // Remove existing theme classes
    htmlElement.classList.remove('dark', 'light');

    // Add current theme class
    htmlElement.classList.add(theme);

    // Also set data attribute for next-themes compatibility
    htmlElement.setAttribute('data-theme', theme);

    // Save to localStorage
    localStorage.setItem('app-theme', theme);
  }, [theme, mounted]);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
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
