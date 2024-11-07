import matter from 'gray-matter';

export interface ArticleMetadata {
  title: string;
  date: string;
  images: string[];
  [key: string]: any; // For other potential frontmatter fields
}

export interface Article {
  slug: string;
  content: string;
  metadata: ArticleMetadata;
}

export class ArticleNotFoundError extends Error {
  constructor(slug: string) {
    super(`Article with slug "${slug}" not found`);
  }
}

export async function getArticle(slug: string): Promise<Article> {
  try {
    const response = await fetch(`/articles/${slug}.md`);
    
    if (!response.ok) {
      throw new ArticleNotFoundError(slug);
    }
    
    const fileContents = await response.text();
    const { data: frontmatter, content } = matter(fileContents);
    
    return {
      slug,
      content,
      metadata: {
        title: frontmatter.title || '',
        date: frontmatter.date || '',
        images: frontmatter.images || [],
        ...frontmatter
      }
    };
  } catch (err: unknown) {
    if (err instanceof ArticleNotFoundError) {
      throw err;
    }
    throw new Error(`Failed to fetch article: ${(err as Error).message}`);
  }
}
