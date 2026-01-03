import BlogPageClient from '@/components/custom/BlogPageClient';
import type { Article } from '@/types/article';

const articles: Article[] = [
  {
    slug: 'lambs',
    title: 'Silence of the Lambs',
    description: '',
    date: 'January 2nd, 2026',
    status: 'in_progress',
  },
  {
    slug: 'beads',
    title: 'beaver',
    description: 'Long-Horizon Tasks with Persistent Memory in Claude Code',
    date: 'December 23rd, 2025',
    status: 'in_progress',
  },
];

export default function BlogPage() {
  return <BlogPageClient articles={articles} />;
}
