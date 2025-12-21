import BlogPageClient from '@/components/custom/BlogPageClient';

const articles = [
  {
    slug: 'beads',
    title: 'beaver: beads + beads viwer',
    description: 'Long-Horizon Tasks with Persistent Memory in Claude Code',
    date: 'December 2024',
  },
];

export default function BlogPage() {
  return <BlogPageClient articles={articles} />;
}
