'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeColor = 'amber' | 'white' | 'green' | 'blue' | 'red';

interface ThemeColorContextType {
  color: ThemeColor;
  setColor: (color: ThemeColor) => void;
}

const ThemeColorContext = createContext<ThemeColorContextType | undefined>(undefined);

export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
  const [color, setColor] = useState<ThemeColor>('amber');

  useEffect(() => {
    // Update global theme color variables (hex and RGB) when color changes
    const htmlElement = document.documentElement;

    // Remove all color classes
    const colorClasses: ThemeColor[] = ['amber', 'white', 'green', 'blue', 'red'];
    colorClasses.forEach((c) => htmlElement.classList.remove(c));

    // Add the new color class
    htmlElement.classList.add(color);

    // Update CSS variables
    const colorMap: Record<ThemeColor, { hex: string; rgb: string }> = {
      amber: { hex: '#FFAA3C', rgb: '255, 170, 60' },
      white: { hex: '#F5F5F5', rgb: '245, 245, 245' },
      green: { hex: '#00E632', rgb: '0, 230, 50' },
      blue: { hex: '#3296FF', rgb: '50, 150, 255' },
      red: { hex: '#FF2800', rgb: '255, 40, 0' },
    };

    if (colorMap[color]) {
      htmlElement.style.setProperty('--theme-primary', colorMap[color].hex);
      htmlElement.style.setProperty('--theme-primary-rgb', colorMap[color].rgb);
    }
  }, [color]);

  return (
    <ThemeColorContext.Provider value={{ color, setColor }}>
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
