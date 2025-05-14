import React, { useEffect, useRef } from 'react';
import { RocketScene } from '../three/RocketScene';
import GitHubCommitFeed from './CommitFeed';

const Dashboard: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<RocketScene | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize the rocket scene
    sceneRef.current = new RocketScene(containerRef.current);

    // Handle window resize
    const handleResize = () => {
      sceneRef.current?.handleResize();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      sceneRef.current?.dispose();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Three.js container - Background */}
      <div
        ref={containerRef}
        className="fixed inset-0 w-full h-full"
        style={{
          zIndex: 5,
          pointerEvents: 'all'
        }}
      />

      {/* Content overlay */}
      <div className="relative z-10">
        <div 
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[600px] pointer-events-none overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.1)',
          }}
        >
          <div className="h-full pointer-events-auto overflow-y-auto p-6">
            <GitHubCommitFeed username="kraitsura" />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard; 