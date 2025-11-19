"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { projects } from "@/utils/projectList";

interface ProjectsIndexProps {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  isKeyboardNav: boolean;
  setIsKeyboardNav: (value: boolean) => void;
}

export default function ProjectsIndex({
  selectedIndex,
  setSelectedIndex,
  isKeyboardNav,
  setIsKeyboardNav,
}: ProjectsIndexProps) {
  // Separate refs for ribbon and list modes
  const ribbonItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const listItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // State
  const [isListMode, setIsListMode] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Use ref for hover state to avoid closure issues
  const isUserHoveringRef = useRef(false);

  // Calculate ribbon position for each item (ribbon mode only)
  const getRibbonStyle = (index: number, isInstruction: boolean = false) => {
    const offset = isInstruction ? -selectedIndex - 1.2 : index - selectedIndex;

    // Create a curved path using sine wave for X position
    const yPosition = offset * 120;
    const xPosition = Math.sin(offset * 0.25) * 35;
    const zPosition = -Math.abs(offset) * 25;

    // Calculate opacity - items fade as they get further from center
    const distance = Math.abs(offset);
    const opacity = isInstruction
      ? Math.max(0.3, 0.8 - (distance * 0.15))
      : Math.max(0.2, 1 - (distance * 0.15));

    // Scale items based on distance
    const scale = Math.max(0.85, 1 - (distance * 0.05));

    // Only blur items that are far away
    const blur = distance > 3 ? (distance - 3) * 0.5 : 0;

    return {
      transform: `
        translate3d(${xPosition}px, ${yPosition}px, ${zPosition}px)
        scale(${scale})
      `,
      opacity,
      filter: blur > 0 ? `blur(${blur}px)` : 'none',
    };
  };

  // Handle transition to list mode
  const transitionToListMode = () => {
    setIsListMode(true);
    setIsKeyboardNav(false);

    // Scroll to selected item when entering list mode
    setTimeout(() => {
      if (listContainerRef.current && listItemRefs.current[selectedIndex]) {
        const container = listContainerRef.current;
        const selectedItem = listItemRefs.current[selectedIndex];
        if (selectedItem) {
          const itemTop = selectedItem.offsetTop;
          const itemHeight = selectedItem.offsetHeight;
          const containerHeight = container.offsetHeight;

          // Center the selected item
          container.scrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);
        }
      }
    }, 100);

    // Start initial timeout to return to ribbon
    scrollTimeoutRef.current = setTimeout(() => {
      if (!isUserHoveringRef.current) {
        transitionToRibbonMode();
      }
    }, 1200);
  };

  // Handle transition to ribbon mode
  const transitionToRibbonMode = () => {
    // Find the item closest to the center of the viewport
    if (listContainerRef.current && listItemRefs.current.length > 0) {
      const container = listContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      let closestIndex = selectedIndex;
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

      // Update selected index to the closest item
      setSelectedIndex(closestIndex);
    }

    setIsListMode(false);
    setIsKeyboardNav(true);
    setHoveredIndex(null);
    isUserHoveringRef.current = false;
  };

  // Handle page-wide scrolling
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isListMode) {
        e.preventDefault();
        transitionToListMode();
      } else if (isListMode && listContainerRef.current) {
        e.preventDefault();

        // Apply scroll to the list container
        const scrollAmount = e.deltaY;
        listContainerRef.current.scrollTop += scrollAmount;

        // Reset timeout on scroll
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        // Set new timeout only if not hovering
        if (!isUserHoveringRef.current) {
          scrollTimeoutRef.current = setTimeout(() => {
            if (!isUserHoveringRef.current) {
              transitionToRibbonMode();
            }
          }, 1200);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isListMode, selectedIndex]);

  // Handle list container scrolling
  const handleListScroll = () => {
    // Reset timeout on scroll
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set new timeout only if not hovering
    if (!isUserHoveringRef.current) {
      scrollTimeoutRef.current = setTimeout(() => {
        if (!isUserHoveringRef.current) {
          transitionToRibbonMode();
        }
      }, 1200);
    }
  };

  // Handle hover in list mode
  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    isUserHoveringRef.current = true;

    // Clear timeout while hovering
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    isUserHoveringRef.current = false;

    // Restart timeout when mouse leaves
    if (isListMode) {
      scrollTimeoutRef.current = setTimeout(() => {
        if (!isUserHoveringRef.current) {
          transitionToRibbonMode();
        }
      }, 1500);
    }
  };

  // Handle container mouse leave
  const handleContainerMouseLeave = () => {
    isUserHoveringRef.current = false;
    setHoveredIndex(null);

    // Start timeout to return to ribbon if in list mode
    if (isListMode) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        if (!isUserHoveringRef.current) {
          transitionToRibbonMode();
        }
      }, 1200);
    }
  };

  // Handle click to select and return to ribbon
  const handleClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setSelectedIndex(index);
    transitionToRibbonMode();
  };

  // Render component
  return (
    <div className="relative -mt-4" onMouseLeave={handleContainerMouseLeave}>
      {/* Ribbon mode - only render when not in list mode */}
      {!isListMode && (
        <div className="animate-fadeIn">
          {/* Soft gradient overlays */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#FFFBF0] via-[#FFFBF0]/90 to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FFFBF0] via-[#FFFBF0]/90 to-transparent z-10 pointer-events-none" />

          {/* 3D Container for ribbon */}
          <div
            className="relative h-[600px] overflow-hidden"
            style={{
              perspective: '900px',
              perspectiveOrigin: '50% 50%',
            }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Instructions */}
              <div
                className="absolute w-full max-w-[500px] px-6 py-4 text-center pointer-events-none"
                style={{
                  ...getRibbonStyle(0, true),
                  transformStyle: 'preserve-3d',
                }}
              >
                <p className="text-sm text-[#1a1a1a]/50 italic">
                  j/k to navigate • scroll to browse • enter to select
                </p>
              </div>

              {/* Project items in ribbon mode */}
              {projects.map((project, index) => {
                const itemStyle = getRibbonStyle(index);
                const isSelected = index === selectedIndex;
                const isVisible = Math.abs(index - selectedIndex) <= 5;

                if (!isVisible) return null;

                return (
                  <Link
                    key={project.id}
                    ref={(el) => { ribbonItemRefs.current[index] = el; }}
                    href={`/projects/${project.id}?from=summarize`}
                    className={`absolute w-full max-w-[550px] px-8 py-5 ${
                      isSelected ? "z-20" : "z-10"
                    }`}
                    style={{
                      ...itemStyle,
                      transformStyle: 'preserve-3d',
                      backfaceVisibility: 'hidden',
                      pointerEvents: isSelected ? 'auto' : 'none',
                      transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                    }}
                  >
                    <div className={`
                      py-2
                      ${isSelected ? 'border-l-4 border-[#1a1a1a] pl-5' : 'pl-6'}
                      transition-all duration-300
                    `}>
                      <div className="mb-2">
                        <span className={`font-medium text-base ${
                          isSelected ? 'text-[#1a1a1a]' : 'text-[#1a1a1a]/70'
                        }`}>
                          {project.title}
                        </span>
                      </div>
                      <p className={`text-sm mb-3 leading-relaxed ${
                        isSelected ? 'opacity-90' : 'opacity-70'
                      }`}>
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className={`text-xs ${
                            isSelected ? 'opacity-70' : 'opacity-50'
                          }`}>
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className={`text-xs ${
                            isSelected ? 'opacity-60' : 'opacity-40'
                          }`}>
                            +{project.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Center indicator */}
            <div className="absolute top-1/2 left-12 right-12 h-[1px] bg-[#1a1a1a]/5 -translate-y-1/2 pointer-events-none z-5" />
          </div>
        </div>
      )}

      {/* List mode - only render when in list mode */}
      {isListMode && (
        <div className="animate-fadeIn">
          {/* Instructions for list mode */}
          <div className="text-center mb-4">
            <p className="text-sm text-[#1a1a1a]/50 italic">
              scroll to browse • hover to pause • click to select
            </p>
          </div>

          {/* Normal scrollable list with hidden scrollbar */}
          <div
            ref={listContainerRef}
            className="h-[600px] overflow-y-auto overflow-x-hidden px-4 scrollbar-hide"
            onScroll={handleListScroll}
            style={{
              scrollBehavior: 'smooth',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            <div className="max-w-[550px] mx-auto space-y-4 py-8">
              {projects.map((project, index) => {
                const isHovered = index === hoveredIndex;
                const isCurrentlySelected = index === selectedIndex;

                return (
                  <Link
                    key={project.id}
                    ref={(el) => { listItemRefs.current[index] = el; }}
                    href={`/projects/${project.id}?from=summarize`}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                    onClick={(e) => handleClick(e, index)}
                    className={`
                      block px-8 py-5 cursor-pointer
                      transition-all duration-200 ease-out
                      ${isHovered || isCurrentlySelected ? 'translate-x-2' : ''}
                    `}
                  >
                    <div className={`
                      py-2
                      ${isHovered || isCurrentlySelected
                        ? 'border-l-4 border-[#1a1a1a] pl-5'
                        : 'pl-6 border-l-4 border-transparent'
                      }
                      transition-all duration-200
                    `}>
                      <div className="mb-2">
                        <span className={`font-medium text-base ${
                          isHovered || isCurrentlySelected
                            ? 'text-[#1a1a1a]'
                            : 'text-[#1a1a1a]/70'
                        } transition-colors duration-200`}>
                          {project.title}
                        </span>
                      </div>
                      <p className={`text-sm mb-3 leading-relaxed ${
                        isHovered || isCurrentlySelected
                          ? 'opacity-90'
                          : 'opacity-70'
                      } transition-opacity duration-200`}>
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className={`text-xs ${
                            isHovered || isCurrentlySelected
                              ? 'opacity-70'
                              : 'opacity-50'
                          } transition-opacity duration-200`}>
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className={`text-xs ${
                            isHovered || isCurrentlySelected
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
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
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