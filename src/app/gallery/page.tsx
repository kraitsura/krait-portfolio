// app/page.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useScroll, MotionValue } from 'framer-motion';
import Image, { StaticImageData } from 'next/image';

import friends from '@/assets/public/gallery_img/friends.jpeg';
import rocks from '@/assets/public/gallery_img/rocks.jpeg';
import bridge from '@/assets/public/gallery_img/bridge.jpeg';
import desert from '@/assets/public/gallery_img/desert.jpeg';

type Position = 'left' | 'center' | 'right';
type TextPosition = 'top' | 'bottom' | 'left' | 'right';

interface ImageData {
  src: StaticImageData;
  title?: string;
  subtitle?: string;
  position: Position;
  textPosition: TextPosition;
}

interface GalleryPageProps {
  images: ImageData[];
}

const GalleryPage: React.FC<GalleryPageProps> = ({ images }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.scrollHeight);
    }
  }, [images]);

  return (
    <div className="min-h-screen bg-black text-white">
      <main ref={containerRef} className="relative">
        {images.map((image, index) => (
          <GalleryImage
            key={index}
            {...image}
            index={index}
            total={images.length}
            progress={scrollYProgress}
            containerHeight={containerHeight}
          />
        ))}
      </main>
    </div>
  );
};

interface GalleryImageProps extends ImageData {
  index: number;
  total: number;
  progress: MotionValue<number>;
  containerHeight: number;
}

const GalleryImage: React.FC<GalleryImageProps> = ({ src, title, subtitle, index, position, textPosition }) => {
  const getPositionClass = () => {
    switch (position) {
      case 'left':
        return 'left-0 items-start';
      case 'center':
        return 'left-1/2 -translate-x-1/2 items-center';
      case 'right':
        return 'right-0 items-end';
    }
  };

  const getTextPositionClass = () => {
    switch (textPosition) {
      case 'top':
        return 'top-0 left-0 -translate-y-full pb-4';
      case 'bottom':
        return 'bottom-0 left-0 translate-y-full pt-4';
      case 'left':
        return 'top-1/2 right-full -translate-y-1/2 pr-4';
      case 'right':
        return 'top-1/2 left-full -translate-y-1/2 pl-4';
    }
  };

  return (
    <div
      className={`absolute w-full h-screen bg-black flex ${getPositionClass()}`}
      style={{ top: `${index * 100}vh` }}
    >
      <div className="relative">
        <Image
          src={src}
          alt={`Gallery image ${index + 1}`}
          width={1200}
          height={800}
          className="object-contain max-h-screen"
        />
        {(title || subtitle) && (
          <div className={`absolute ${getTextPositionClass()} text-white max-w-md`}>
            {title && <h2 className="text-xl font-bold">{title}</h2>}
            {subtitle && <p className="text-sm">{subtitle}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  const images: ImageData[] = [
    { 
      src: friends, 
      title: 'We use design and technology to create brands and products', 
      subtitle: 'that perform, delight, and scale.',
      position: 'left',
      textPosition: 'bottom'
    },
    { 
      src: rocks, 
      title: 'Luxury stretch knitwear, now available online', 
      subtitle: 'High Sport',
      position: 'center',
      textPosition: 'top'
    },
    { 
      src: bridge, 
      title: 'Two studios, one mindset', 
      subtitle: 'Automatik VFX / Post Republic',
      position: 'right',
      textPosition: 'right'
    },
    { 
      src: desert, 
      title: 'Telling the story of a life-altering disease through data', 
      subtitle: '1,574 Days: My Life With Long Covid',
      position: 'center',
      textPosition: 'right'
    },
  ];

  return <GalleryPage images={images} />;
}