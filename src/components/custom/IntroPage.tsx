"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
// import Image from "next/image"; // Temporarily unused while background is disabled
import styles from "@/styles/fadeIn.module.css";
import Pipboy from "@/components/custom/Pipboy";
import { useTouchDevice } from "@/contexts/TouchContext";
import { useAppTheme } from "@/contexts/AppThemeContext";
import { useRocketScene } from "@/contexts/RocketSceneContext";
// import { isSafari, getVideoFormat, getVideoMimeType } from "@/utils/browser"; // Temporarily unused
// import { videoPreloader } from "@/utils/videoPreloader"; // Temporarily unused
import ErrorBoundary from "@/components/ErrorBoundary";

const Dashboard = lazy(() => import("./Dashboard"));

interface ActivityEntry {
  id: string;
  type: 'commit' | 'tweet';
  message: string;
  date: string;
  timestamp: string;
  source: string;
  url: string | null;
  isPrivate?: boolean;
  shortHash?: string;
}

interface GithubStats {
  commitsThisWeek: number;
  activeRepos: number;
  currentStreak: number;
}

interface IntroPageProps {
  image: string;
}

// Boot sequence messages
const bootMessages = [
  'INITIALIZING SYSTEM...',
  'LOADING MODULES...',
  'SCANNING MEMORY...',
  'READY',
];

// Memoized NavigationArrow component extracted for performance
const NavigationArrow = memo(
  ({
    direction,
    onClick,
  }: {
    direction: "up" | "down" | "left";
    onClick: () => void;
  }) => {
    const isHorizontal = direction === "left";
    const rotationClass = direction === "up" ? "-rotate-180" : direction === "left" ? "rotate-90" : "";
    const ariaLabel = direction === "left" ? "Go to projects" : `Scroll to ${direction === "up" ? "top" : "bottom"}`;

    return (
      <button
        onClick={onClick}
        className={`
        hover:text-green-400
        transition-colors
        p-2
        relative
        ${styles["bounce-and-shimmer"]}
      `}
        aria-label={ariaLabel}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`${isHorizontal ? "h-8 w-12" : "h-8 w-24"} opacity-30 pointer-events-none ${rotationClass}`}
          viewBox={isHorizontal ? "0 0 12 48" : "0 0 48 12"}
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d={isHorizontal ? "M10 2 L2 24 L10 46" : "M2 2 L24 10 L46 2"}
          />
        </svg>
      </button>
    );
  },
);

