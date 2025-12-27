"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useTouchDevice } from "@/contexts/TouchContext";
import { videoPreloader } from "@/utils/videoPreloader";

// Dynamically import ParticlesBackground to code-split Three.js (~150KB)
const ParticlesBackground = dynamic(
  () => import("./ParticlesBackground"),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 -z-10 bg-black" />
    ),
  }
);


const StartSh: React.FC = () => {
  const { isTouchDevice } = useTouchDevice();
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [showKeystroke, setShowKeystroke] = useState(false);
  const [shadowColor, setShadowColor] = useState('#ff0000');
  const [blogsShadowColor, setBlogsShadowColor] = useState('#ff0000');

  // Loading states for smooth transitions
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [sceneVisible, setSceneVisible] = useState(false);
  const [terminalVisible, setTerminalVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Preload home page video and route for instant navigation
  useEffect(() => {
    // Preload video using centralized service
    videoPreloader.preloadVideo('/gifs/skyscrape.webm');

    // Prefetch the /home route
    router.prefetch('/home');
  }, [router]);

  // Generate random vibrant color
  const getRandomVibrantColor = () => {
    const vibrantColors = [
      '#FF0080', // Hot pink
      '#00FF00', // Lime
      '#0080FF', // Azure
      '#FF00FF', // Magenta
      '#FFFF00', // Yellow
      '#00FFFF', // Cyan
      '#FF4500', // Orange red
      '#8B00FF', // Electric violet
      '#00FF80', // Spring green
      '#FF0040', // Neon red
    ];
    return vibrantColors[Math.floor(Math.random() * vibrantColors.length)];
  };

  // Handler for start.sh button
  const handleStartClick = useCallback(() => {
    // Add loading state to prevent flash of content
    document.body.setAttribute('data-loading', 'true');
    setStarted(true);
    router.push('/home');
  }, [router]);

  // Preload video on hover for faster loading
  const handleStartHover = useCallback(() => {
    // Immediately prefetch the route
    router.prefetch('/home');

    // Trigger aggressive preloading
    videoPreloader.aggressivePreload('/gifs/skyscrape.webm');
  }, [router]);

  // Handler for about.sh button
  const handleAboutClick = useCallback(() => {
    setStarted(true);
    router.push('/about');
  }, [router]);

  const handleAboutHover = () => {
    setShadowColor(getRandomVibrantColor());
    router.prefetch('/about');
  };

  // Handler for blogs.sh button
  const handleBlogsClick = useCallback(() => {
    setStarted(true);
    router.push('/blog');
  }, [router]);

  const handleBlogsHover = () => {
    setBlogsShadowColor(getRandomVibrantColor());
    router.prefetch('/blog');
  };


  // Handler for when scene is ready
  const handleSceneReady = useCallback(() => {
    setSceneLoaded(true);
  }, []);


  // Loading sequence: scene loads → scene fades in → terminal fades in
  useEffect(() => {
    if (!sceneLoaded) return;

    // Start scene fade-in immediately
    setSceneVisible(true);

    // After scene transition completes (1s), show terminal
    const terminalTimer = setTimeout(() => {
      setTerminalVisible(true);
    }, 1000);

    return () => clearTimeout(terminalTimer);
  }, [sceneLoaded]);


  // Fade in keystroke info after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowKeystroke(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Update time every second for terminal prompt
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (started) return; // Only work on intro screen

      if (e.key === "Enter") {
        e.preventDefault();
        handleStartClick();
      } else if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        handleAboutClick();
      } else if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        handleBlogsClick();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [started, handleStartClick, handleAboutClick, handleBlogsClick]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center font-mono"
    >
      <ParticlesBackground onReady={handleSceneReady} visible={sceneVisible} />
      <div
        className={`w-full max-w-md bg-black bg-opacity-70 border border-green-400 rounded-lg p-4 shadow-lg transition-all duration-1000 ease-in-out ${
          terminalVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
        style={{
          boxShadow: terminalVisible
            ? "0 0 20px rgba(74, 222, 128, 0.5)"
            : "none",
        }}
      >
        <div className="flex items-center mb-3">
          <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>

        {/* Custom terminal prompt - powerline style */}
        <div className="mb-6 font-mono text-sm flex items-center justify-between bg-gray-900 px-3 py-2 rounded border border-green-700/30">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-semibold">krait@portfolio</span>
            <span className="text-gray-500">~</span>
            <span className="text-purple-400">❯</span>
            <span className="text-yellow-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              main
            </span>
          </div>
          <span className="text-green-400 text-xs">
            {currentTime.toLocaleTimeString('en-US', { hour12: false })}
          </span>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-2 w-full">
            <button
              onClick={handleStartClick}
              onMouseEnter={handleStartHover}
              className="flex-1 px-2 py-1.5 bg-green-600 text-black font-bold hover:bg-green-500 transition-colors duration-300 text-sm text-center"
            >
              ./start.sh
            </button>
            <button
              onClick={handleAboutClick}
              onMouseEnter={handleAboutHover}
              className="flex-1 px-2 py-1.5 font-bold text-black transition-all duration-150 hover:translate-x-[3px] hover:translate-y-[3px] active:translate-x-0 active:translate-y-0 active:shadow-none tracking-tight text-sm text-center"
              style={{
                backgroundColor: '#FFFBF0',
                boxShadow: `0 0 0 transparent`,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = `6px 6px 0 ${shadowColor}`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 transparent`;
              }}
            >
              ./about.sh
            </button>
            <button
              onClick={handleBlogsClick}
              onMouseEnter={handleBlogsHover}
              className="flex-1 px-2 py-1.5 font-bold text-black transition-all duration-150 hover:translate-x-[3px] hover:translate-y-[3px] active:translate-x-0 active:translate-y-0 active:shadow-none tracking-tight text-sm text-center"
              style={{
                backgroundColor: '#FFFBF0',
                boxShadow: `0 0 0 transparent`,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = `6px 6px 0 ${blogsShadowColor}`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 transparent`;
              }}
            >
              ./blogs.sh
            </button>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-green-600">v1.0.0</p>
            {!isTouchDevice && (
              <p
                className={`text-[10px] text-green-600 transition-opacity duration-700 ${
                  showKeystroke ? "opacity-60" : "opacity-0"
                }`}
              >
                ⏎: Start | a: About | b: Blogs | t: Theme | c: Color
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartSh;
