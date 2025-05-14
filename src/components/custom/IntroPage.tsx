"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Dashboard from "./Dashboard";
import styles from "@/styles/fadeIn.module.css";
import Pipboy from "@/components/custom/Pipboy";

interface IntroPageProps {
  images: string[];
}

const IntroPage: React.FC<IntroPageProps> = ({ images }) => {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [randomImageIndex] = useState(() =>
    Math.floor(Math.random() * images.length),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  const scrollToTop = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      container.removeEventListener("scroll", handleScroll);

      setIsAtBottom(false);
      setScrollPercentage(0);

      container.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setTimeout(() => {
        container.addEventListener("scroll", handleScroll);
        setIsAtTop(true);
      }, 1000);
    }
  };

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      requestAnimationFrame(() => {
        const newScrollPercentage =
          (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollPercentage(Math.min(newScrollPercentage, 100));

        setIsAtBottom(newScrollPercentage > 80);
        setIsAtTop(scrollTop < 100);
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

  const isFullyDarkened = scrollPercentage >= 80;

  const scrollToBottom = () => {
    if (containerRef.current) {
      const scrollHeight = containerRef.current.scrollHeight;
      containerRef.current.scrollTo({
        top: scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const NavigationArrow = ({
    direction,
    onClick,
  }: {
    direction: "up" | "down";
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`
        hover:text-green-400
        transition-colors
        cursor-pointer
        p-2
        relative
        ${styles["bounce-and-shimmer"]}
      `}
      aria-label={`Scroll to ${direction === "up" ? "top" : "bottom"}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-8 w-24 opacity-30 pointer-events-none ${direction === "up" ? "-rotate-180" : ""}`}
        viewBox="0 0 48 12"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M2 2 L24 10 L46 2"
        />
      </svg>
    </button>
  );

  return (
    <div className={styles.fadeIn}>
      <div
        ref={containerRef}
        className={`h-screen w-full overflow-y-scroll relative bg-black text-white`}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={images[randomImageIndex]}
              alt="Background"
              layout="fill"
              objectFit="cover"
              unoptimized
              quality={100}
              priority
            />
          </div>
        </div>
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
          style={{
            background: `
              linear-gradient(to bottom,
                rgba(0,0,0,${0.2 + scrollPercentage * 0.008}) 0%,
                rgba(0,0,0,${0.6 + scrollPercentage * 0.004}) 50%,
                rgba(0,0,0,1) 100%)
            `,
          }}
        />
        <div className="min-h-[200vh] relative z-10">
          <div className="h-screen flex items-center justify-center">
            <div className="h-full w-full flex flex-col items-center justify-center gap-8">
              <div className="w-full max-w-[800px]">
                <Pipboy />
                <div className="h-[48px] flex justify-center mt-4 relative z-20">
                  {isAtTop && (
                    <NavigationArrow
                      direction="down"
                      onClick={scrollToBottom}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div
            className={`transition-all duration-1000 ${
              isFullyDarkened
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className={styles.pipboyContainer}>
              <Dashboard />
            </div>
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex justify-center mt-4 z-20">
              <div
                className={`transition-opacity duration-300 ${isAtBottom ? "opacity-100" : "opacity-0"}`}
              >
                <NavigationArrow direction="up" onClick={scrollToTop} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroPage;
