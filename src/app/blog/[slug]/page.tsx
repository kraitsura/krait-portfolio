import { notFound } from 'next/navigation';
import ArticleComponent from '@/components/custom/Article';
import path from 'path';
import fs from 'fs/promises';
import matter from 'gray-matter';

async function getArticle(slug: string) {
  const articlesDirectory = path.join(process.cwd(), '/public/articles');
  const fullPath = path.join(articlesDirectory, `${slug}.md`);
  
  try {
    const fileContents = await fs.readFile(fullPath, 'utf8');
    const { data: frontmatter, content } = matter(fileContents);
    
    return { 
      slug,
      title: frontmatter.title || '',
      date: frontmatter.date || '',
      images: frontmatter.images || [],
      content 
    };
  } catch (err) {
    console.error(err);
  }
}

export async function generateStaticParams() {
  const articlesDirectory = path.join(process.cwd(), '/public/articles');

  try {
    const files = await fs.readdir(articlesDirectory);
    const mdFiles = files.filter(file => file.endsWith('.md'));

    return mdFiles.map(filename => ({
      slug: filename.replace('.md', '')
    }));
  } catch (err) {
    console.error('Error reading articles directory:', err);
    return [];
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  
  if (!article) {
    notFound();
  }

  return <ArticleComponent article={article} />;
}