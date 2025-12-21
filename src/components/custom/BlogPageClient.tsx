'use client';

import { useAppTheme } from '@/contexts/AppThemeContext';
import AnimatedBlogContent from './AnimatedBlogContent';

interface Article {
  slug: string;
  title: string;
  description: string;
  date: string;
}

interface BlogPageClientProps {
  articles: Article[];
}

export default function BlogPageClient({ articles }: BlogPageClientProps) {
  const { theme } = useAppTheme();

  const isDark = theme === 'dark';

  if (articles.length === 0) {
    return (
      <div
        className={`min-h-screen w-full flex items-center justify-center transition-colors duration-300 ${
          isDark ? 'bg-black text-white' : 'bg-[#FFFBF0] text-[#1a1a1a]'
        }`}
      >
        <h1 className="text-4xl font-thin">No articles found</h1>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen w-full relative overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-black text-white' : 'bg-[#FFFBF0] text-[#1a1a1a]'
      }`}
    >
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
      <AnimatedBlogContent articles={articles} />
    </div>
  );
}
