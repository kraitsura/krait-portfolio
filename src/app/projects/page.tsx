'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, projects } from '@/utils/projectList';
import ProjectCard from '@/components/custom/ProjectCard';
import { useRouter } from 'next/navigation';

const Projects: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();

  const handleProjectClick = (project: Project) => {
    setSelectedId(project.id);
    setTimeout(() => {
      router.push(`/projects/${project.id}`);
    }, 300); // Reduced delay for smoother transition
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black text-white p-8 overflow-hidden relative"
    >
      <motion.h1
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-8xl font-thin mb-16 fixed top-4 left-4 z-10"
        style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}
      >
        Projects
      </motion.h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 ml-24">
        <AnimatePresence>
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ProjectCard
                project={project}
                index={index}
                onClick={() => handleProjectClick(project)}
                isSelected={selectedId === project.id}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Projects;