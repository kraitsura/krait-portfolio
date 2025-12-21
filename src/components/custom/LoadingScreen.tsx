'use client';

import { useEffect, useState } from 'react';
import { useAppTheme } from '@/contexts/AppThemeContext';

interface LoadingScreenProps {
  variant?: 'default' | 'minimal' | 'terminal';
  message?: string;
}

const bootMessages = [
  'INITIALIZING SYSTEM...',
  'LOADING MODULES...',
  'SCANNING MEMORY...',
  'READY',
];

export default function LoadingScreen({ variant = 'default' }: LoadingScreenProps) {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';
  const [bootIndex, setBootIndex] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    // Boot sequence animation
    const bootInterval = setInterval(() => {
      setBootIndex((prev) => {
        if (prev < bootMessages.length - 1) return prev + 1;
        clearInterval(bootInterval);
        return prev;
      });
    }, 400);

    // Random glitch effect
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 100);
    }, 2000);

    return () => {
      clearInterval(bootInterval);
      clearInterval(glitchInterval);
    };
  }, []);

  if (variant === 'minimal') {
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center transition-colors duration-300 ${
          isDark ? 'bg-black' : 'bg-[#FFFBF0]'
        }`}
      >
        <div className="relative">
          {/* Pulsing ring */}
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          />
          {/* Core dot */}
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'terminal') {
    return (
      <div
        className={`fixed inset-0 font-mono overflow-hidden transition-colors duration-300 ${
          isDark ? 'bg-black' : 'bg-[#FFFBF0]'
        }`}
      >
        {/* CRT scanlines overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 2px,
              ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 4px
            )`,
          }}
        />

        {/* Corner brackets */}
        <div className="absolute inset-4 md:inset-8 pointer-events-none">
          {/* Top left */}
          <div
            className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 opacity-60"
            style={{ borderColor: 'var(--theme-primary)' }}
          />
          {/* Top right */}
          <div
            className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 opacity-60"
            style={{ borderColor: 'var(--theme-primary)' }}
          />
          {/* Bottom left */}
          <div
            className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 opacity-60"
            style={{ borderColor: 'var(--theme-primary)' }}
          />
          {/* Bottom right */}
          <div
            className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 opacity-60"
            style={{ borderColor: 'var(--theme-primary)' }}
          />
        </div>

        {/* Boot content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
          {/* Glitch effect container */}
          <div className={`relative ${glitchActive ? 'animate-glitch' : ''}`}>
            {/* Main text */}
            <div
              className="text-xs md:text-sm space-y-1 text-center"
              style={{ color: 'var(--theme-primary)' }}
            >
              {bootMessages.slice(0, bootIndex + 1).map((msg, i) => (
                <div
                  key={i}
                  className={`transition-opacity duration-200 ${
                    i === bootIndex ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  {msg}
                </div>
              ))}
            </div>

            {/* Blinking cursor */}
            <div className="mt-4 flex justify-center">
              <span
                className="inline-block w-2 h-4 animate-blink"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              />
            </div>
          </div>

          {/* Loading bar */}
          <div className="mt-8 w-48 md:w-64">
            <div
              className="h-[2px] w-full opacity-20"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            />
            <div
              className="h-[2px] animate-load-bar"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Default variant - Projects skeleton
  return (
    <div
      className={`min-h-screen p-4 md:p-8 overflow-hidden relative transition-colors duration-300 ${
        isDark ? 'bg-black' : 'bg-[#FFFBF0]'
      }`}
    >
      {/* CRT overlay for dark mode */}
      {isDark && (
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.02]"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.1) 2px,
              rgba(255,255,255,0.1) 4px
            )`,
          }}
        />
      )}

      {/* Vertical Title Skeleton */}
      <div
        className="fixed top-24 left-4 z-10"
        style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}
      >
        <div
          className="h-64 w-12 md:w-16 rounded animate-pulse"
          style={{ backgroundColor: 'rgba(var(--theme-primary-rgb), 0.15)' }}
        />
      </div>

      {/* Keyboard shortcuts skeleton */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-2 z-10 opacity-50">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="h-6 w-12 rounded animate-pulse"
              style={{
                backgroundColor: 'rgba(var(--theme-primary-rgb), 0.15)',
                animationDelay: `${i * 100}ms`,
              }}
            />
            <div
              className="h-4 w-16 rounded animate-pulse"
              style={{
                backgroundColor: 'rgba(var(--theme-primary-rgb), 0.1)',
                animationDelay: `${i * 100}ms`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Projects Grid Skeleton */}
      <div className="ml-16 md:ml-24 mt-16 md:mt-20 space-y-6 md:space-y-12">
        {[1, 2, 3].map((category) => (
          <div key={category} className="mb-12">
            {/* Category Title Skeleton */}
            <div
              className="h-8 md:h-10 w-32 md:w-40 rounded mb-3 md:mb-6 animate-pulse"
              style={{
                backgroundColor: 'rgba(var(--theme-primary-rgb), 0.15)',
                animationDelay: `${category * 150}ms`,
              }}
            />

            {/* Cards Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
              {[1, 2].map((card) => (
                <div
                  key={card}
                  className="relative aspect-video rounded-sm overflow-hidden animate-pulse border-2"
                  style={{
                    borderColor: 'var(--theme-primary)',
                    animationDelay: `${(category * 2 + card) * 100}ms`,
                  }}
                >
                  {/* Background shimmer */}
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: 'rgba(var(--theme-primary-rgb), 0.03)' }}
                  />

                  {/* Shimmer effect */}
                  <div className="absolute inset-0 shimmer-effect" />

                  {/* Tag skeletons */}
                  <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 flex flex-col items-end space-y-1 md:space-y-2 z-10">
                    {[1, 2, 3].map((tag) => (
                      <div
                        key={tag}
                        className="h-7 w-7 md:h-8 md:w-8 rounded-full animate-pulse"
                        style={{
                          backgroundColor: 'rgba(var(--theme-primary-rgb), 0.1)',
                          borderColor: 'rgba(var(--theme-primary-rgb), 0.3)',
                          borderWidth: '1px',
                          animationDelay: `${tag * 100}ms`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Bottom info skeleton */}
                  <div
                    className="absolute bottom-0 left-0 right-0 p-2 md:p-3 lg:p-4"
                    style={{
                      background: isDark
                        ? 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)'
                        : 'linear-gradient(to top, rgba(255,251,240,0.9), transparent)',
                    }}
                  >
                    <div
                      className="h-5 md:h-6 lg:h-7 w-3/4 mb-2 animate-pulse"
                      style={{ backgroundColor: 'rgba(var(--theme-primary-rgb), 0.2)' }}
                    />
                    <div className="space-y-1">
                      <div
                        className="h-3 md:h-4 w-full rounded animate-pulse"
                        style={{ backgroundColor: 'rgba(var(--theme-primary-rgb), 0.1)' }}
                      />
                      <div
                        className="h-3 md:h-4 w-4/5 rounded animate-pulse"
                        style={{ backgroundColor: 'rgba(var(--theme-primary-rgb), 0.1)' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
