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
  const files = await fs.readdir(articlesDirectory);
  
  return files.map(filename => ({
    slug: filename.replace('.md', '')
  }));
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);
  
  if (!article) {
    notFound();
  }

  return <ArticleComponent article={article} />;
}