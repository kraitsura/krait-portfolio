'use client';

import { motion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppTheme } from '@/contexts/AppThemeContext';
import { useTouchDevice } from '@/contexts/TouchContext';
import BlogToolbar from './BlogToolbar';
import ContentLock from './ContentLock';
import type { ArticleStatus } from '@/types/article';

interface ArticleLayoutProps {
  children: ReactNode;
  category?: string;
  title: string;
  intro?: ReactNode;
  status?: ArticleStatus;
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
  status = 'published',
}: ArticleLayoutProps) {
  const { theme } = useAppTheme();
  const { isTouchDevice } = useTouchDevice();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';
  const isLocked = status === 'in_progress';

  // Keyboard navigation for articles
  useEffect(() => {
    const SCROLL_LINE = 60; // pixels for j/k
    const SCROLL_PAGE = window.innerHeight * 0.8; // 80% of viewport for u/d

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if locked (ContentLock handles it)
      // Check for dev mode bypass
      const devMode = new URLSearchParams(window.location.search).has('dev');
      if (isLocked && !devMode) return;

      switch (e.key) {
        case 'Backspace':
          e.preventDefault();
          router.back();
          break;
        case 'j':
          e.preventDefault();
          window.scrollBy({ top: SCROLL_LINE, behavior: 'smooth' });
          break;
        case 'k':
          e.preventDefault();
          window.scrollBy({ top: -SCROLL_LINE, behavior: 'smooth' });
          break;
        case 'u':
          e.preventDefault();
          if (e.ctrlKey) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            window.scrollBy({ top: -SCROLL_PAGE, behavior: 'smooth' });
          }
          break;
        case 'd':
          e.preventDefault();
          if (e.ctrlKey) {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          } else {
            window.scrollBy({ top: SCROLL_PAGE, behavior: 'smooth' });
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, router]);

  return (
    <ContentLock isLocked={isLocked}>
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

      {/* Keybind hints - hidden on mobile */}
      {!isTouchDevice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 text-[10px] tracking-wider z-20 ${
            isDark ? 'text-gray-600' : 'text-[#1a1a1a]/30'
          }`}
        >
          j/k: scroll | u/d: page | ^u/^d: top/bottom | t: theme | ⌫: back
        </motion.div>
      )}
      </div>
    </ContentLock>
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

interface ArticleImageProps {
  src: string;
  alt: string;
  caption?: string;
}

export function ArticleImage({ src, alt, caption }: ArticleImageProps) {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return (
    <figure className="my-8">
      <div
        className="rounded-lg overflow-hidden relative"
        style={{
          borderWidth: '1px',
          borderColor: isDark
            ? 'rgba(var(--theme-primary-rgb), 0.2)'
            : 'rgba(var(--theme-primary-rgb), 0.15)',
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={675}
          className="w-full h-auto"
          quality={85}
          sizes="(max-width: 768px) 100vw, 768px"
        />
      </div>
      {caption && (
        <figcaption
          className="text-sm text-center mt-3"
          style={{
            color: isDark
              ? 'rgba(var(--theme-primary-rgb), 0.6)'
              : 'rgba(var(--theme-primary-rgb), 0.7)',
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
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
