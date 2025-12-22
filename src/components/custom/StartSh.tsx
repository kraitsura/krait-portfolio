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
        <h1 className="text-xl md:text-2xl font-bold mb-6 text-green-400">
          Welcome Home, spacecowboy
        </h1>
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
