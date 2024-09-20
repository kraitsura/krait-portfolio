import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export type Position = 'left' | 'center-left' | 'center' | 'center-right' | 'right';
export type TextPosition = 'top' | 'bottom' | 'left' | 'right';

export interface ImageData {
  src: string;
  title?: string;
  subtitle?: string;
  position: Position;
  textPosition: TextPosition;
}

interface GalleryImageProps extends ImageData {
  index: number;
  total: number;
}

export const GalleryImage: React.FC<GalleryImageProps> = ({ 
  src, 
  title, 
  subtitle, 
  index, 
  total, 
  position, 
  textPosition 
}) => {
  const getPositionClass = () => {
    switch (position) {
      case 'left':
        return 'left-0 items-start justify-start';
      case 'center-left':
        return 'left-1/4 -translate-x-1/4 items-center justify-start';
      case 'center':
        return 'left-1/2 -translate-x-1/2 items-center justify-center';
      case 'center-right':
        return 'left-3/4 -translate-x-3/4 items-center justify-end';
      case 'right':
        return 'right-0 items-end justify-end';
    }
  };

  const getTextPositionClass = () => {
    switch (textPosition) {
      case 'top':
        return 'bottom-full left-0 mb-4 w-full';
      case 'bottom':
        return 'top-full left-0 mt-4 w-full';
      case 'left':
        return 'top-1/2 right-full -translate-y-1/2 mr-4';
      case 'right':
        return 'top-1/2 left-full -translate-y-1/2 ml-4';
    }
  };

  return (
    <motion.div
      className={`absolute w-full h-screen flex ${getPositionClass()}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative max-w-full max-h-full p-4 flex flex-col items-start">
        {textPosition === 'top' && (title || subtitle) && (
          <motion.div 
            className="text-white max-w-md mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {title && <h2 className="text-xl font-bold">{title}</h2>}
            {subtitle && <p className="text-sm">{subtitle}</p>}
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Image
            src={src}
            alt={`Gallery image ${index + 1}`}
            width={1200}
            height={800}
            className="object-contain max-w-full max-h-[calc(100vh-2rem)]"
          />
        </motion.div>
        {textPosition === 'bottom' && (title || subtitle) && (
          <motion.div 
            className="text-white max-w-md mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {title && <h2 className="text-xl font-bold">{title}</h2>}
            {subtitle && <p className="text-sm">{subtitle}</p>}
          </motion.div>
        )}
        {(textPosition === 'left' || textPosition === 'right') && (title || subtitle) && (
          <motion.div 
            className={`absolute ${getTextPositionClass()} text-white max-w-md`}
            initial={{ opacity: 0, x: textPosition === 'left' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {title && <h2 className="text-xl font-bold">{title}</h2>}
            {subtitle && <p className="text-sm">{subtitle}</p>}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};