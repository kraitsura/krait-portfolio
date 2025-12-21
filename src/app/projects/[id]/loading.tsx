'use client';

import { useAppTheme } from '@/contexts/AppThemeContext';

export default function ProjectDetailLoading() {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`fixed inset-0 overflow-hidden flex flex-col font-mono transition-colors duration-300 ${
        isDark ? 'bg-[#0a0a0a] text-gray-100' : 'bg-white text-gray-900'
      }`}
    >
      {/* Top Bar Skeleton */}
      <div
        className={`border-b px-4 md:px-6 py-3 flex items-center justify-between ${
          isDark ? 'border-gray-800' : 'border-gray-200'
        }`}
      >
        <div className="flex-1 min-w-0">
          <div
            className={`h-5 w-48 rounded mb-2 animate-pulse ${
              isDark ? 'bg-gray-800' : 'bg-gray-200'
            }`}
          />
          <div
            className={`h-3 w-64 rounded animate-pulse ${
              isDark ? 'bg-gray-800' : 'bg-gray-200'
            }`}
          />
        </div>
        <div className="flex items-center gap-1 ml-4 flex-shrink-0">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded animate-pulse ${
                isDark ? 'bg-gray-800' : 'bg-gray-200'
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative min-h-0">
        {/* Image Area Skeleton */}
        <div
          className={`w-full h-[40vh] md:h-auto md:w-[55%] relative border-b md:border-b-0 md:border-r flex-shrink-0 overflow-hidden ${
            isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'
          }`}
        >
          {/* Loading indicator in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Spinning ring */}
              <div
                className={`w-12 h-12 rounded-full border-2 animate-spin ${
                  isDark ? 'border-gray-700 border-t-gray-400' : 'border-gray-200 border-t-gray-500'
                }`}
              />
              {/* Center dot */}
              <div
                className={`absolute inset-0 m-auto w-2 h-2 rounded-full animate-pulse ${
                  isDark ? 'bg-gray-600' : 'bg-gray-400'
                }`}
              />
            </div>
          </div>

          {/* Image navigation dots skeleton */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full animate-pulse ${
                  isDark ? 'bg-gray-700' : 'bg-gray-300'
                }`}
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Info Area Skeleton */}
        <div className="w-full md:w-[45%] overflow-y-auto px-4 md:px-6 py-4 flex-1 min-h-0 h-[60vh] md:h-auto">
          {/* Technologies Skeleton */}
          <div
            className={`mb-4 pb-4 border-b ${
              isDark ? 'border-gray-800' : 'border-gray-100'
            }`}
          >
            <div
              className={`h-3 w-24 rounded mb-2 animate-pulse ${
                isDark ? 'bg-gray-800' : 'bg-gray-200'
              }`}
            />
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-6 rounded animate-pulse ${
                    isDark ? 'bg-gray-800' : 'bg-gray-200'
                  }`}
                  style={{
                    width: `${40 + Math.random() * 30}px`,
                    animationDelay: `${i * 50}ms`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Metadata Skeleton */}
          <div
            className={`mb-4 pb-4 border-b grid grid-cols-2 gap-3 ${
              isDark ? 'border-gray-800' : 'border-gray-100'
            }`}
          >
            <div>
              <div
                className={`h-3 w-16 rounded mb-1 animate-pulse ${
                  isDark ? 'bg-gray-800' : 'bg-gray-200'
                }`}
              />
              <div
                className={`h-4 w-24 rounded animate-pulse ${
                  isDark ? 'bg-gray-700' : 'bg-gray-300'
                }`}
              />
            </div>
            <div>
              <div
                className={`h-3 w-16 rounded mb-1 animate-pulse ${
                  isDark ? 'bg-gray-800' : 'bg-gray-200'
                }`}
              />
              <div
                className={`h-4 w-20 rounded animate-pulse ${
                  isDark ? 'bg-gray-700' : 'bg-gray-300'
                }`}
              />
            </div>
          </div>

          {/* About Skeleton */}
          <div>
            <div
              className={`h-3 w-16 rounded mb-2 animate-pulse ${
                isDark ? 'bg-gray-800' : 'bg-gray-200'
              }`}
            />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-4 rounded animate-pulse ${
                    isDark ? 'bg-gray-800' : 'bg-gray-200'
                  }`}
                  style={{
                    width: i === 4 ? '75%' : '100%',
                    animationDelay: `${i * 50}ms`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Footer hint skeleton */}
          <div
            className={`mt-6 pt-4 border-t ${
              isDark ? 'border-gray-800' : 'border-gray-100'
            }`}
          >
            <div
              className={`h-3 w-64 rounded animate-pulse ${
                isDark ? 'bg-gray-800' : 'bg-gray-200'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
