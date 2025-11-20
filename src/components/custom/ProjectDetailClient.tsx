'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { projects, type Project } from '@/utils/projectList';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import ComingSoonWarning from '@/components/custom/ComingSoonWarning';

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

  // Track where user came from
  const fromSource = searchParams.get('from');

  const handleGoBack = useCallback(() => {
    if (fromSource === 'summarize') {
      router.push('/summarize?tab=projects');
    } else {
      router.push('/projects');
    }
  }, [router, fromSource]);

  const goToPreviousProject = useCallback(() => {
    const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
    const fromParam = fromSource ? `?from=${fromSource}` : '';
    router.push(`/projects/${projects[prevIndex].id}${fromParam}`);
  }, [currentIndex, router, fromSource]);

  const goToNextProject = useCallback(() => {
    const nextIndex = (currentIndex + 1) % projects.length;
    const fromParam = fromSource ? `?from=${fromSource}` : '';
    router.push(`/projects/${projects[nextIndex].id}${fromParam}`);
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

  return (
    <div
      className={`fixed inset-0 overflow-hidden bg-white text-gray-900 flex flex-col font-mono transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Top Bar - Title */}
      <div
        className={`border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between transition-all duration-300 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}
        style={{ transitionDelay: '100ms' }}
      >
        <div className="flex-1 min-w-0">
          <h1 className="text-base md:text-lg font-thin tracking-tight truncate">{project.title}</h1>
          <p className="text-xs font-thin text-gray-500 mt-0.5 truncate">{project.description}</p>
        </div>
        <div className="flex items-center gap-1 ml-4 flex-shrink-0">
          <button
            onClick={goToPreviousProject}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors border border-transparent hover:border-gray-200"
            title="Previous project (h)"
          >
            <ChevronLeft size={16} strokeWidth={1} />
          </button>
          <button
            onClick={goToNextProject}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors border border-transparent hover:border-gray-200"
            title="Next project (l)"
          >
            <ChevronRight size={16} strokeWidth={1} />
          </button>
          <button
            onClick={handleGoBack}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors border border-transparent hover:border-gray-200"
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
          className={`w-full h-[40vh] md:h-auto md:w-[55%] relative border-b md:border-b-0 md:border-r border-gray-200 flex-shrink-0 overflow-hidden transition-all duration-300 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}
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

          {/* Links Row */}
          {(project.link || project.github) && (
            <div className="mb-4 pb-4 border-b border-gray-100 grid grid-cols-2 gap-3">
              {project.link && (
                <div>
                  <h3 className="text-[10px] font-thin text-gray-400 uppercase tracking-widest mb-1">
                    Live Site
                  </h3>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-thin text-gray-900 hover:text-gray-600 underline break-all"
                  >
                    {project.link.replace('https://', '')}
                  </a>
                </div>
              )}
              {project.github && (
                <div>
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
                h/l: cycle projects | j/k: navigate images | esc: back
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
