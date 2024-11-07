'use client';
import { useRouter, useParams } from 'next/navigation';
import Image, { StaticImageData } from 'next/image';
import { Project, projects } from '@/utils/projectList';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getArticle, ArticleNotFoundError } from '@/utils/markdown';

const ProjectDetail: React.FC = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [showArticle, setShowArticle] = useState(false);

  // Find project directly
  const project = projects.find(p => p.id.toString() === id);
  
  // If no project found, redirect
  if (!project) {
    router.push('/404');
    return <div>Loading...</div>;
  }

  // Load article content
  const loadArticle = async () => {
    try {
      const article = await getArticle(project.contentPath);
      project.content = article.content;
      setTimeout(() => setShowArticle(true), 1000);
    } catch (error) {
      if (error instanceof ArticleNotFoundError) {
        console.error(`Article not found: ${error.message}`);
      } else {
        console.error('Failed to load project:', error);
      }
    }
  };

  // Load article when component mounts
  loadArticle();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 bg-black text-white p-8 flex flex-col items-center overflow-y-auto z-50"
    >
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-4xl font-bold mb-8"
      >
        {project.title}
      </motion.h1>

      <div className="w-full max-w-4xl flex flex-col items-center">
        <div className="flex flex-col md:flex-row justify-between w-full mb-8">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="md:w-[calc(50%-1rem)] mb-4 md:mb-0"
          >
            <h2 className="text-xl font-semibold mb-2">Project Details</h2>
            <p><strong>Tags:</strong> {project.tags.join(', ')}</p>
            <p><strong>Date:</strong> {project.date || 'N/A'}</p>
            <p><strong>Status:</strong> {project.status || 'N/A'}</p>
            <p><strong>Github:</strong> <a href={project.github} target="_blank" rel="noopener noreferrer">{project.github}</a></p>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="md:w-[calc(50%-1rem)]"
          >
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p>{project.description}</p>
          </motion.div>
        </div>

        <motion.div
          layoutId={`project-image-${project.id}`}
          className="w-full aspect-video relative mb-8"
        >
          <Image
            src={project.image.src}
            alt={project.title}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        </motion.div>

        <AnimatePresence>
          {showArticle && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.5 }}
              className="w-full bg-gray-900 p-6 rounded-lg prose prose-invert max-w-none"
            >
              <ReactMarkdown>{project.content}</ReactMarkdown>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="fixed bottom-8 right-8 bg-white text-black py-2 px-4 rounded-full flex items-center"
        onClick={handleGoBack}
      >
        <ArrowLeft className="mr-2" size={20} />
        Back
      </motion.button>
    </motion.div>
  );
};

export default ProjectDetail;