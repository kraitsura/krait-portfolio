'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GalleryImage, ImageData } from './GalleryImage';

interface GalleryPageProps {
  images: ImageData[];
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const clientHeight = e.currentTarget.clientHeight;
    const clientY = e.clientY;
    const clickPosition = clientY / clientHeight;

    if (clickPosition > 0.5) {
      // Clicked on bottom half
      setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, images.length - 1));
    } else {
      // Clicked on top half
      setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    }
  };

  const handleWheel = useCallback((e: globalThis.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, images.length - 1));
    } else {
      setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    }
  }, [images.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleWheel]);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-black text-white overflow-hidden"
      onClick={handleClick}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-screen relative"
        >
          <GalleryImage
            {...images[currentIndex]}
            index={currentIndex}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};