'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAppTheme } from './AppThemeContext';

export type ThemeColor = 'amber' | 'white' | 'green' | 'blue' | 'red';

const COLOR_OPTIONS: ThemeColor[] = ['amber', 'white', 'green', 'blue', 'red'];

// Default colors per theme mode
const DEFAULT_COLORS: Record<'dark' | 'light', ThemeColor> = {
  dark: 'amber',
  light: 'white',
};

interface ThemeColorContextType {
  color: ThemeColor;
  setColor: (color: ThemeColor) => void;
  cycleColor: () => void;
  colorOptions: readonly ThemeColor[];
  /** The actual displayed color - 'white' becomes 'black' in light mode */
  effectiveColor: ThemeColor | 'black';
}

const ThemeColorContext = createContext<ThemeColorContextType | undefined>(undefined);

export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useAppTheme();
  const [color, setColor] = useState<ThemeColor>(DEFAULT_COLORS[theme]);
  const prevTheme = useRef(theme);

  // Update color to default when theme changes
  useEffect(() => {
    if (prevTheme.current !== theme) {
      setColor(DEFAULT_COLORS[theme]);
      prevTheme.current = theme;
    }
  }, [theme]);

  // In light mode, 'white' should display as black for visibility
  const effectiveColor = theme === 'light' && color === 'white' ? 'black' : color;

  useEffect(() => {
    // Update global theme color variables (hex and RGB) when color changes
    // Guard for SSR - only run on client
    if (typeof document !== 'undefined') {
      const htmlElement = document.documentElement;

      // Remove all color classes
      const colorClasses: ThemeColor[] = ['amber', 'white', 'green', 'blue', 'red'];
      colorClasses.forEach((c) => htmlElement.classList.remove(c));

      // Add the new color class (use 'white' for class but may apply black color)
      htmlElement.classList.add(color);

      // Update CSS variables - use effectiveColor for actual display
      const colorMap: Record<ThemeColor | 'black', { hex: string; rgb: string }> = {
        amber: { hex: '#FFAA3C', rgb: '255, 170, 60' },
        white: { hex: '#F5F5F5', rgb: '245, 245, 245' },
        green: { hex: '#00E632', rgb: '0, 230, 50' },
        blue: { hex: '#3296FF', rgb: '50, 150, 255' },
        red: { hex: '#FF2800', rgb: '255, 40, 0' },
        black: { hex: '#1a1a1a', rgb: '26, 26, 26' },
      };

      if (colorMap[effectiveColor]) {
        htmlElement.style.setProperty('--theme-primary', colorMap[effectiveColor].hex);
        htmlElement.style.setProperty('--theme-primary-rgb', colorMap[effectiveColor].rgb);
      }
    }
  }, [color, effectiveColor]);

  const cycleColor = () => {
    setColor(prevColor => {
      const currentIndex = COLOR_OPTIONS.indexOf(prevColor);
      const nextIndex = (currentIndex + 1) % COLOR_OPTIONS.length;
      return COLOR_OPTIONS[nextIndex];
    });
  };

  return (
    <ThemeColorContext.Provider value={{ color, setColor, cycleColor, colorOptions: COLOR_OPTIONS, effectiveColor }}>
      {children}
    </ThemeColorContext.Provider>
  );
}

export function useThemeColor() {
  const context = useContext(ThemeColorContext);
  if (context === undefined) {
    throw new Error('useThemeColor must be used within a ThemeColorProvider');
  }
  return context;
}
