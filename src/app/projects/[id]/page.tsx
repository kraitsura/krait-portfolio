'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { projects } from '@/utils/projectList';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import VerticalCarousel from '@/components/custom/VerticalCarousel';

const ProjectDetail: React.FC = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Find project directly
  const project = projects.find(p => p.id.toString() === id);
  const currentIndex = projects.findIndex(p => p.id.toString() === id);

  const handleGoBack = () => {
    router.push('/projects');
  };

  const goToPreviousProject = () => {
    const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
    router.push(`/projects/${projects[prevIndex].id}`);
    setSwipeDirection(null); // Reset swipe state
  };

  const goToNextProject = () => {
    const nextIndex = (currentIndex + 1) % projects.length;
    router.push(`/projects/${projects[nextIndex].id}`);
    setSwipeDirection(null); // Reset swipe state
  };

  // Handle horizontal swipe for project navigation
  const handleHorizontalSwipe = (_: unknown, info: { offset: { x: number } }) => {
    if (!isTouchDevice) return;

    const swipeThreshold = 100;

    if (info.offset.x > swipeThreshold) {
      // Swiped right
      if (swipeDirection === 'right') {
        // Second swipe - navigate to previous project
        goToPreviousProject();
      } else {
        // First swipe - show arrow
        setSwipeDirection('right');
      }
    } else if (info.offset.x < -swipeThreshold) {
      // Swiped left
      if (swipeDirection === 'left') {
        // Second swipe - navigate to next project
        goToNextProject();
      } else {
        // First swipe - show arrow
        setSwipeDirection('left');
      }
    }
  };

  // Detect touch device
  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
  }, []);

  // Auto-dismiss arrow after 3 seconds
  useEffect(() => {
    if (swipeDirection) {
      const timer = setTimeout(() => {
        setSwipeDirection(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [swipeDirection]);

  // Add keyboard navigation for Esc, h, l
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleGoBack();
      } else if (e.key === 'h') {
        e.preventDefault();
        goToPreviousProject();
      } else if (e.key === 'l') {
        e.preventDefault();
        goToNextProject();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, handleGoBack, goToPreviousProject, goToNextProject]);

  // If no project found, redirect
  if (!project) {
    router.push('/404');
    return <div>Loading...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-screen overflow-hidden bg-white text-gray-900 flex flex-col font-mono"
    >
      {/* Top Bar - Title */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between"
      >
        <div className="flex-1 min-w-0">
          <h1 className="text-base md:text-lg font-thin tracking-tight truncate">{project.title}</h1>
          <p className="text-xs font-thin text-gray-500 mt-0.5 truncate">{project.description}</p>
        </div>
        <button
          onClick={handleGoBack}
          className="ml-4 p-1.5 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
          title="Press Esc to go back"
        >
          <X size={16} strokeWidth={1} />
        </button>
      </motion.div>

      {/* Main Content - Split Layout */}
      <motion.div
        className="flex-1 flex flex-col md:flex-row overflow-hidden relative"
        drag={isTouchDevice ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleHorizontalSwipe}
      >
        {/* Top/Left Side - Image Carousel */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="w-full h-[45vh] md:h-auto md:w-[55%] relative border-b md:border-b-0 md:border-r border-gray-200 flex-shrink-0"
        >
          <VerticalCarousel images={project.images} projectName={project.title} isTouchDevice={isTouchDevice} />
        </motion.div>

        {/* Bottom/Right Side - Info */}
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="w-full md:w-[45%] overflow-y-auto px-4 md:px-6 py-4"
        >
          {/* Technologies */}
          <div className="mb-4 pb-4 border-b border-gray-100">
            <h3 className="text-[10px] font-thin text-gray-400 uppercase tracking-widest mb-2">
              Technologies
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-white border border-gray-200 text-gray-700 text-xs font-thin"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="mb-4 pb-4 border-b border-gray-100 grid grid-cols-2 gap-3">
            {project.date && (
              <div>
                <h3 className="text-[10px] font-thin text-gray-400 uppercase tracking-widest mb-1">
                  Date
                </h3>
                <p className="text-sm font-thin text-gray-900">{project.date}</p>
              </div>
            )}

            {project.status && (
              <div>
                <h3 className="text-[10px] font-thin text-gray-400 uppercase tracking-widest mb-1">
                  Status
                </h3>
                <p className="text-sm font-thin text-gray-900">{project.status}</p>
              </div>
            )}
          </div>

          {/* GitHub Link */}
          {project.github && (
            <div className="mb-4 pb-4 border-b border-gray-100">
              <h3 className="text-[10px] font-thin text-gray-400 uppercase tracking-widest mb-1">
                Repository
              </h3>
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-thin text-gray-900 hover:text-gray-600 underline break-all"
              >
                {project.github.replace('https://github.com/', '')}
              </a>
            </div>
          )}

          {/* About/Content */}
          <div>
            <h3 className="text-[10px] font-thin text-gray-400 uppercase tracking-widest mb-2">
              About
            </h3>
            <p className="text-sm font-thin text-gray-900 leading-relaxed">
              {project.content}
            </p>
          </div>

          {/* Footer hint - Only show on non-touch devices */}
          {!isTouchDevice && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs font-mono text-gray-500 leading-relaxed">
                h/l: cycle projects | k/j: navigate images | esc: back
              </p>
            </div>
          )}
        </motion.div>

        {/* Floating Arrow Indicators - Only on touch devices */}
        <AnimatePresence>
          {isTouchDevice && swipeDirection === 'left' && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{
                x: 0,
                opacity: [0.4, 0.8, 0.4],
              }}
              exit={{ x: 20, opacity: 0 }}
              transition={{
                x: { duration: 0.3 },
                opacity: { duration: 1.5, repeat: Infinity }
              }}
              className="fixed right-4 top-1/2 -translate-y-1/2 z-50 pointer-events-auto"
              onClick={goToNextProject}
            >
              <div className="p-3 bg-white/90 border border-gray-300 rounded-sm shadow-lg backdrop-blur-sm cursor-pointer hover:bg-gray-50 transition-colors">
                <ChevronRight size={32} strokeWidth={0.75} className="text-gray-700" />
              </div>
            </motion.div>
          )}

          {isTouchDevice && swipeDirection === 'right' && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{
                x: 0,
                opacity: [0.4, 0.8, 0.4],
              }}
              exit={{ x: -20, opacity: 0 }}
              transition={{
                x: { duration: 0.3 },
                opacity: { duration: 1.5, repeat: Infinity }
              }}
              className="fixed left-4 top-1/2 -translate-y-1/2 z-50 pointer-events-auto"
              onClick={goToPreviousProject}
            >
              <div className="p-3 bg-white/90 border border-gray-300 rounded-sm shadow-lg backdrop-blur-sm cursor-pointer hover:bg-gray-50 transition-colors">
                <ChevronLeft size={32} strokeWidth={0.75} className="text-gray-700" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default ProjectDetail;
