'use client';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { projects } from '@/utils/projectList';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const ProjectDetail: React.FC = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [project, setProject] = useState<any>(null);
  const [showArticle, setShowArticle] = useState(false);

  useEffect(() => {
    if (id) {
      const foundProject = projects.find((p) => p.id.toString() === id);
      if (foundProject) {
        setProject(foundProject);
        // Trigger article reveal after a delay
        setTimeout(() => setShowArticle(true), 1000);
      }
    }
  }, [id]);

  const handleGoBack = () => {
    router.back();
  };

  if (!project) {
    return <div>Loading...</div>;
  }

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
            src={project.image}
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
              className="w-full bg-gray-900 p-6 rounded-lg"
            >
              <h2 className="text-2xl font-bold mb-4">Project Article</h2>
              <p className="mb-4">
                This is where a more detailed article about the project would go. You can include
                information about the project's background, challenges, solutions, and outcomes.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc id
                aliquam tincidunt, nisl nunc tincidunt nunc, vitae aliquam nunc nunc vitae nunc.
                Sed euismod, nunc id aliquam tincidunt, nisl nunc tincidunt nunc, vitae aliquam
                nunc nunc vitae nunc.
              </p>
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