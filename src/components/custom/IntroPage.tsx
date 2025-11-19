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
import Image from "next/image";
import styles from "@/styles/fadeIn.module.css";
import Pipboy from "@/components/custom/Pipboy";
import { useTouchDevice } from "@/contexts/TouchContext";
import ErrorBoundary from "@/components/ErrorBoundary";

const Dashboard = lazy(() => import("./Dashboard"));

interface IntroPageProps {
  image: string;
}

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

const IntroPage: React.FC<IntroPageProps> = ({ image }) => {
  const { isTouchDevice } = useTouchDevice();
  const [scrollState, setScrollState] = useState({
    percentage: 0,
    isAtBottom: false,
    isAtTop: true,
  });
  // Loading sequence: video loads → video fades in → UI fades in
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [mediaVisible, setMediaVisible] = useState(false);
  const [uiVisible, setUiVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Detect if the image is a video file
  const isVideo = useMemo(() => {
    const ext = image.split(".").pop()?.toLowerCase();
    return ext === "mp4" || ext === "webm";
  }, [image]);

  // Get video MIME type
  const videoType = useMemo(() => {
    if (image.endsWith(".mp4")) return "video/mp4";
    if (image.endsWith(".webm")) return "video/webm";
    return "video/mp4";
  }, [image]);

  // Handler for when media is ready to display
  const handleMediaLoaded = useCallback(() => {
    if (!mediaLoaded) {
      setMediaLoaded(true);
    }
  }, [mediaLoaded]);

  // Loading sequence: media loads → media fades in → UI fades in
  useEffect(() => {
    if (!mediaLoaded) return;

    // Start media fade-in immediately
    setMediaVisible(true);

    // After media transition completes, show UI
    const uiTimer = setTimeout(() => {
      setUiVisible(true);
    }, 800);

    return () => clearTimeout(uiTimer);
  }, [mediaLoaded]);

  // Poll for video ready state + fallback timeout
  useEffect(() => {
    if (mediaLoaded) return;

    // Poll every 50ms to check if video is ready
    const pollInterval = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState >= 3) {
        setMediaLoaded(true);
        clearInterval(pollInterval);
      }
    }, 50);

    // Fallback: if video takes too long, show anyway after 4s
    const fallbackTimer = setTimeout(() => {
      setMediaLoaded(true);
    }, 4000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(fallbackTimer);
    };
  }, [mediaLoaded]);

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

  // Expose scrollToBottom for Pipboy to use
  const handleScrollToBottomFromPipboy = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

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

  const gradientStyle = useMemo(
    () => ({
      background: `
      linear-gradient(to bottom,
        rgba(0,0,0,${0.2 + scrollState.percentage * 0.008}) 0%,
        rgba(0,0,0,${0.6 + scrollState.percentage * 0.004}) 50%,
        rgba(0,0,0,1) 100%)
    `,
    }),
    [scrollState.percentage],
  );

  return (
    <div
      ref={containerRef}
      className="h-screen w-full overflow-y-scroll relative bg-black text-white"
    >
        {/* Loading overlay - covers everything until video is ready */}
        <div
          className={`absolute inset-0 bg-black z-50 transition-opacity duration-1000 ease-out ${
            mediaVisible ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        />

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0">
            {isVideo ? (
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                onLoadedData={handleMediaLoaded}
                onCanPlayThrough={handleMediaLoaded}
                className="w-full h-full object-cover"
                style={{ objectFit: "cover" }}
              >
                <source src={image} type={videoType} />
              </video>
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
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
          style={gradientStyle}
        />
        <div className="min-h-[200vh] relative z-10">
          <div className="h-screen flex items-center justify-center">
            <div
              className={`h-full w-full flex flex-col items-center justify-center gap-8 transition-all duration-700 ease-out ${
                uiVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="w-full max-w-[800px]">
                <Pipboy
                  isActive={scrollState.percentage < 70}
                  onScrollToSocials={handleScrollToBottomFromPipboy}
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
                      <div className="text-[10px] text-white opacity-40 mb-1">
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
            className={`transition-all duration-1000 pointer-events-none ${
              isFullyDarkened ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className={styles.pipboyContainer}>
              <ErrorBoundary
                fallback={<div className="min-h-screen bg-black" />}
              >
                <Suspense fallback={<div className="min-h-screen bg-black" />}>
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
                  <div className="text-[10px] text-white opacity-40 mt-1">
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
