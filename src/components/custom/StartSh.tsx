'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Roboto_Mono } from 'next/font/google';
import * as THREE from 'three';
import { Particles } from '../three/Particles';

const robotoMono = Roboto_Mono({ subsets: ['latin'] });

const quotes = [
  "All of man stood in awe of the first hands that cast tall shadows.",
  "Code is like humor. When you have to explain it, it's bad.",
  "It's hardware that makes a machine fast. It's software that makes a fast machine slow.",
  "There are 10 types of people in the world: those who understand binary, and those who don't.",
  "If debugging is the process of removing software bugs, then programming must be the process of putting them in."
];

interface StartShProps {
  children: React.ReactNode;
}

const StartSh: React.FC<StartShProps> = ({ children }) => {
  const [started, setStarted] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % quotes.length);
      setCurrentQuote('');
      setDisplayedText('');
    }, 10000);
    return () => clearInterval(quoteInterval);
  }, []);

  useEffect(() => {
    setCurrentQuote(quotes[currentIndex]);
  }, [currentIndex]);

  useEffect(() => {
    if (displayedText.length < currentQuote.length) {
      const timer = setTimeout(() => {
        setDisplayedText(currentQuote.slice(0, displayedText.length + 1));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [displayedText, currentQuote]);

  if (started) {
    return <>{children}</>;
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${robotoMono.className}`}>
      <ParticlesBackground />
      <div className="w-full max-w-2xl bg-black bg-opacity-70 border border-green-400 rounded-lg p-8 shadow-lg transform hover:scale-105 transition-transform duration-300" style={{ boxShadow: '0 0 20px rgba(74, 222, 128, 0.5)' }}>
        <div className="flex items-center mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <h1 className="text-2xl md:text-4xl font-bold mb-8 text-green-400">
          Welcome Home, spacecowboy.
        </h1>
        <div className="h-32 flex items-center justify-center mb-8">
          <p className="text-lg md:text-2xl text-green-400">
            $ echo &quot;{displayedText}
            <span className="animate-pulse">_</span>&quot;
          </p>
        </div>
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setStarted(true)}
            className="px-6 py-2 bg-green-600 text-black font-semibold rounded hover:bg-green-500 transition-colors duration-300"
          >
            ./start.sh
          </button>
          <p className="text-sm text-green-600">v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

const ParticlesBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    const particles = new Particles({
      color: 0xFFFFFF,
      size: 0.5,
      rangeH: 100,
      rangeV: 100,
      rangeZ: 50,
      pointCount: 2000,
      speed: 0.15
    });

    scene.add(particles);
    camera.position.z = 1;

    const animate = () => {
      requestAnimationFrame(animate);
      particles.updateConstant();
      renderer.render(scene, camera);
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 -z-10" />;
};

export default StartSh;