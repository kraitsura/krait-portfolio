'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppTheme } from '@/contexts/AppThemeContext';
import { useTouchDevice } from '@/contexts/TouchContext';
import { Suspense, useEffect } from 'react';

interface ContentLockProps {
  isLocked: boolean;
  children: React.ReactNode;
}

function ContentLockInner({ isLocked, children }: ContentLockProps) {
  const { theme } = useAppTheme();
  const { isTouchDevice } = useTouchDevice();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isDark = theme === 'dark';

  // Check for ?dev parameter to bypass lock
  const devMode = searchParams.has('dev');
  const showLock = isLocked && !devMode;

  // Keyboard navigation for locked state
  useEffect(() => {
    if (!showLock) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        router.push('/blog');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLock, router]);

  return (
    <div className="relative">
      {children}

      {showLock && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{
            backgroundColor: isDark
              ? 'rgba(0, 0, 0, 0.97)'
              : 'rgba(255, 251, 240, 0.97)',
          }}
        >
          <div className="text-center px-6">
            {/* Lock Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mb-8"
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto"
                style={{
                  color: isDark
                    ? 'rgba(var(--theme-primary-rgb), 0.5)'
                    : 'rgba(var(--theme-primary-rgb), 0.6)',
                }}
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </motion.div>

            {/* Coming Soon Text */}
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className={`text-3xl sm:text-4xl font-thin tracking-[0.2em] uppercase mb-4 ${
                isDark ? 'text-white' : 'text-[#1a1a1a]'
              }`}
            >
              Coming Soon
            </motion.h2>

            {/* Subtext */}
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className={`text-sm sm:text-base font-light ${
                isDark ? 'text-gray-500' : 'text-[#1a1a1a]/50'
              }`}
            >
              This article is still being written
            </motion.p>

            {/* Decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-8 mx-auto w-24 h-px"
              style={{
                backgroundColor: isDark
                  ? 'rgba(var(--theme-primary-rgb), 0.3)'
                  : 'rgba(var(--theme-primary-rgb), 0.4)',
              }}
            />
          </div>

          {/* Keybind hints - hidden on mobile */}
          {!isTouchDevice && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className={`fixed bottom-8 text-[10px] tracking-wider ${
                isDark ? 'text-gray-600' : 'text-[#1a1a1a]/30'
              }`}
            >
              ⌫: back | t: theme
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function ContentLock({ isLocked, children }: ContentLockProps) {
  return (
    <Suspense fallback={<div className="relative">{children}</div>}>
      <ContentLockInner isLocked={isLocked}>
        {children}
      </ContentLockInner>
    </Suspense>
  );
}
