"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { RocketScene } from "../three/RocketScene";
import { Github, Linkedin, Twitter } from "lucide-react";
import { Roboto_Mono } from "next/font/google";
import { useTouchDevice } from "@/contexts/TouchContext";

const robotoMono = Roboto_Mono({ subsets: ["latin"] });

interface SocialLink {
  name: string;
  icon: React.ReactNode;
  url: string;
}

interface DashboardProps {
  isVisible?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ isVisible = true }) => {
  const { isTouchDevice } = useTouchDevice();
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<RocketScene | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(1); // Start with LinkedIn (middle)
  const [isLaunching, setIsLaunching] = useState(false);

  // Social links configuration
  const socialLinks: SocialLink[] = useMemo(() => [
    {
      name: "GitHub",
      icon: <Github size={48} strokeWidth={1.5} />,
      url: "https://github.com/kraitsura", // Replace with your GitHub
    },
    {
      name: "LinkedIn",
      icon: <Linkedin size={48} strokeWidth={1.5} />,
      url: "https://linkedin.com/in/baaryareddy", // Replace with your LinkedIn
    },
    {
      name: "X",
      icon: <Twitter size={48} strokeWidth={1.5} />,
      url: "https://x.com/kraitsura", // Replace with your X/Twitter
    },
  ], []);

  const handleLaunch = useCallback((url: string) => {
    if (isLaunching || !sceneRef.current) return;

    setIsLaunching(true);
    console.log("Initiating launch sequence...");

    sceneRef.current.shootOff(() => {
      // After animation completes, navigate
      window.open(url, "_blank");
      // Reset after a delay
      setTimeout(() => {
        setIsLaunching(false);
      }, 1000);
    });
  }, [isLaunching]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    // Initialize the rocket scene
    sceneRef.current = new RocketScene(containerRef.current);

    // Handle window resize
    const handleResize = () => {
      sceneRef.current?.handleResize();
    };

    window.addEventListener("resize", handleResize);

    // Copy ref to local variable for cleanup
    const container = containerRef.current;

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      sceneRef.current?.dispose();
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    // Only attach keyboard listeners when Dashboard is visible
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if shift key is pressed (to allow Shift+J/K for page scrolling)
      if (e.shiftKey) return;

      if (isLaunching) return; // Disable during launch

      // 'h' = cycle left, 'l' = cycle right
      if (e.key === "h" || e.key === "H") {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + socialLinks.length) % socialLinks.length,
        );
      } else if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % socialLinks.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleLaunch(socialLinks[selectedIndex].url);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, isLaunching, isVisible, handleLaunch, socialLinks]);

  return (
    <main className={`min-h-screen overflow-hidden ${robotoMono.className}`}>
      {/* Three.js container - Background */}
      <div
        ref={containerRef}
        className="fixed inset-0 w-full h-full"
        style={{
          zIndex: 5,
          pointerEvents: "none",
        }}
      />

      {/* Social Navigation - Centered */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        <div className="flex flex-col items-center gap-6">
          {/* Social buttons */}
          <div className="flex items-center justify-center gap-8 sm:gap-12">
            {socialLinks.map((link, index) => (
              <button
                key={link.name}
                onClick={() => {
                  setSelectedIndex(index);
                  handleLaunch(link.url);
                }}
                disabled={isLaunching}
                className={`
                  relative p-4 sm:p-6
                  transition-all duration-300 ease-in-out
                  disabled:opacity-50 disabled:cursor-not-allowed
                  border border-transparent rounded
                  ${selectedIndex === index ? "social-icon-selected" : ""}
                `}
                style={{
                  pointerEvents: "auto",
                  color: 'var(--theme-primary)'
                }}
                aria-label={link.name}
              >
                <div className="scale-75 sm:scale-100">{link.icon}</div>

                {/* Icon label */}
                <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-[10px] sm:text-xs tracking-wider opacity-60">
                    {link.name}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Keystroke hint - Below buttons, left aligned, hidden on mobile and touch devices */}
          {!isTouchDevice && (
            <div
              className="hidden sm:block text-left self-start mt-8"
              style={{ pointerEvents: "none" }}
            >
              <div className="text-xs opacity-50 font-mono" style={{ color: 'var(--theme-primary)' }}>
                h/l navigate | ⏎ launch
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
