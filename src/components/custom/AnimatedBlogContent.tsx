'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16"
    >
      <h1 className="text-8xl font-thin mb-12 text-red-500 tracking-widest">Parambles</h1>
      <ul className="w-full max-w-3xl space-y-8">
        {articles.map((article) => (
          <motion.li
            key={article.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="border-b border-gray-700 pb-6"
          >
            <Link href={`/blog/${article.slug}`}>
              <div className="block group cursor-pointer">
                <div className="flex justify-between items-baseline mb-2">
                  <h2 className="text-3xl font-thin group-hover:text-red-500 transition-colors duration-300">
                    {article.title}
                  </h2>
                  <span className="text-sm text-gray-400">{article.date}</span>
                </div>
                <p className="text-sm text-gray-300">{article.description}</p>
              </div>
            </Link>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}