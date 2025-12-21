'use client';

import { useEffect } from 'react';
import { useAppTheme } from '@/contexts/AppThemeContext';
import { useThemeColor } from '@/contexts/ThemeColorContext';

export function GlobalKeybinds() {
  const { toggleTheme } = useAppTheme();
  const { cycleColor } = useThemeColor();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if modifier keys are pressed (except for specific combos)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Global keybinds (without shift)
      if (!e.shiftKey) {
        if (e.key === 't') {
          e.preventDefault();
          toggleTheme();
        } else if (e.key === 'c') {
          e.preventDefault();
          cycleColor();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme, cycleColor]);

  return null;
}
