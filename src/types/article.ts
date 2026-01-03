export type ArticleStatus = 'published' | 'in_progress';

export interface Article {
  slug: string;
  title: string;
  description: string;
  date: string;
  status: ArticleStatus;
}
