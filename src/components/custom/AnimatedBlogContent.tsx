'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import BlogToolbar from './BlogToolbar';
import { useTouchDevice } from '@/contexts/TouchContext';
import { useAppTheme } from '@/contexts/AppThemeContext';

interface Article {
  slug: string;
  title: string;
  description: string;
  date: string;
}

interface AnimatedBlogContentProps {
  articles: Article[];
}

export default function AnimatedBlogContent({ articles }: AnimatedBlogContentProps) {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { isTouchDevice } = useTouchDevice();
  const isDark = theme === 'dark';

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter articles based on search query
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const query = searchQuery.toLowerCase();
    return articles.filter(article =>
      article.title.toLowerCase().includes(query) ||
      article.description.toLowerCase().includes(query)
    );
  }, [articles, searchQuery]);

  // Reset selected index when filtered articles change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredArticles.length]);

  // Focus search input when entering search mode
  useEffect(() => {
    if (isSearching && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearching]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keys when typing in search input
      if (isSearching) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsSearching(false);
          setSearchQuery('');
        } else if (e.key === 'Enter' && filteredArticles.length > 0) {
          e.preventDefault();
          router.push(`/blog/${filteredArticles[selectedIndex].slug}`);
        }
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        router.back();
      } else if (e.key === 'j') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredArticles.length - 1));
      } else if (e.key === 'k') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === '/') {
        e.preventDefault();
        setIsSearching(true);
      } else if (e.key === 'Enter' && filteredArticles.length > 0) {
        e.preventDefault();
        router.push(`/blog/${filteredArticles[selectedIndex].slug}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearching, selectedIndex, filteredArticles, router]);

  return (
    <>
      <BlogToolbar />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 sm:px-8 py-12 sm:py-16"
      >
        {/* Title / Search */}
        {isSearching ? (
          <div className="relative mb-8 sm:mb-12 w-full max-w-3xl">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="search..."
              className={`w-full text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-thin tracking-widest bg-transparent border-none outline-none transition-colors duration-300 text-center ${
                isDark ? 'text-red-500 placeholder-red-500/30' : 'text-red-600 placeholder-red-600/30'
              }`}
              style={{ caretColor: isDark ? '#ef4444' : '#dc2626' }}
            />
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs transition-colors duration-300 ${
              isDark ? 'text-gray-500' : 'text-[#1a1a1a]/40'
            }`}>
              esc to cancel
            </div>
          </div>
        ) : (
          <h1
            onClick={() => setIsSearching(true)}
            className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-thin mb-8 sm:mb-12 tracking-widest transition-colors duration-300 cursor-pointer hover:opacity-70 ${
              isDark ? 'text-red-500' : 'text-red-600'
            }`}
          >
            parabarambling
          </h1>
        )}

        {/* Article List */}
        <ul className="w-full max-w-3xl space-y-6 sm:space-y-8">
          {filteredArticles.map((article, index) => {
            const isSelected = index === selectedIndex;
            return (
              <motion.li
                key={article.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`border-b pb-4 sm:pb-6 transition-all duration-200 ${
                  isDark ? 'border-gray-700' : 'border-[#1a1a1a]/20'
                } ${isSelected ? 'translate-x-2' : ''}`}
              >
                <Link href={`/blog/${article.slug}`}>
                  <div className={`block group cursor-pointer p-3 -m-3 rounded-lg transition-all duration-200 ${
                    isSelected
                      ? isDark
                        ? 'bg-white/5 ring-1 ring-red-500/30'
                        : 'bg-black/5 ring-1 ring-red-600/30'
                      : ''
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-4 mb-2">
                      <h2 className={`text-xl sm:text-2xl md:text-3xl font-thin transition-colors duration-300 ${
                        isSelected
                          ? isDark ? 'text-red-500' : 'text-red-600'
                          : isDark ? 'group-hover:text-red-500' : 'group-hover:text-red-600'
                      }`}>
                        {isSelected && <span className="mr-2 opacity-60">▸</span>}
                        {article.title}
                      </h2>
                      <span className={`text-xs sm:text-sm transition-colors duration-300 shrink-0 ${
                        isDark ? 'text-gray-400' : 'text-[#1a1a1a]/60'
                      }`}>
                        {article.date}
                      </span>
                    </div>
                    <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-[#1a1a1a]/70'
                    }`}>
                      {article.description}
                    </p>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ul>

        {/* No results message */}
        {filteredArticles.length === 0 && searchQuery && (
          <p className={`text-sm mt-8 transition-colors duration-300 ${
            isDark ? 'text-gray-500' : 'text-[#1a1a1a]/50'
          }`}>
            no posts found for &quot;{searchQuery}&quot;
          </p>
        )}

        {/* Keybind hints */}
        {!isTouchDevice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className={`mt-12 text-[10px] tracking-wider transition-colors duration-300 ${
              isDark ? 'text-gray-600' : 'text-[#1a1a1a]/30'
            }`}
          >
            j/k: nav | ⏎: open | /: search | t: theme | ⌫: back
          </motion.div>
        )}
      </motion.div>
    </>
  );
}
