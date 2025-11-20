import { projects } from '@/utils/projectList';
import { notFound } from 'next/navigation';
import ProjectDetailClient from '@/components/custom/ProjectDetailClient';

// Generate static params for all projects at build time
export async function generateStaticParams() {
  return projects.map((project) => ({
    id: project.id,
  }));
}

// Server component - statically generated
export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  // Await params before using
  const { id } = await params;

  // Find project
  const project = projects.find(p => p.id === id);
  const currentIndex = projects.findIndex(p => p.id === id);

  // If no project found, show 404
  if (!project) {
    notFound();
  }

  // Pass data to client component
  return <ProjectDetailClient project={project} currentIndex={currentIndex} />;
}
