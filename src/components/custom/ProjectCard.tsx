import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '@/utils/projectList';
import { iconMap } from '@/utils/iconMap';
import { Playfair_Display, Roboto_Mono } from 'next/font/google';

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick: () => void;
  isSelected: boolean;
  isHighlighted?: boolean;
}

const playfair = Playfair_Display({ subsets: ['latin'] });
const robotoMono = Roboto_Mono({ subsets: ['latin'] });

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onClick, isSelected, isHighlighted = false }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredTag, setHoveredTag] = useState<number | null>(null);
  const [iconSize, setIconSize] = useState(16);
  const [isMobile, setIsMobile] = useState(false);
  const [visibleTagCount, setVisibleTagCount] = useState(project.tags.length);
  const [showCollapsedTooltip, setShowCollapsedTooltip] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Calculate how many tags can fit based on card height
  const calculateVisibleTags = useCallback(() => {
    if (!cardRef.current) return project.tags.length;

    const cardHeight = cardRef.current.clientHeight;
    const screenWidth = window.innerWidth;

    // Reserve space for title area at bottom (~80px)
    const availableHeight = cardHeight - 80;

    // Calculate tag height: icon size (16) + padding (16) + spacing (8)
    const tagHeight = 40;
    const tagSpacing = 8;
    const totalTagHeight = tagHeight + tagSpacing;

    // Calculate how many tags can physically fit
    const maxVisibleBySpace = Math.max(1, Math.floor(availableHeight / totalTagHeight));

    // Apply screen-size specific limits
    let maxTagLimit;
    if (screenWidth < 768) {
      // Mobile: max 4 tags
      maxTagLimit = 4;
    } else {
      // Desktop: max 6 tags
      maxTagLimit = 6;
    }

    // Return the minimum of: space available, max limit, and total tags
    return Math.min(maxVisibleBySpace, maxTagLimit, project.tags.length);
  }, [project.tags.length]);

  // Responsive sizing based on screen width
  useEffect(() => {
    const updateResponsiveValues = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (mobile) {
        setIconSize(14); // Mobile
      } else if (window.innerWidth < 1024) {
        setIconSize(16); // Tablet/Medium
      } else {
        setIconSize(18); // Desktop/Large
      }

      // Update visible tag count
      setVisibleTagCount(calculateVisibleTags());
    };

    updateResponsiveValues();
    window.addEventListener('resize', updateResponsiveValues);
    return () => window.removeEventListener('resize', updateResponsiveValues);
  }, [calculateVisibleTags]);

  // Auto-cycle through images - only when highlighted
  useEffect(() => {
    if (project.images.length <= 1 || isPaused || !isHighlighted) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [project.images.length, isPaused, isHighlighted]);

  return (
    <motion.div
      ref={cardRef}
      layoutId={`project-container-${project.id}`}
      onClick={onClick}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`relative aspect-video cursor-pointer group border-2 border-[var(--theme-primary)] project-card-border ${
        isSelected ? 'z-30' : ''
      } ${isHighlighted ? 'project-card-highlighted' : ''}`}
    >
      <motion.div
        layoutId={`project-image-${project.id}`}
        className="absolute inset-0 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <Image
              src={project.images[currentImageIndex]}
              alt={`${project.title} - ${currentImageIndex + 1}`}
              layout="fill"
              objectFit="cover"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50" />
      </motion.div>
      
      <motion.div
        className="absolute top-1.5 right-1.5 md:top-2 md:right-2 flex flex-col items-end space-y-1 md:space-y-2 z-10"
        initial={{ opacity: 1 }}
        animate={{ opacity: isSelected ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="sync">
        {project.tags.slice(0, visibleTagCount).map((tag, tagIndex) => {
          const IconComponent = iconMap[tag];
          const isHovered = hoveredTag === tagIndex;

          return IconComponent ? (
            <motion.div
              key={tagIndex}
              className="relative backdrop-blur-md bg-black/40 border border-[var(--theme-primary)] rounded-full overflow-hidden cursor-pointer flex items-center"
              style={{
                boxShadow: isHovered
                  ? '0 0 10px rgba(var(--theme-primary-rgb), 0.35), 0 0 20px rgba(var(--theme-primary-rgb), 0.15)'
                  : '0 0 8px rgba(var(--theme-primary-rgb), 0.25)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              exit={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                paddingRight: isHovered ? (isMobile ? '10px' : '12px') : (isMobile ? '6px' : '8px'),
                paddingLeft: isMobile ? '6px' : '8px',
                paddingTop: isMobile ? '6px' : '8px',
                paddingBottom: isMobile ? '6px' : '8px',
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              onMouseEnter={() => setHoveredTag(tagIndex)}
              onMouseLeave={() => setHoveredTag(null)}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-1.5 md:gap-2">
                <div
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{
                    width: iconSize,
                    height: iconSize,
                    minWidth: iconSize,
                    minHeight: iconSize,
                  }}
                >
                  <IconComponent size={iconSize} className="text-[var(--theme-primary)]" strokeWidth={2.5} />
                </div>
                {isHovered && (
                  <motion.span
                    className={`${robotoMono.className} text-[var(--theme-primary)] text-[10px] md:text-xs font-semibold whitespace-nowrap overflow-hidden`}
                    initial={{ opacity: 0, width: 0, scaleX: 0 }}
                    animate={{ opacity: 1, width: 'auto', scaleX: 1 }}
                    exit={{ opacity: 0, width: 0, scaleX: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: 'easeInOut',
                      opacity: { delay: 0.1, duration: 0.2 }
                    }}
                    style={{ transformOrigin: 'left center' }}
                  >
                    {tag}
                  </motion.span>
                )}
              </div>
            </motion.div>
          ) : null;
        })}
        </AnimatePresence>

        {/* Collapsed tags badge */}
        <AnimatePresence>
        {visibleTagCount < project.tags.length && (
          <motion.div
            layout
            className="relative backdrop-blur-md bg-black/40 border border-[var(--theme-primary)] rounded-full overflow-visible cursor-pointer flex items-center"
            style={{
              boxShadow: showCollapsedTooltip
                ? '0 0 10px rgba(var(--theme-primary-rgb), 0.35), 0 0 20px rgba(var(--theme-primary-rgb), 0.15)'
                : '0 0 8px rgba(var(--theme-primary-rgb), 0.25)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            exit={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: showCollapsedTooltip ? (isMobile ? 1.05 : 1.1) : 1,
              paddingRight: isMobile ? '6px' : '8px',
              paddingLeft: isMobile ? '6px' : '8px',
              paddingTop: isMobile ? '6px' : '8px',
              paddingBottom: isMobile ? '6px' : '8px',
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            onMouseEnter={() => setShowCollapsedTooltip(true)}
            onMouseLeave={() => setShowCollapsedTooltip(false)}
            onClick={(e) => e.stopPropagation()}
          >
            <span className={`${robotoMono.className} text-[var(--theme-primary)] text-[10px] md:text-xs font-semibold`}>
              +{project.tags.length - visibleTagCount}
            </span>

            {/* Tooltip showing hidden tags */}
            <AnimatePresence>
            {showCollapsedTooltip && (
              <motion.div
                className="absolute right-full mr-2 top-0 backdrop-blur-md bg-black/90 border border-[var(--theme-primary)] rounded-lg p-2 whitespace-nowrap"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col gap-1">
                  {project.tags.slice(visibleTagCount).map((tag, idx) => {
                    const IconComponent = iconMap[tag];
                    return IconComponent ? (
                      <div key={idx} className="flex items-center gap-2">
                        <IconComponent size={12} className="text-[var(--theme-primary)]" strokeWidth={2.5} />
                        <span className={`${robotoMono.className} text-[var(--theme-primary)] text-[10px] font-semibold`}>
                          {tag}
                        </span>
                      </div>
                    ) : null;
                  })}
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </motion.div>
        )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent theme-text p-2 md:p-3 lg:p-4 overflow-hidden"
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: isSelected ? 0 : 1, y: isSelected ? 20 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 right-0 bg-[var(--theme-primary)] h-[2px] my-auto" />
          <h3 className={`${playfair.className} text-black text-base md:text-lg lg:text-xl font-semibold relative bg-[var(--theme-primary)] inline-block pr-2`}>
            {project.title}
          </h3>
        </div>
        <p className={`${robotoMono.className} theme-body text-xs md:text-sm line-clamp-2`}>{project.description}</p>
      </motion.div>
    </motion.div>
  );
};

export default ProjectCard;