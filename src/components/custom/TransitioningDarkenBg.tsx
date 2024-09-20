import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

interface DarkeningBackgroundWithArticleProps {
  opener: string;
  title: string;
  content: string;
  images: string[];
  transitionInterval?: number;
}

const TransitioningDarkenBg: React.FC<DarkeningBackgroundWithArticleProps> = ({
  opener,
  title,
  content,
  images,
  transitionInterval = 60000 
}) => {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const newScrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollPercentage(Math.min(newScrollPercentage, 100));
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  useEffect(() => {
    if (images.length < 2) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        setIsTransitioning(false);
      }, 1500);
    }, transitionInterval);
    return () => clearInterval(interval);
  }, [images, transitionInterval]);

  const isFullyDarkened = scrollPercentage >= 80;

  return (
    <div
      ref={containerRef}
      className={`h-screen w-full overflow-y-scroll relative bg-black text-white`}
    >
      <div className="absolute inset-0 overflow-hidden">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{transitionDelay: isTransitioning ? '500ms' : '0ms'}}
          >
            <Image
              src={image}
              alt={`Background ${index + 1}`}
              layout="fill"
              objectFit="cover"
              unoptimized
              quality={100}
              priority={index === currentImageIndex}
            />
          </div>
        ))}
      </div>
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background: `
            linear-gradient(to bottom, 
              rgba(0,0,0,${0.2 + scrollPercentage * 0.008}) 0%,
              rgba(0,0,0,${0.6 + scrollPercentage * 0.004}) 50%,
              rgba(0,0,0,1) 100%)
          `
        }}
      />
      <div className="min-h-[200vh] relative z-10">
        <div className="h-screen flex items-center justify-center">
          <h1 className="text-6xl font-bold text-red-500 text-shadow">
            {opener}
          </h1>
        </div>
        <section
          className={`px-4 py-16 md:px-8 lg:px-16 max-w-3xl mx-auto transition-opacity duration-1000 ${
            isFullyDarkened ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h2 className="text-3xl font-bold mb-6 text-red-500">{title}</h2>
          <div className="prose prose-invert">
            {content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TransitioningDarkenBg;