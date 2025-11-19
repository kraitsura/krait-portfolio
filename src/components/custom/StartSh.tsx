"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useTouchDevice } from "@/contexts/TouchContext";

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

interface WeatherData {
  city: string;
  temp: number;
  description: string;
  time: string;
}

const StartSh: React.FC = () => {
  const { isTouchDevice } = useTouchDevice();
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [currentInfo, setCurrentInfo] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  // Initialize with date immediately for instant display
  const [infoItems, setInfoItems] = useState<string[]>(() => {
    const today = new Date();
    return [today.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })];
  });
  const [showKeystroke, setShowKeystroke] = useState(false);
  const [shadowColor, setShadowColor] = useState('#ff0000');

  // Loading states for smooth transitions
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [sceneVisible, setSceneVisible] = useState(false);
  const [terminalVisible, setTerminalVisible] = useState(false);

  // Preload home page video for instant loading on navigation
  useEffect(() => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.src = '/gifs/skyscrape.webm';
    // Start loading the video
    video.load();

    // Also prefetch the /home route
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
    setStarted(true);
    router.push('/home');
  }, [router]);

  // Preload video on hover for faster loading
  const handleStartHover = useCallback(() => {
    // Create video element and preload aggressively
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.src = '/gifs/skyscrape.webm';
    video.load();

    // Also prefetch the route
    router.prefetch('/home');
  }, [router]);

  // Handler for summarize.sh button
  const handleSummarizeClick = () => {
    setStarted(true);
    router.push('/summarize');
  };

  const handleSummarizeHover = () => {
    setShadowColor(getRandomVibrantColor());
    // Prefetch the route on hover for instant loading
    router.prefetch('/summarize');
  };

  // Memoized navigation handlers
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % infoItems.length);
    setCurrentInfo("");
    setDisplayedText("");
  }, [infoItems.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + infoItems.length) % infoItems.length);
    setCurrentInfo("");
    setDisplayedText("");
  }, [infoItems.length]);

  // Handler for when scene is ready
  const handleSceneReady = useCallback(() => {
    setSceneLoaded(true);
  }, []);

  // Fetch weather data on mount (non-blocking - date already shown)
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch("/api/weather");
        const data = await response.json();

        // Add weather for each city to the existing date
        if (data.weather && Array.isArray(data.weather)) {
          const weatherItems = data.weather.map((weather: WeatherData) =>
            `${weather.city}: ${weather.time}, ${weather.temp}°F, ${weather.description}`
          );
          setInfoItems(prev => [...prev, ...weatherItems]);
        }
      } catch (error) {
        console.error("Failed to fetch weather:", error);
        // Silently fail - date is already showing
      }
    };

    fetchWeatherData();
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

  useEffect(() => {
    if (infoItems.length === 0) return;

    const infoInterval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % infoItems.length);
      setCurrentInfo("");
      setDisplayedText("");
    }, 10000);
    return () => clearInterval(infoInterval);
  }, [infoItems]);

  useEffect(() => {
    if (infoItems.length > 0) {
      setCurrentInfo(infoItems[currentIndex]);
    }
  }, [currentIndex, infoItems]);

  useEffect(() => {
    if (displayedText.length < currentInfo.length) {
      const timer = setTimeout(() => {
        setDisplayedText(currentInfo.slice(0, displayedText.length + 1));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [displayedText, currentInfo]);

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

      if (e.shiftKey && (e.key === "J" || e.key === "j")) {
        e.preventDefault();
        goToNext();
      } else if (e.shiftKey && (e.key === "K" || e.key === "k")) {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleStartClick();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [started, goToNext, goToPrev, handleStartClick]);

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
        <div className="h-24 flex items-center justify-center mb-6">
          <p className="text-base md:text-lg text-green-400">
            $ echo &quot;{displayedText}
            <span className="animate-pulse">_</span>&quot;
          </p>
        </div>
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-2 w-auto items-start">
            <button
              onClick={handleStartClick}
              onMouseEnter={handleStartHover}
              className="px-2 py-1.5 bg-green-600 text-black font-bold hover:bg-green-500 transition-colors duration-300 text-sm"
            >
              ./start.sh
            </button>
            <button
              onClick={handleSummarizeClick}
              onMouseEnter={handleSummarizeHover}
              className="px-2 py-1.5 font-bold text-black transition-all duration-150 hover:translate-x-[3px] hover:translate-y-[3px] active:translate-x-0 active:translate-y-0 active:shadow-none tracking-tight text-sm text-left"
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
              ./summarize.sh
            </button>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-sm text-green-600">v1.0.0</p>
            {!isTouchDevice && (
              <p
                className={`text-[10px] text-green-600 transition-opacity duration-700 ${
                  showKeystroke ? "opacity-60" : "opacity-0"
                }`}
              >
                ⇧J/⇧K: Info | ⏎: Start
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartSh;
