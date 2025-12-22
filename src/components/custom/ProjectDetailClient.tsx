'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { projects, type Project } from '@/utils/projectList';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import ComingSoonWarning from '@/components/custom/ComingSoonWarning';
import { useAppTheme } from '@/contexts/AppThemeContext';

// Lazy load VerticalCarousel for better initial page load
const VerticalCarousel = dynamic(() => import('@/components/custom/VerticalCarousel'), {
  loading: () => (
    <div className="w-full h-full bg-gray-50 animate-pulse flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  ),
  ssr: false,
});

interface ProjectDetailClientProps {
  project: Project;
  currentIndex: number;
}

const ProjectDetailClient: React.FC<ProjectDetailClientProps> = ({ project, currentIndex }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  // Track where user came from and their position
  const fromSource = searchParams.get('from');
  const projectIndex = searchParams.get('idx');

  const handleGoBack = useCallback(() => {
    if (fromSource === 'about') {
      router.push('/about?tab=projects');
    } else {
      // Pass index back to restore position
      const idxParam = projectIndex ? `?idx=${projectIndex}` : '';
      router.push(`/projects${idxParam}`);
    }
  }, [router, fromSource, projectIndex]);

  const goToPreviousProject = useCallback(() => {
    const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
    const params = new URLSearchParams();
    if (fromSource) params.set('from', fromSource);
    params.set('idx', prevIndex.toString());
    router.push(`/projects/${projects[prevIndex].id}?${params.toString()}`);
  }, [currentIndex, router, fromSource]);

  const goToNextProject = useCallback(() => {
    const nextIndex = (currentIndex + 1) % projects.length;
    const params = new URLSearchParams();
    if (fromSource) params.set('from', fromSource);
    params.set('idx', nextIndex.toString());
    router.push(`/projects/${projects[nextIndex].id}?${params.toString()}`);
  }, [currentIndex, router, fromSource]);

  // Detect touch device
  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
    setMounted(true);
  }, []);

  // Prevent body scroll on mobile
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    document.documentElement.style.height = '100vh';

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.height = '';
    };
  }, []);

  // Add keyboard navigation for Esc, h, l, arrows
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleGoBack();
      } else if (e.key === 'h' || e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPreviousProject();
      } else if (e.key === 'l' || e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextProject();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, handleGoBack, goToPreviousProject, goToNextProject]);

  return (
    <div
      className={`fixed inset-0 overflow-hidden flex flex-col font-mono transition-all duration-300 ${mounted ? 'opacity-100' : 'opacity-0'} ${
        isDark ? 'bg-[#0a0a0a] text-gray-100' : 'bg-white text-gray-900'
      }`}
    >
      {/* Top Bar - Title */}
      <div
        className={`border-b px-4 md:px-6 py-3 flex items-center justify-between transition-all duration-300 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'} ${
          isDark ? 'border-gray-800' : 'border-gray-200'
        }`}
        style={{ transitionDelay: '100ms' }}
      >
        <div className="flex-1 min-w-0">
          <h1 className="text-base md:text-lg font-thin tracking-tight truncate">{project.title}</h1>
          <p className={`text-xs font-thin mt-0.5 truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{project.description}</p>
        </div>
        <div className="flex items-center gap-1 ml-4 flex-shrink-0">
          <button
            onClick={goToPreviousProject}
            className={`p-1.5 rounded transition-colors border border-transparent ${
              isDark ? 'hover:bg-gray-800 hover:border-gray-700' : 'hover:bg-gray-100 hover:border-gray-200'
            }`}
            title="Previous project (h)"
          >
            <ChevronLeft size={16} strokeWidth={1} />
          </button>
          <button
            onClick={goToNextProject}
            className={`p-1.5 rounded transition-colors border border-transparent ${
              isDark ? 'hover:bg-gray-800 hover:border-gray-700' : 'hover:bg-gray-100 hover:border-gray-200'
            }`}
            title="Next project (l)"
          >
            <ChevronRight size={16} strokeWidth={1} />
          </button>
          <button
            onClick={handleGoBack}
            className={`p-1.5 rounded transition-colors border border-transparent ${
              isDark ? 'hover:bg-gray-800 hover:border-gray-700' : 'hover:bg-gray-100 hover:border-gray-200'
            }`}
            title="Back to projects (Esc)"
          >
            <X size={16} strokeWidth={1} />
          </button>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative min-h-0">
        {/* Top/Left Side - Image Carousel */}
        <div
          className={`w-full h-[40vh] md:h-auto md:w-[55%] relative border-b md:border-b-0 md:border-r flex-shrink-0 overflow-hidden transition-all duration-300 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'} ${
            isDark ? 'border-gray-800' : 'border-gray-200'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <VerticalCarousel images={project.images} projectName={project.title} isTouchDevice={isTouchDevice} />
        </div>

        {/* Bottom/Right Side - Info */}
        <div
          className={`w-full md:w-[45%] overflow-y-auto px-4 md:px-6 py-4 flex-1 min-h-0 h-[60vh] md:h-auto transition-all duration-300 ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
          style={{ transitionDelay: '200ms' }}
        >
          {/* Technologies */}
          <div className={`mb-4 pb-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
            <h3 className={`text-[10px] font-thin uppercase tracking-widest mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Technologies
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`px-2 py-0.5 border text-xs font-thin ${
                    isDark ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className={`mb-4 pb-4 border-b grid grid-cols-2 gap-3 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
            {project.date && (
              <div>
                <h3 className={`text-[10px] font-thin uppercase tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Date
                </h3>
                <p className={`text-sm font-thin ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{project.date}</p>
              </div>
            )}

            {project.status && (
              <div>
                <h3 className={`text-[10px] font-thin uppercase tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Status
                </h3>
                <p className={`text-sm font-thin ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{project.status}</p>
              </div>
            )}
          </div>

          {/* Links Row */}
          {(project.link || project.github) && (
            <div className={`mb-4 pb-4 border-b grid grid-cols-2 gap-3 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
              {project.link && (
                <div>
                  <h3 className={`text-[10px] font-thin uppercase tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Live Site
                  </h3>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm font-thin underline break-all ${
                      isDark ? 'text-gray-200 hover:text-gray-400' : 'text-gray-900 hover:text-gray-600'
                    }`}
                  >
                    {project.link.replace('https://', '')}
                  </a>
                </div>
              )}
              {project.github && (
                <div>
                  <h3 className={`text-[10px] font-thin uppercase tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Repository
                  </h3>
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm font-thin underline break-all ${
                      isDark ? 'text-gray-200 hover:text-gray-400' : 'text-gray-900 hover:text-gray-600'
                    }`}
                  >
                    {project.github.replace('https://github.com/', '')}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* About/Content */}
          <div>
            <h3 className={`text-[10px] font-thin uppercase tracking-widest mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              About
            </h3>
            <p className={`text-sm font-thin leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              {project.content}
            </p>
          </div>

          {/* Footer hint - Only show on non-touch devices */}
          {!isTouchDevice && (
            <div className={`mt-6 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
              <p className={`text-xs font-mono leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                h/l/←→: cycle projects | j/k: navigate images | esc: back
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Coming Soon Warning - Overlay */}
      {project.status === 'Coming Soon' && <ComingSoonWarning onClose={handleGoBack} />}
    </div>
  );
};

export default ProjectDetailClient;
