'use client';

import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useAppTheme } from '@/contexts/AppThemeContext';

export default function BlogToolbar() {
  const { theme, toggleTheme } = useAppTheme();
  const pathname = usePathname();
  const router = useRouter();

  const isDark = theme === 'dark';
  const isArticlePage = pathname.startsWith('/blog/') && pathname !== '/blog';
  const backHref = isArticlePage ? '/blog' : '/';

  const handleBack = () => {
    router.push(backHref);
  };

  // Use theme colors for buttons
  const buttonBgStyle = {
    backgroundColor: isDark
      ? 'rgba(var(--theme-primary-rgb), 0.1)'
      : 'rgba(var(--theme-primary-rgb), 0.08)',
  };

  const iconStyle = {
    color: isDark
      ? 'rgba(var(--theme-primary-rgb), 0.7)'
      : 'rgba(var(--theme-primary-rgb), 0.8)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.8 }}
      className="fixed left-3 sm:left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3"
    >
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="p-2 rounded-full transition-all duration-300 hover:scale-110"
        style={buttonBgStyle}
        aria-label={isArticlePage ? 'Back to blog' : 'Back to home'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={iconStyle}
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
      </button>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full transition-all duration-300 hover:scale-110"
        style={buttonBgStyle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={iconStyle}
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={iconStyle}
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        )}
      </button>
    </motion.div>
  );
}
