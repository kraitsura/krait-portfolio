'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface VerticalCarouselProps {
  images: string[];
  projectName: string;
  isTouchDevice?: boolean;
}

const VerticalCarousel: React.FC<VerticalCarouselProps> = React.memo(({ images, projectName, isTouchDevice = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images.length]);

  // Handle touch gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;
    const swipeThreshold = 50;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        goToNext(); // Swiped up
      } else {
        goToPrevious(); // Swiped down
      }
    }
    setTouchStart(null);
  };

  // Vim-style navigation (j/k)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'k') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'j') {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToNext, goToPrevious]);

  // Preload next image only when carousel is in viewport
  useEffect(() => {
    if (images.length <= 1) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const nextIndex = (currentIndex + 1) % images.length;
            const img = new window.Image();
            img.src = images[nextIndex];
          }
        });
      },
      { rootMargin: '100px' } // Start preloading 100px before entering viewport
    );

    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }

    return () => observer.disconnect();
  }, [currentIndex, images]);

  return (
    <div
      ref={carouselRef}
      className="relative w-full h-full flex items-center justify-center bg-gray-50"
      onTouchStart={isTouchDevice ? handleTouchStart : undefined}
      onTouchEnd={isTouchDevice ? handleTouchEnd : undefined}
    >
      {/* Main Image */}
      <div className="relative w-full h-full">
        {images.map((img, idx) => {
          const isVideo = img.endsWith('.webm') || img.endsWith('.mp4');
          return (
            <div
              key={idx}
              className={`absolute inset-0 flex items-center justify-center p-4 md:p-8 transition-opacity duration-300 ${
                idx === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="relative w-full h-full">
                {isVideo ? (
                  <video
                    src={img}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    src={img}
                    alt={`${projectName} - Image ${idx + 1}`}
                    fill
                    style={{ objectFit: 'contain' }}
                    priority={idx === 0}
                    sizes="(max-width: 768px) 100vw, 90vw"
                    quality={90}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows - Sleek Floating */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute top-6 left-1/2 -translate-x-1/2 opacity-30 hover:opacity-100 transition-opacity z-10"
            aria-label="Previous image (k)"
          >
            <ChevronUp size={28} strokeWidth={0.5} className="text-gray-700" />
          </button>

          <button
            onClick={goToNext}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-30 hover:opacity-100 transition-opacity z-10"
            aria-label="Next image (j)"
          >
            <ChevronDown size={28} strokeWidth={0.5} className="text-gray-700" />
          </button>
        </>
      )}

      {/* Indicators */}
      {images.length > 1 && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-1 transition-all ${
                index === currentIndex
                  ? 'h-8 bg-gray-700'
                  : 'h-4 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 right-4 px-2 py-1 bg-white/80 border border-gray-200 rounded text-[10px] font-thin text-gray-600 font-mono">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
});

VerticalCarousel.displayName = 'VerticalCarousel';

export default VerticalCarousel;
