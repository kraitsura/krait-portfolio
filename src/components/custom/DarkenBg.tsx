'use client'
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

import backgroundGif from '@/assets/21e2e73eb9a9984e3b407328f65f5e5b.gif'

interface DarkeningBackgroundWithArticleProps {
  title: string;
  content: string;
}

const DarkenBg: React.FC<DarkeningBackgroundWithArticleProps> = ({ title, content }) => {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const newScrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollPercentage(Math.min(newScrollPercentage, 100));
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const isFullyDarkened = scrollPercentage >= 80;

  return (
    <div
      ref={containerRef}
      className="h-screen w-full overflow-y-scroll relative bg-black text-white"
    >
      <div className="absolute inset-0">
        <Image
          src={backgroundGif}
          alt="Background GIF"
          layout="fill"
          objectFit="cover"
          quality={100}
        />
      </div>
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle, transparent 20%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.8) 100%),
            linear-gradient(to bottom, 
              rgba(0,0,0,${0.2 + scrollPercentage * 0.008}) 0%,
              rgba(0,0,0,${0.6 + scrollPercentage * 0.004}) 50%,
              rgba(0,0,0,${1}) 100%)
          `
        }}
      />
      <div className="min-h-[200vh] relative z-10">
        <div className="h-screen flex items-center justify-center">
          <h1 className="text-4xl font-bold text-red-500 text-shadow">Scroll to read the article</h1>
        </div>
        <section
          className={`px-4 py-16 md:px-8 lg:px-16 max-w-3xl mx-auto transition-opacity duration-500 ${
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

export default DarkenBg;





