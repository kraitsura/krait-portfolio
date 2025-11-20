"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { projects, projectsByCategory, categoryOrder } from "@/utils/projectList";

interface ProjectsIndexProps {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  isKeyboardNav: boolean;
  setIsKeyboardNav: (value: boolean) => void;
}

export default function ProjectsIndex({
  selectedIndex,
  setSelectedIndex,
}: ProjectsIndexProps) {
  const listItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [centerIndex, setCenterIndex] = useState<number | null>(null);
  const [isInitialScroll, setIsInitialScroll] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // Create ordered projects array based on category order
  const orderedProjects = categoryOrder.flatMap(
    (category) => projectsByCategory[category]
  );

  // Smooth scroll animation helper
  const smoothScrollToItem = (targetIndex: number) => {
    if (listContainerRef.current && listItemRefs.current[targetIndex]) {
      const container = listContainerRef.current;
      const targetItem = listItemRefs.current[targetIndex];
      if (targetItem) {
        const itemTop = targetItem.offsetTop;
        const itemHeight = targetItem.offsetHeight;
        const containerHeight = container.offsetHeight;
        const targetScroll = itemTop - (containerHeight / 2) + (itemHeight / 2) + 20;

        // Smooth scroll with easing
        const start = container.scrollTop;
        const distance = targetScroll - start;
        const duration = 300;
        let startTime: number | null = null;

        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

        const animateScroll = (currentTime: number) => {
          if (startTime === null) startTime = currentTime;
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          container.scrollTop = start + distance * easeOutCubic(progress);

          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          }
        };

        requestAnimationFrame(animateScroll);
      }
    }
  };

  // Scroll to selected item on mount with smooth animation
  useEffect(() => {
    setIsInitialScroll(true);
    // Trigger dramatic entrance animation
    setTimeout(() => {
      setIsVisible(true);
    }, 50);
    setTimeout(() => {
      smoothScrollToItem(selectedIndex);
    }, 50);
    // Enable scroll tracking and set center index after entrance animation completes
    setTimeout(() => {
      setCenterIndex(selectedIndex);
      setIsInitialScroll(false);
    }, 800); // 700ms entrance animation + 50ms delay + 50ms buffer
  }, []);

  // Helper to get section start indices
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

  // Handle j/k/h/l and arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Guard against null centerIndex during initialization
      if (centerIndex === null) return;

      const sectionStarts = getSectionStartIndices();

      // j or ArrowDown - next project
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        const newIndex = Math.min(centerIndex + 1, orderedProjects.length - 1);
        setCenterIndex(newIndex);
        setSelectedIndex(newIndex);
        smoothScrollToItem(newIndex);
      }
      // k or ArrowUp - previous project
      else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        const newIndex = Math.max(centerIndex - 1, 0);
        setCenterIndex(newIndex);
        setSelectedIndex(newIndex);
        smoothScrollToItem(newIndex);
      }
      // l or ArrowRight - next section
      else if (e.key === 'l' || e.key === 'ArrowRight') {
        e.preventDefault();
        const currentSection = getSectionForIndex(centerIndex);
        const nextSection = (currentSection + 1) % sectionStarts.length;
        const newIndex = sectionStarts[nextSection];
        setCenterIndex(newIndex);
        setSelectedIndex(newIndex);
        smoothScrollToItem(newIndex);
      }
      // h or ArrowLeft - previous section
      else if (e.key === 'h' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const currentSection = getSectionForIndex(centerIndex);
        const prevSection = currentSection === 0 ? sectionStarts.length - 1 : currentSection - 1;
        const newIndex = sectionStarts[prevSection];
        setCenterIndex(newIndex);
        setSelectedIndex(newIndex);
        smoothScrollToItem(newIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [centerIndex, setSelectedIndex, orderedProjects.length]);

  // Handle page-wide scrolling
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (listContainerRef.current) {
        e.preventDefault();
        const container = listContainerRef.current;
        const newScrollTop = container.scrollTop + e.deltaY;
        const maxScroll = container.scrollHeight - container.clientHeight;
        container.scrollTop = Math.max(0, Math.min(newScrollTop, maxScroll));
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Track center item on scroll
  const handleListScroll = () => {
    if (isInitialScroll) return; // Skip during initial animation
    if (listContainerRef.current && listItemRefs.current.length > 0) {
      const container = listContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2 - 20;

      // Handle edge cases: at top, select first; at bottom, select last
      const isAtTop = container.scrollTop <= 10;
      const isAtBottom = container.scrollTop >= container.scrollHeight - container.clientHeight - 10;

      let closestIndex = centerIndex;

      if (isAtTop) {
        closestIndex = 0;
      } else if (isAtBottom) {
        closestIndex = orderedProjects.length - 1;
      } else {
        let closestDistance = Infinity;

        listItemRefs.current.forEach((item, index) => {
          if (item) {
            const itemRect = item.getBoundingClientRect();
            const itemCenter = itemRect.top + itemRect.height / 2;
            const distance = Math.abs(itemCenter - containerCenter);

            if (distance < closestDistance) {
              closestDistance = distance;
              closestIndex = index;
            }
          }
        });
      }

      if (closestIndex !== centerIndex) {
        setCenterIndex(closestIndex);
      }
    }
  };

  const handleMouseEnter = (index: number) => setHoveredIndex(index);
  const handleMouseLeave = () => setHoveredIndex(null);

  const handleClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setSelectedIndex(index);
    setCenterIndex(index);
    window.location.href = `/projects/${orderedProjects[index].id}?from=summarize`;
  };

  return (
    <div className="relative -mt-4" onMouseLeave={handleMouseLeave}>
      <div
        suppressHydrationWarning
        ref={listContainerRef}
        className={`relative h-[600px] overflow-y-auto overflow-x-hidden px-4 scrollbar-hide transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
        onScroll={handleListScroll}
        style={{
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        <div className="max-w-[550px] mx-auto space-y-1 md:pt-[210px] pb-[280px]">
          {(() => {
            let globalIndex = 0;
            return categoryOrder.map((category) => {
              const categoryProjects = projectsByCategory[category];
              if (categoryProjects.length === 0) return null;

              return (
                <div key={category} className="mb-12 first:mt-0">
                  <h2
                    className="text-2xl font-light mb-4 text-[#1a1a1a] px-8"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                  >
                    {category}
                  </h2>
                  {categoryProjects.map((project) => {
                    const index = globalIndex++;
                    const isHovered = index === hoveredIndex;
                    const isCenter = centerIndex !== null && index === centerIndex;
                    const isHighlighted = isHovered || isCenter;

                    return (
                      <Link
                        key={project.id}
                        ref={(el) => { listItemRefs.current[index] = el; }}
                        href={`/projects/${project.id}?from=summarize`}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
                        onClick={(e) => handleClick(e, index)}
                        className={`
                          block px-8 py-3 cursor-pointer
                          transition-all duration-200 ease-out
                          ${isHighlighted ? 'translate-x-2' : ''}
                        `}
                      >
                        <div className={`
                          py-2
                          ${isHighlighted
                            ? 'border-l-4 border-[#1a1a1a] pl-5'
                            : 'pl-6 border-l-4 border-transparent'
                          }
                          transition-all duration-200
                        `}>
                          <div className="mb-2">
                            <span className={`font-medium text-base ${
                              isHighlighted
                                ? 'text-[#1a1a1a]'
                                : 'text-[#1a1a1a]/70'
                            } transition-colors duration-200`}>
                              {project.title}
                            </span>
                          </div>
                          <p className={`text-sm mb-3 leading-relaxed ${
                            isHighlighted
                              ? 'opacity-90'
                              : 'opacity-70'
                          } transition-opacity duration-200`}>
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {project.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className={`text-xs ${
                                isHighlighted
                                  ? 'opacity-70'
                                  : 'opacity-50'
                              } transition-opacity duration-200`}>
                                {tag}
                              </span>
                            ))}
                            {project.tags.length > 3 && (
                              <span className={`text-xs ${
                                isHighlighted
                                  ? 'opacity-60'
                                  : 'opacity-40'
                              } transition-opacity duration-200`}>
                                +{project.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              );
            });
          })()}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
