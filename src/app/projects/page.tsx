'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, projectsByCategory, categoryOrder } from '@/utils/projectList';
import ProjectCard from '@/components/custom/ProjectCard';
import { useRouter } from 'next/navigation';
import { useTouchDevice } from '@/contexts/TouchContext';

const Projects: React.FC = () => {
  const { isTouchDevice } = useTouchDevice();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(() => {
    // Restore highlighted index from sessionStorage on mount
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('projectHighlightedIndex');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const router = useRouter();
  const projectRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Flatten all projects into a single array for linear navigation
  const allProjects: Project[] = categoryOrder.flatMap(
    (category) => projectsByCategory[category]
  );

  const handleProjectClick = (project: Project) => {
    // Find the index of the clicked project
    const projectIndex = allProjects.findIndex(p => p.id === project.id);
    if (projectIndex !== -1) {
      setHighlightedIndex(projectIndex);
    }

    // Save current highlighted index before navigating
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('projectHighlightedIndex', projectIndex.toString());
    }
    setSelectedId(project.id);
    setTimeout(() => {
      router.push(`/projects/${project.id}`);
    }, 300); // Reduced delay for smoother transition
  };

  // Helper to get the starting index of each section
  const getSectionStartIndices = () => {
    const indices: number[] = [];
    let currentIndex = 0;

    categoryOrder.forEach((category) => {
      const categoryProjects = projectsByCategory[category];
      if (categoryProjects.length > 0) {
        indices.push(currentIndex);
        currentIndex += categoryProjects.length;
      }
    });

    return indices;
  };

  // Helper to find which section an index belongs to
  const getSectionForIndex = (index: number): number => {
    const sectionStarts = getSectionStartIndices();
    for (let i = sectionStarts.length - 1; i >= 0; i--) {
      if (index >= sectionStarts[i]) {
        return i;
      }
    }
    return 0;
  };

  // Keyboard navigation: h/l (prev/next project), j/k (prev/next section), Enter (open)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const sectionStarts = getSectionStartIndices();

      if (event.key === 'l') {
        // Next project
        setHighlightedIndex((prev) => (prev + 1) % allProjects.length);
      } else if (event.key === 'h') {
        // Previous project
        setHighlightedIndex((prev) =>
          prev === 0 ? allProjects.length - 1 : prev - 1
        );
      } else if (event.key === 'j') {
        // Next section (jump to first project of next category)
        const currentSection = getSectionForIndex(highlightedIndex);
        const nextSection = (currentSection + 1) % sectionStarts.length;
        setHighlightedIndex(sectionStarts[nextSection]);
      } else if (event.key === 'k') {
        // Previous section (jump to first project of previous category)
        const currentSection = getSectionForIndex(highlightedIndex);
        const prevSection = currentSection === 0 ? sectionStarts.length - 1 : currentSection - 1;
        setHighlightedIndex(sectionStarts[prevSection]);
      } else if (event.key === 'Enter' && !event.shiftKey) {
        // Open highlighted project
        const highlightedProject = allProjects[highlightedIndex];
        if (highlightedProject) {
          handleProjectClick(highlightedProject);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allProjects, getSectionForIndex, handleProjectClick, highlightedIndex]);

  // Auto-scroll to highlighted project
  useEffect(() => {
    const highlightedProject = allProjects[highlightedIndex];
    if (highlightedProject) {
      const element = projectRefs.current.get(highlightedProject.id);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }, [highlightedIndex, allProjects]);

  // Save highlighted index to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('projectHighlightedIndex', highlightedIndex.toString());
    }
  }, [highlightedIndex]);

  // Calculate total index across all categories for staggered animations
  let globalIndex = 0;

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
        className="text-8xl font-thin mb-16 fixed top-24 left-4 z-10 theme-text"
        style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}
      >
        Projects
      </motion.h1>

      {/* Vim-like keystroke info */}
      {!isTouchDevice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="keystroke-info-projects"
        >
          <div className="keystroke-item">
            <kbd>h</kbd>
            <span>prev project</span>
          </div>
          <div className="keystroke-item">
            <kbd>l</kbd>
            <span>next project</span>
          </div>
          <div className="keystroke-item">
            <kbd>k</kbd>
            <span>prev section</span>
          </div>
          <div className="keystroke-item">
            <kbd>j</kbd>
            <span>next section</span>
          </div>
          <div className="keystroke-item">
            <kbd>↵</kbd>
            <span>open</span>
          </div>
        </motion.div>
      )}

      <div className="ml-24 mt-8 space-y-12">
        {categoryOrder.map((category) => {
          const categoryProjects = projectsByCategory[category];
          if (categoryProjects.length === 0) return null;

          return (
            <motion.section
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-3xl font-thin mb-6 theme-text"
              >
                {category}
              </motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <AnimatePresence>
                  {categoryProjects.map((project) => {
                    const currentIndex = globalIndex++;
                    const isHighlighted = allProjects[highlightedIndex]?.id === project.id;
                    return (
                      <motion.div
                        key={project.id}
                        ref={(el) => {
                          if (el) {
                            projectRefs.current.set(project.id, el);
                          } else {
                            projectRefs.current.delete(project.id);
                          }
                        }}
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <ProjectCard
                          project={project}
                          index={currentIndex}
                          onClick={() => handleProjectClick(project)}
                          isSelected={selectedId === project.id}
                          isHighlighted={isHighlighted}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.section>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Projects;