import React from 'react';
import { articlesInfo } from '@/utils/articlesInfo';
import AnimatedBlogContent from '@/components/custom/AnimatedBlogContent';

interface Article {
  slug: string;
  title: string;
  description: string;
  date: string;
}

async function getArticles(): Promise<Article[]> {
  // Simulate fetching articles from a data source
  const articles = Object.entries(articlesInfo).map(([slug, info]) => ({
    slug,
    title: info.title,
    description: info.description,
    date: info.date,
  }));

  return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default async function BlogPage() {
  const articles = await getArticles();

  if (articles.length === 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black text-white">
        <h1 className="text-4xl font-thin">No articles found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative bg-black text-white overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle, transparent 20%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.8) 100%),
            linear-gradient(to bottom,
              rgba(0,0,0,0.2) 0%,
              rgba(0,0,0,0.6) 50%,
              rgba(0,0,0,1) 100%)
          `
        }}
      />
      <AnimatedBlogContent articles={articles} />
    </div>
  );
}