import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Project } from '@/utils/projectList';
import { iconMap } from '@/utils/iconMap';
import { Playfair_Display, Roboto_Mono } from 'next/font/google';
import { useAppTheme } from '@/contexts/AppThemeContext';
import { useThemeColor } from '@/contexts/ThemeColorContext';

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick: () => void;
  isSelected: boolean;
  isHighlighted?: boolean;
}

const playfair = Playfair_Display({ subsets: ['latin'] });
const robotoMono = Roboto_Mono({ subsets: ['latin'] });

const ProjectCard: React.FC<ProjectCardProps> = React.memo(({ project, index, onClick, isSelected, isHighlighted = false }) => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';
  const { effectiveColor } = useThemeColor();
  const isBlackTheme = effectiveColor === 'black';
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hoveredTag, setHoveredTag] = useState<number | null>(null);
  const [iconSize, setIconSize] = useState(16);
  const [isMobile, setIsMobile] = useState(false);
  const [visibleTagCount, setVisibleTagCount] = useState(project.tags.length);
  const [showCollapsedTooltip, setShowCollapsedTooltip] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mark as mounted for animation
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

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

  // Calculate effective visible tag count - if only 1 tag would be hidden, show it instead of "+1"
  const tagsWithIcons = project.tags.filter(tag => iconMap[tag]);
  const remainingTags = tagsWithIcons.length - visibleTagCount;
  const effectiveVisibleTagCount = remainingTags === 1 ? visibleTagCount + 1 : visibleTagCount;
  const shouldShowCollapsedBadge = tagsWithIcons.length > effectiveVisibleTagCount;

  // Preload next image when card is highlighted
  useEffect(() => {
    if (!isHighlighted || project.images.length <= 1) return;

    const nextIndex = (currentImageIndex + 1) % project.images.length;
    const img = new window.Image();
    img.src = project.images[nextIndex];
  }, [currentImageIndex, project.images, isHighlighted]);

  // Manual image cycling on mouse enter (removed auto-cycling for performance)
  const handleMouseEnter = () => {
    if (project.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      className={`relative aspect-video cursor-pointer group border-2 border-[var(--theme-primary)] project-card-border transition-all duration-300 ${
        isSelected ? 'z-30' : ''
      } ${isHighlighted ? 'project-card-highlighted' : ''} ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      <div className="absolute inset-0 overflow-hidden">
        {project.images.map((img, idx) => {
          const isVideo = img.endsWith('.webm') || img.endsWith('.mp4');
          return (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-500 ${
                idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {isVideo ? (
                <video
                  src={img}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={img}
                  alt={`${project.title} - ${idx + 1}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  quality={85}
                  loading={idx === 0 && index < 3 ? 'eager' : 'lazy'}
                  priority={idx === 0 && index < 3}
                />
              )}
            </div>
          );
        })}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50" />
      </div>

      <div
        className={`absolute top-1.5 right-1.5 md:top-2 md:right-2 flex flex-col items-end space-y-1 md:space-y-2 z-10 transition-opacity duration-300 ${
          isSelected ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {project.tags.slice(0, effectiveVisibleTagCount).map((tag, tagIndex) => {
          const IconComponent = iconMap[tag];
          const isHovered = hoveredTag === tagIndex;

          return IconComponent ? (
            <div
              key={tag}
              className={`relative backdrop-blur-md bg-black/40 border border-[var(--theme-primary)] rounded-full overflow-hidden cursor-pointer flex items-center transition-all duration-300 ${
                mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              }`}
              style={{
                boxShadow: isHovered
                  ? '0 0 10px rgba(var(--theme-primary-rgb), 0.35), 0 0 20px rgba(var(--theme-primary-rgb), 0.15)'
                  : '0 0 8px rgba(var(--theme-primary-rgb), 0.25)',
                paddingRight: isHovered ? (isMobile ? '10px' : '12px') : (isMobile ? '6px' : '8px'),
                paddingLeft: isMobile ? '6px' : '8px',
                paddingTop: isMobile ? '6px' : '8px',
                paddingBottom: isMobile ? '6px' : '8px',
              }}
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
                  <span
                    className={`${robotoMono.className} text-[var(--theme-primary)] text-[10px] md:text-xs font-semibold whitespace-nowrap overflow-hidden transition-all duration-300`}
                    style={{
                      width: isHovered ? 'auto' : 0,
                      opacity: isHovered ? 1 : 0,
                    }}
                  >
                    {tag}
                  </span>
                )}
              </div>
            </div>
          ) : null;
        })}

        {/* Collapsed tags badge */}
        {shouldShowCollapsedBadge && (
          <div
            className={`relative backdrop-blur-md bg-black/40 border border-[var(--theme-primary)] rounded-full overflow-visible cursor-pointer flex items-center transition-all duration-300 ${
              mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
            style={{
              boxShadow: showCollapsedTooltip
                ? '0 0 10px rgba(var(--theme-primary-rgb), 0.35), 0 0 20px rgba(var(--theme-primary-rgb), 0.15)'
                : '0 0 8px rgba(var(--theme-primary-rgb), 0.25)',
              transform: showCollapsedTooltip ? `scale(${isMobile ? 1.05 : 1.1})` : 'scale(1)',
              paddingRight: isMobile ? '6px' : '8px',
              paddingLeft: isMobile ? '6px' : '8px',
              paddingTop: isMobile ? '6px' : '8px',
              paddingBottom: isMobile ? '6px' : '8px',
            }}
            onMouseEnter={() => setShowCollapsedTooltip(true)}
            onMouseLeave={() => setShowCollapsedTooltip(false)}
            onClick={(e) => e.stopPropagation()}
          >
            <span className={`${robotoMono.className} text-[var(--theme-primary)] text-[10px] md:text-xs font-semibold`}>
              +{tagsWithIcons.length - effectiveVisibleTagCount}
            </span>

            {/* Tooltip showing hidden tags */}
            {showCollapsedTooltip && (
              <div
                className={`absolute right-full mr-2 top-0 backdrop-blur-md bg-black/90 border border-[var(--theme-primary)] rounded-lg p-2 whitespace-nowrap transition-all duration-200 ${
                  showCollapsedTooltip ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
                }`}
              >
                <div className="flex flex-col gap-1">
                  {project.tags.slice(effectiveVisibleTagCount).map((tag) => {
                    const IconComponent = iconMap[tag];
                    return IconComponent ? (
                      <div key={tag} className="flex items-center gap-2">
                        <IconComponent size={12} className="text-[var(--theme-primary)]" strokeWidth={2.5} />
                        <span className={`${robotoMono.className} text-[var(--theme-primary)] text-[10px] font-semibold`}>
                          {tag}
                        </span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t to-transparent theme-text p-2 md:p-3 lg:p-4 overflow-hidden transition-all duration-300 ${
          isDark ? 'from-black' : 'from-[#FFFBF0]'
        } ${
          isSelected ? 'opacity-0 translate-y-5' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 right-0 bg-[var(--theme-primary)] h-[2px] my-auto" />
          <h3 className={`${playfair.className} ${isBlackTheme ? 'text-white' : 'text-black'} text-base md:text-lg lg:text-xl font-semibold relative bg-[var(--theme-primary)] inline-block pr-2`}>
            {project.title}
          </h3>
        </div>
        <p className={`${robotoMono.className} theme-body text-xs md:text-sm line-clamp-2`}>{project.description}</p>
      </div>
    </div>
  );
});

ProjectCard.displayName = 'ProjectCard';

export default ProjectCard;