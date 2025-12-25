'use client';

import { motion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import { useAppTheme } from '@/contexts/AppThemeContext';
import BlogToolbar from './BlogToolbar';

interface ArticleLayoutProps {
  children: ReactNode;
  category?: string;
  title: string;
  intro?: ReactNode;
}

/**
 * Theme-aware article layout that respects the app's theme system.
 * Uses --theme-primary for accent colors and proper dark/light mode handling.
 */
export default function ArticleLayout({
  children,
  category,
  title,
  intro,
}: ArticleLayoutProps) {
  const { theme } = useAppTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen w-full relative overflow-hidden transition-colors duration-300 ${
        mounted
          ? isDark
            ? 'bg-black text-white'
            : 'bg-[#FFFBF0] text-[#1a1a1a]'
          : 'bg-black text-white'
      }`}
    >
      {/* Dark mode gradient overlay */}
      {isDark && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `
              radial-gradient(circle, transparent 20%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.8) 100%),
              linear-gradient(to bottom,
                rgba(0,0,0,0.2) 0%,
                rgba(0,0,0,0.6) 50%,
                rgba(0,0,0,1) 100%)
            `,
          }}
        />
      )}

      <BlogToolbar />

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-3xl mx-auto px-6 sm:px-8 py-16 sm:py-24"
      >
        {/* Header */}
        <header className="mb-16 sm:mb-20">
          {category && (
            <p
              className="text-sm sm:text-base font-light tracking-wide uppercase mb-6 transition-colors duration-300"
              style={{
                color: isDark
                  ? 'rgba(var(--theme-primary-rgb), 0.6)'
                  : 'rgba(var(--theme-primary-rgb), 0.8)',
              }}
            >
              {category}
            </p>
          )}
          <h1
            className={`text-6xl sm:text-7xl lg:text-8xl font-thin mb-8 leading-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-[#1a1a1a]'
            }`}
          >
            {title}
          </h1>
          {intro && (
            <div
              className={`text-lg sm:text-xl font-light max-w-2xl leading-relaxed ${
                isDark ? 'text-gray-400' : 'text-[#1a1a1a]/70'
              }`}
            >
              {intro}
            </div>
          )}
        </header>

        {/* Content */}
        <div
          className={`prose prose-lg max-w-none ${isDark ? 'prose-invert' : ''}`}
        >
          {children}
        </div>
      </motion.article>
    </div>
  );
}

// Helper components for consistent styling
interface ArticleSectionProps {
  children: ReactNode;
  className?: string;
}

export function ArticleSection({ children, className = '' }: ArticleSectionProps) {
  return <section className={`mb-12 ${className}`}>{children}</section>;
}

interface ArticleHeadingProps {
  level?: 2 | 3;
  children: ReactNode;
}

export function ArticleHeading({ level = 2, children }: ArticleHeadingProps) {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  if (level === 3) {
    return (
      <h3
        className={`text-lg sm:text-xl font-medium mt-8 mb-4 ${
          isDark ? 'text-white' : 'text-[#1a1a1a]'
        }`}
      >
        {children}
      </h3>
    );
  }

  return (
    <h2
      className={`text-2xl sm:text-3xl font-light mb-6 ${
        isDark ? 'text-white' : 'text-[#1a1a1a]'
      }`}
    >
      {children}
    </h2>
  );
}

interface ArticleSubheadingProps {
  children: ReactNode;
}

export function ArticleSubheading({ children }: ArticleSubheadingProps) {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return (
    <h3
      className={`text-lg sm:text-xl font-light mb-6 ${
        isDark ? 'text-gray-400' : 'text-[#1a1a1a]/60'
      }`}
    >
      {children}
    </h3>
  );
}

interface ArticleParagraphProps {
  children: ReactNode;
}

export function ArticleParagraph({ children }: ArticleParagraphProps) {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return (
    <p
      className={`text-base sm:text-lg leading-relaxed mb-6 ${
        isDark ? 'text-gray-300' : 'text-[#1a1a1a]/80'
      }`}
    >
      {children}
    </p>
  );
}

interface ArticleCodeProps {
  children: ReactNode;
  inline?: boolean;
}

export function ArticleCode({ children, inline = true }: ArticleCodeProps) {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  if (inline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded text-sm"
        style={{
          backgroundColor: isDark
            ? 'rgba(var(--theme-primary-rgb), 0.15)'
            : 'rgba(var(--theme-primary-rgb), 0.1)',
          color: isDark
            ? 'rgb(var(--theme-primary-rgb))'
            : 'var(--theme-primary)',
        }}
      >
        {children}
      </code>
    );
  }

  return (
    <pre
      className="p-4 rounded-lg overflow-x-auto text-sm mb-6"
      style={{
        backgroundColor: isDark
          ? 'rgba(var(--theme-primary-rgb), 0.08)'
          : 'rgba(var(--theme-primary-rgb), 0.05)',
      }}
    >
      <code className={isDark ? 'text-gray-300' : 'text-[#1a1a1a]/80'}>
        {children}
      </code>
    </pre>
  );
}

interface ArticleBlockquoteProps {
  children: ReactNode;
}

export function ArticleBlockquote({
  children,
}: ArticleBlockquoteProps) {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className="pl-4 py-2 my-8"
      style={{
        borderLeftWidth: '2px',
        borderLeftColor: isDark
          ? 'rgba(var(--theme-primary-rgb), 0.4)'
          : 'rgba(var(--theme-primary-rgb), 0.3)',
      }}
    >
      <p
        className="text-sm italic"
        style={{
          color: isDark
            ? 'rgba(var(--theme-primary-rgb), 0.7)'
            : 'rgba(var(--theme-primary-rgb), 0.8)',
        }}
      >
        {children}
      </p>
    </div>
  );
}

interface ArticleImagePlaceholderProps {
  caption: string;
}

export function ArticleImagePlaceholder({ caption }: ArticleImagePlaceholderProps) {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className="my-8 p-8 rounded-lg"
      style={{
        backgroundColor: isDark
          ? 'rgba(var(--theme-primary-rgb), 0.05)'
          : 'rgba(var(--theme-primary-rgb), 0.03)',
        borderWidth: '1px',
        borderColor: isDark
          ? 'rgba(var(--theme-primary-rgb), 0.15)'
          : 'rgba(var(--theme-primary-rgb), 0.1)',
      }}
    >
      <p
        className="text-sm text-center"
        style={{
          color: isDark
            ? 'rgba(var(--theme-primary-rgb), 0.5)'
            : 'rgba(var(--theme-primary-rgb), 0.6)',
        }}
      >
        {caption}
      </p>
    </div>
  );
}

interface ArticleListProps {
  children: ReactNode;
  ordered?: boolean;
}

export function ArticleList({ children, ordered = false }: ArticleListProps) {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';
  const Tag = ordered ? 'ol' : 'ul';
  const listClass = ordered ? 'list-decimal' : 'list-disc';

  return (
    <Tag
      className={`${listClass} list-inside space-y-2 mb-6 ${
        isDark ? 'text-gray-300' : 'text-[#1a1a1a]/80'
      }`}
    >
      {children}
    </Tag>
  );
}

interface ArticleLinkProps {
  href: string;
  children: ReactNode;
}

export function ArticleLink({ href, children }: ArticleLinkProps) {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return (
    <a
      href={href}
      className="underline transition-colors duration-200"
      style={{
        color: 'rgb(var(--theme-primary-rgb))',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = isDark
          ? 'rgba(var(--theme-primary-rgb), 0.8)'
          : 'rgba(var(--theme-primary-rgb), 0.7)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'rgb(var(--theme-primary-rgb))';
      }}
    >
      {children}
    </a>
  );
}
