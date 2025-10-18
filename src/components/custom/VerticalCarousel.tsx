'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface VerticalCarouselProps {
  images: string[];
  projectName: string;
  isTouchDevice?: boolean;
}

const VerticalCarousel: React.FC<VerticalCarouselProps> = ({ images, projectName, isTouchDevice = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  // Handle swipe gestures
  const handleDragEnd = (_: unknown, info: { offset: { y: number } }) => {
    const swipeThreshold = 50;

    if (info.offset.y > swipeThreshold) {
      // Swiped down -> go to previous
      goToPrevious();
    } else if (info.offset.y < -swipeThreshold) {
      // Swiped up -> go to next
      goToNext();
    }
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

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-50">
      {/* Main Image */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center p-4 md:p-8"
            // Enable drag only on touch devices
            drag={isTouchDevice ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            <div className="relative w-full h-full pointer-events-none">
              <Image
                src={images[currentIndex]}
                alt={`${projectName} - Image ${currentIndex + 1}`}
                layout="fill"
                objectFit="contain"
                priority={currentIndex === 0}
              />
            </div>
          </motion.div>
        </AnimatePresence>
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
};

export default VerticalCarousel;