NavigationArrow.displayName = "NavigationArrow";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const IntroPage: React.FC<IntroPageProps> = ({ image }) => {
  const searchParams = useSearchParams();
  const isFullInit = searchParams.get('init') === 'true'; // Full boot animation only from splash

  const { isTouchDevice } = useTouchDevice();
  const { theme } = useAppTheme();
  const { setIsInRocketScene } = useRocketScene();
  const isDark = theme === 'dark';

  // Track if component has mounted to prevent hydration flash
  const [hasMounted, setHasMounted] = useState(false);

  const [scrollState, setScrollState] = useState({
    percentage: 0,
    isAtBottom: false,
    isAtTop: true,
  });

  // Boot sequence state - skip if not full init
  const [bootIndex, setBootIndex] = useState(0);
  const [bootComplete, setBootComplete] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  // Logs state (lifted from Pipboy)
  const [activityLogs, setActivityLogs] = useState<ActivityEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [githubStats, setGithubStats] = useState<GithubStats | null>(null);
  const [, setStatsLoading] = useState(true); // Stats loading not critical for init gate

  // UI visibility (only show after boot + logs ready)
  const [initComplete, setInitComplete] = useState(false);

  // Loading sequence: video loads → video fades in → UI fades in
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [mediaVisible, setMediaVisible] = useState(false);
  const [uiVisible, setUiVisible] = useState(false);
  // const [useTransplantedVideo, setUseTransplantedVideo] = useState(false); // Temporarily unused
  const containerRef = useRef<HTMLDivElement>(null);
  // const videoRef = useRef<HTMLVideoElement>(null); // Temporarily unused
  // const videoContainerRef = useRef<HTMLDivElement>(null); // Temporarily unused

  // Background is temporarily disabled - commenting out related code
  /*
  // Detect if the image is a video file
  const isVideo = useMemo(() => {
    const ext = image.split(".").pop()?.toLowerCase();
    return ext === "mp4" || ext === "webm";
  }, [image]);

  // Use correct video format based on browser
  const actualVideoPath = useMemo(() => {
    if (!isVideo) return image;
    // Use MP4 for Safari, keep original for others
    return isSafari() ? getVideoFormat(image) : image;
  }, [image, isVideo]);

  // Get video MIME type
  const videoType = useMemo(() => {
    return getVideoMimeType(actualVideoPath);
  }, [actualVideoPath]);

  // Use preloaded video if available
  const videoSrc = useMemo(() => {
    // Try to get cached blob URL from the preloader service
    const cachedUrl = videoPreloader.getCachedUrl(image);
    return cachedUrl || actualVideoPath;
  }, [image, actualVideoPath]);
  */

  // Handler for when media is ready to display
  const handleMediaLoaded = useCallback(() => {
    if (!mediaLoaded) {
      // Double requestAnimationFrame ensures the browser has painted the first frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setMediaLoaded(true);
        });
      });
    }
  }, [mediaLoaded]);

  // Initialize on mount - determine boot behavior based on URL param
  useEffect(() => {
    setHasMounted(true);
    if (!isFullInit) {
      // Skip boot animation - mark as complete immediately
      setBootIndex(bootMessages.length - 1);
      setBootComplete(true);
    }
  }, [isFullInit]);

  // Boot sequence animation - only for full init from splash
  useEffect(() => {
    if (!hasMounted || !isFullInit) return; // Skip boot animation if not from splash

    const bootInterval = setInterval(() => {
      setBootIndex((prev) => {
        if (prev < bootMessages.length - 1) return prev + 1;
        clearInterval(bootInterval);
        // Mark boot as complete after showing READY
        setTimeout(() => setBootComplete(true), 300);
        return prev;
      });
    }, 400);

    // Random glitch effect
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 100);
    }, 2000);

    return () => {
      clearInterval(bootInterval);
      clearInterval(glitchInterval);
    };
  }, [hasMounted, isFullInit]);

  // Fetch activity logs on mount
  useEffect(() => {
    fetch('/api/git-logs')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch logs');
        return res.json();
      })
      .then(data => {
        setActivityLogs(data.activity || []);
      })
      .catch((err) => {
        console.warn('Failed to load activity logs:', err);
      })
      .finally(() => {
        setLogsLoading(false);
      });
  }, []);

  // Fetch GitHub stats on mount
  useEffect(() => {
    fetch('/api/github-stats')
      .then(res => res.json())
      .then(data => {
        setGithubStats(data);
        setStatsLoading(false);
      })
      .catch(() => setStatsLoading(false));
  }, []);

  // Initialize complete when boot is done AND logs are loaded
  useEffect(() => {
    if (bootComplete && !logsLoading) {
      // Small delay for smooth transition
      const timer = setTimeout(() => {
        setInitComplete(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [bootComplete, logsLoading]);

  // Fallback: ensure init completes even if fetch hangs
  // Shorter timeout if not doing full init (just waiting for logs)
  useEffect(() => {
    const timeout = isFullInit ? 3000 : 1500;
    const fallback = setTimeout(() => {
      if (!initComplete) {
        setLogsLoading(false);
        setBootComplete(true);
      }
    }, timeout);
    return () => clearTimeout(fallback);
  }, [initComplete, isFullInit]);

  // Handler for video loading errors (temporarily disabled with background)
  /*
  const handleVideoError = useCallback(() => {
    // If video fails to load, show content anyway after a delay
    setTimeout(() => {
      setMediaLoaded(true);
      setMediaVisible(true);
    }, 500);
  }, []);
  */

  // Loading sequence: media loads → media fades in → UI fades in
  useEffect(() => {
    if (!mediaLoaded) return;

    // Start media fade-in immediately
    setMediaVisible(true);

    // Wait longer before showing UI to ensure video is visible first
    const uiTimer = setTimeout(() => {
      setUiVisible(true);
    }, 1200); // Increased to ensure video is fully visible before UI

    return () => clearTimeout(uiTimer);
  }, [mediaLoaded]);

  // Only trigger media loaded after initialization is complete
  useEffect(() => {
    if (mediaLoaded || !initComplete) return;
    // Background is disabled, trigger loaded after init
    handleMediaLoaded();
  }, [mediaLoaded, initComplete, handleMediaLoaded]);

  // Poll for video ready state + fallback timeout (disabled with background)
  /*
  useEffect(() => {
    if (mediaLoaded) return;

    // Check immediately if we have a cached video
    if (videoPreloader.getCachedUrl(image)) {
      // We have a cached blob URL, mark as loaded immediately
      handleMediaLoaded();
      return;
    }

    let pollInterval: NodeJS.Timeout | undefined;

    // For Safari, rely more on events than polling
    if (isSafari() && videoRef.current) {
      // Set up event listeners for Safari
      const handleCanPlay = () => {
        handleMediaLoaded();
        if (pollInterval) clearInterval(pollInterval);
      };

      videoRef.current.addEventListener('canplaythrough', handleCanPlay, { once: true });

      // Still poll but less frequently for Safari
      pollInterval = setInterval(() => {
        if (videoRef.current && videoRef.current.readyState >= 3) {
          handleMediaLoaded();
          clearInterval(pollInterval);
        }
      }, 50); // Less frequent polling for Safari
    } else {
      // Chrome/Firefox: use more aggressive polling
      pollInterval = setInterval(() => {
        if (videoRef.current && videoRef.current.readyState === 4) {
          // HAVE_ENOUGH_DATA
          handleMediaLoaded();
          clearInterval(pollInterval);
        }
      }, 25);
    }

    // Fallback: if video takes too long, show anyway after 1s (reduced further)
    const fallbackTimer = setTimeout(() => {
      handleMediaLoaded();
    }, 1000);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      clearTimeout(fallbackTimer);
    };
  }, [mediaLoaded, image, handleMediaLoaded]);
  */

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      requestAnimationFrame(() => {
        const newScrollPercentage =
          (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollState({
          percentage: Math.min(newScrollPercentage, 100),
          isAtBottom: newScrollPercentage > 95,
          isAtTop: scrollTop < 100,
        });
      });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      const scrollHeight = containerRef.current.scrollHeight;
      containerRef.current.scrollTo({
        top: scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === "J" || e.key === "j")) {
        e.preventDefault();
        scrollToBottom();
      } else if (e.shiftKey && (e.key === "K" || e.key === "k")) {
        e.preventDefault();
        scrollToTop();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollToBottom, scrollToTop]);

  const isFullyDarkened = scrollState.percentage >= 95;

  // Sync rocket scene state with context for Header to know
  useEffect(() => {
    setIsInRocketScene(isFullyDarkened);
  }, [isFullyDarkened, setIsInRocketScene]);

  const gradientStyle = useMemo(
    () => {
      if (isDark) {
        return {
          background: `
          linear-gradient(to bottom,
            rgba(0,0,0,${0.2 + scrollState.percentage * 0.008}) 0%,
            rgba(0,0,0,${0.6 + scrollState.percentage * 0.004}) 50%,
            rgba(0,0,0,1) 100%)
        `,
        };
      }
      // Light mode: cream gradient
      return {
        background: `
        linear-gradient(to bottom,
          rgba(255,251,240,${0.2 + scrollState.percentage * 0.008}) 0%,
          rgba(255,251,240,${0.6 + scrollState.percentage * 0.004}) 50%,
          rgba(255,251,240,1) 100%)
      `,
      };
    },
    [scrollState.percentage, isDark],
  );

  // Remove loading state when component mounts
  useEffect(() => {
    document.body.removeAttribute('data-loading');
  }, []);

  // Transplant preloaded video element if available (not for Safari) - temporarily disabled
  /*
  useEffect(() => {
    if (!isVideo || !videoContainerRef.current) return;

    // Safari has issues with video element transplanting - skip for Safari
    if (isSafari()) {
      return;
    }

    const preloadedVideo = (window as Window & { __preloadedVideoElement?: HTMLVideoElement }).__preloadedVideoElement;
    if (preloadedVideo && preloadedVideo.parentNode) {
      // Found a preloaded video element, transplant it

      // Remove from current location
      preloadedVideo.remove();

      // Reset styles for proper display
      preloadedVideo.style.position = '';
      preloadedVideo.style.left = '';
      preloadedVideo.style.width = '100%';
      preloadedVideo.style.height = '100%';
      preloadedVideo.style.opacity = '';
      preloadedVideo.style.pointerEvents = '';
      preloadedVideo.className = 'w-full h-full object-cover';
      preloadedVideo.style.objectFit = 'cover';

      // Add event handlers
      preloadedVideo.onloadeddata = handleMediaLoaded;
      preloadedVideo.oncanplaythrough = handleMediaLoaded;

      // Append to our container
      videoContainerRef.current.appendChild(preloadedVideo);

      // Store reference - type assertion needed since we're manually managing the video element
      (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = preloadedVideo;
      setUseTransplantedVideo(true);

      // If video is already ready, trigger loaded immediately
      if (preloadedVideo.readyState === 4) {
        handleMediaLoaded();
      }

      // Clear the global reference
      delete (window as Window & { __preloadedVideoElement?: HTMLVideoElement }).__preloadedVideoElement;
    }
  }, [isVideo, handleMediaLoaded]);
  */

  return (
    <div
      ref={containerRef}
      className={`intro-container h-screen w-full overflow-y-scroll relative transition-colors duration-300 ${
        isDark ? 'bg-black text-white' : 'bg-[#FFFBF0] text-[#1a1a1a]'
      }`}
    >
        {/* Terminal boot overlay - shows initialization sequence */}
        {/* Only show after mount and if: full init OR logs still loading */}
        {hasMounted && (isFullInit || logsLoading) && (
          <div
            className={`fixed inset-0 z-[100] font-mono overflow-hidden transition-opacity duration-500 ease-out ${
              isDark ? 'bg-black' : 'bg-[#FFFBF0]'
            } ${initComplete ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            {isFullInit ? (
              <>
                {/* CRT scanlines overlay */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.03]"
                  style={{
                    background: `repeating-linear-gradient(
                      0deg,
                      transparent,
                      transparent 2px,
                      ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 2px,
                      ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 4px
                    )`,
                  }}
                />

                {/* Corner brackets */}
                <div className="absolute inset-4 md:inset-8 pointer-events-none">
                  <div
                    className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 opacity-60"
                    style={{ borderColor: 'var(--theme-primary)' }}
                  />
                  <div
                    className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 opacity-60"
                    style={{ borderColor: 'var(--theme-primary)' }}
                  />
                  <div
                    className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 opacity-60"
                    style={{ borderColor: 'var(--theme-primary)' }}
                  />
                  <div
                    className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 opacity-60"
                    style={{ borderColor: 'var(--theme-primary)' }}
                  />
                </div>

                {/* Boot content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <div className={`relative ${glitchActive ? 'animate-glitch' : ''}`}>
                    {/* Horizontal boot messages with * spacers */}
                    <div
                      className="text-xs md:text-sm flex flex-wrap items-center justify-center gap-x-2"
                      style={{ color: 'var(--theme-primary)' }}
                    >
                      {bootMessages.slice(0, bootIndex + 1).map((msg, i) => (
                        <span key={i} className="flex items-center gap-2">
                          {i > 0 && <span className="opacity-40">*</span>}
                          <span
                            className={`transition-opacity duration-200 ${
                              i === bootIndex ? 'opacity-100' : 'opacity-40'
                            }`}
                          >
                            {msg}
                          </span>
                        </span>
                      ))}
                      {/* Blinking cursor inline */}
                      <span
                        className="inline-block w-2 h-4 animate-blink ml-1"
                        style={{ backgroundColor: 'var(--theme-primary)' }}
                      />
                    </div>
                  </div>

                  {/* Static loading bar */}
                  <div className="mt-8 w-48 md:w-64">
                    <div
                      className="h-[2px] w-full"
                      style={{ backgroundColor: 'var(--theme-primary)', opacity: 0.6 }}
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Minimal loading for non-splash navigation - just a pulsing dot */
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full animate-ping opacity-20"
                    style={{ backgroundColor: 'var(--theme-primary)' }}
                  />
                  <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: 'var(--theme-primary)' }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading overlay - covers everything until video is ready */}
        <div
          className={`absolute inset-0 z-50 transition-opacity duration-1000 ease-out ${
            isDark ? 'bg-black' : 'bg-[#FFFBF0]'
          } ${mediaVisible ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        />

        {/* Background video/image temporarily disabled
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute inset-0 transition-opacity duration-1500 ease-out ${
            mediaVisible ? "opacity-100" : "opacity-0"
          }`}>
            {isVideo ? (
              useTransplantedVideo ? (
                // Container for transplanted video
                <div ref={videoContainerRef} className="w-full h-full" />
              ) : (
                // Regular video element
                <video
                  ref={videoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  onLoadedData={handleMediaLoaded}
                  onCanPlayThrough={handleMediaLoaded}
                  onError={handleVideoError}
                  className="w-full h-full object-cover"
                  style={{ objectFit: "cover" }}
                >
                  <source src={videoSrc} type={videoType} />
                </video>
              )
            ) : (
              <Image
                src={image}
                alt="Background"
                fill
                style={{ objectFit: "cover" }}
                quality={75}
                priority
                sizes="100vw"
                onLoad={handleMediaLoaded}
              />
            )}
          </div>
        </div>
        */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
          style={gradientStyle}
        />
        <div className="min-h-[200vh] relative z-10">
          <div className="h-screen flex items-center justify-center">
            <div
              className={`ui-content w-full flex flex-col items-center justify-center gap-8 transition-all duration-700 ease-out ${
                uiVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="w-full max-w-[1000px]">
                <Pipboy
                  isActive={scrollState.percentage < 70}
                  initialLogs={activityLogs}
                  initialStats={githubStats}
                />
                {/* Down arrow - desktop only (touch devices use Socials tab in Pipboy) */}
                {!isTouchDevice && (
                  <div className="h-[48px] flex flex-col items-center justify-center -mt-2 relative z-20">
                    <div
                      className={`flex flex-col items-center transition-all duration-500 ${
                        scrollState.isAtTop
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 -translate-y-2 pointer-events-none"
                      }`}
                    >
                      <div className={`text-[10px] opacity-40 mb-1 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
                        ⇧J
                      </div>
                      <NavigationArrow
                        direction="down"
                        onClick={scrollToBottom}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div
            className={`transition-all duration-1000 ${
              isFullyDarkened ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className={styles.pipboyContainer}>
              <ErrorBoundary
                fallback={<div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-[#FFFBF0]'}`} />}
              >
                <Suspense fallback={<div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-[#FFFBF0]'}`} />}>
                  <Dashboard isVisible={isFullyDarkened} />
                </Suspense>
              </ErrorBoundary>
            </div>
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center mt-4 z-20">
              <div
                className={`transition-all duration-500 flex flex-col items-center ${
                  scrollState.isAtBottom
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-2 pointer-events-none"
                }`}
              >
                <NavigationArrow direction="up" onClick={scrollToTop} />
                {!isTouchDevice && (
                  <div className={`text-[10px] opacity-40 mt-1 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
                    ⇧K
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

    </div>
  );
};

export default IntroPage;
