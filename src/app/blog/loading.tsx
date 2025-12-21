'use client';

import { useAppTheme } from '@/contexts/AppThemeContext';

export default function BlogLoading() {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
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

      {/* Header skeleton */}
      <div className="border-b" style={{ borderColor: isDark ? 'rgba(var(--theme-primary-rgb), 0.2)' : 'rgba(26, 26, 26, 0.1)' }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div
            className="h-8 w-24 rounded animate-pulse"
            style={{ backgroundColor: isDark ? 'rgba(var(--theme-primary-rgb), 0.15)' : 'rgba(26, 26, 26, 0.1)' }}
          />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 w-8 rounded animate-pulse"
                style={{
                  backgroundColor: isDark ? 'rgba(var(--theme-primary-rgb), 0.1)' : 'rgba(26, 26, 26, 0.08)',
                  animationDelay: `${i * 50}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Blog content skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div
          className="h-12 w-48 rounded mb-8 animate-pulse"
          style={{ backgroundColor: isDark ? 'rgba(var(--theme-primary-rgb), 0.15)' : 'rgba(26, 26, 26, 0.1)' }}
        />

        {/* Blog posts list */}
        <div className="space-y-6">
          {[1, 2, 3, 4].map((post) => (
            <div
              key={post}
              className="p-4 rounded-lg border animate-pulse"
              style={{
                borderColor: isDark ? 'rgba(var(--theme-primary-rgb), 0.2)' : 'rgba(26, 26, 26, 0.1)',
                backgroundColor: isDark ? 'rgba(var(--theme-primary-rgb), 0.03)' : 'rgba(26, 26, 26, 0.02)',
                animationDelay: `${post * 100}ms`,
              }}
            >
              {/* Post title */}
              <div
                className="h-6 w-3/4 rounded mb-3"
                style={{ backgroundColor: isDark ? 'rgba(var(--theme-primary-rgb), 0.15)' : 'rgba(26, 26, 26, 0.1)' }}
              />
              {/* Post meta */}
              <div className="flex gap-4 mb-3">
                <div
                  className="h-4 w-24 rounded"
                  style={{ backgroundColor: isDark ? 'rgba(var(--theme-primary-rgb), 0.1)' : 'rgba(26, 26, 26, 0.08)' }}
                />
                <div
                  className="h-4 w-16 rounded"
                  style={{ backgroundColor: isDark ? 'rgba(var(--theme-primary-rgb), 0.1)' : 'rgba(26, 26, 26, 0.08)' }}
                />
              </div>
              {/* Post excerpt */}
              <div className="space-y-2">
                <div
                  className="h-4 w-full rounded"
                  style={{ backgroundColor: isDark ? 'rgba(var(--theme-primary-rgb), 0.08)' : 'rgba(26, 26, 26, 0.06)' }}
                />
                <div
                  className="h-4 w-4/5 rounded"
                  style={{ backgroundColor: isDark ? 'rgba(var(--theme-primary-rgb), 0.08)' : 'rgba(26, 26, 26, 0.06)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
