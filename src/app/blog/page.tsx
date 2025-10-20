import React from 'react';
import AnimatedBlogContent from '@/components/custom/AnimatedBlogContent';
import path from 'path';
import fs from 'fs/promises';
import matter from 'gray-matter';

interface Article {
  slug: string;
  title: string;
  description: string;
  date: string;
}

async function getArticles(): Promise<Article[]> {
  const articlesDirectory = path.join(process.cwd(), 'public/articles');

  try {
    const files = await fs.readdir(articlesDirectory);
    const mdFiles = files.filter(file => file.endsWith('.md'));

    const articles = await Promise.all(
      mdFiles.map(async (filename) => {
        const slug = filename.replace('.md', '');
        const fullPath = path.join(articlesDirectory, filename);
        const fileContents = await fs.readFile(fullPath, 'utf8');
        const { data: frontmatter } = matter(fileContents);

        return {
          slug,
          title: frontmatter.title || slug,
          description: frontmatter.description || '',
          date: frontmatter.date || new Date().toISOString(),
        };
      })
    );

    return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    console.error('Error reading articles:', err);
    return [];
  }
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