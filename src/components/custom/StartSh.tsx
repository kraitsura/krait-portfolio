"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Roboto_Mono } from "next/font/google";
import * as THREE from "three";
import { ParallaxStarField } from "../three/ParallaxStarField";
import { SpaceDistortionPass } from "../three/RadialBlur";
import { AtmosphericEffects, GlowPass } from "../three/AtmosphericEffects";
import { loadTiffTexture } from "@/utils/tiffLoader";
import { useTouchDevice } from "@/contexts/TouchContext";

const robotoMono = Roboto_Mono({ subsets: ["latin"] });

interface WeatherData {
  city: string;
  temp: number;
  description: string;
  time: string;
}

interface StartShProps {
  children: React.ReactNode;
}

const StartSh: React.FC<StartShProps> = ({ children }) => {
  const { isTouchDevice } = useTouchDevice();
  const [started, setStarted] = useState(false);
  const [currentInfo, setCurrentInfo] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [infoItems, setInfoItems] = useState<string[]>([]);
  const [showKeystroke, setShowKeystroke] = useState(false);

  // Loading states for smooth transitions
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [sceneVisible, setSceneVisible] = useState(false);
  const [terminalVisible, setTerminalVisible] = useState(false);

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

  // Fetch weather data on mount
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch("/api/weather");
        const data = await response.json();

        const items: string[] = [];

        // Add today's date
        const today = new Date();
        const dateStr = today.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        items.push(dateStr);

        // Add weather for each city
        if (data.weather && Array.isArray(data.weather)) {
          data.weather.forEach((weather: WeatherData) => {
            items.push(
              `${weather.city}: ${weather.time}, ${weather.temp}°F, ${weather.description}`,
            );
          });
        }

        setInfoItems(items);
      } catch (error) {
        console.error("Failed to fetch weather:", error);
        // Fallback to just showing the date
        const today = new Date();
        const dateStr = today.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        setInfoItems([dateStr, "Weather data unavailable"]);
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
        setStarted(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [started, goToNext, goToPrev]);

  if (started) {
    return <>{children}</>;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${robotoMono.className}`}
    >
      <ParticlesBackground
        onReady={handleSceneReady}
        visible={sceneVisible}
      />
      <div
        className={`w-full max-w-md bg-black bg-opacity-70 border border-green-400 rounded-lg p-4 shadow-lg transition-all duration-1000 ease-in-out ${
          terminalVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
        style={{ boxShadow: terminalVisible ? "0 0 20px rgba(74, 222, 128, 0.5)" : "none" }}
      >
        <div className="flex items-center mb-3">
          <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>
        <h1 className="text-xl md:text-2xl font-bold mb-6 text-green-400">
          Welcome to your workspace
        </h1>
        <div className="h-24 flex items-center justify-center mb-6">
          <p className="text-base md:text-lg text-green-400">
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

interface ParticlesBackgroundProps {
  onReady: () => void;
  visible: boolean;
}

const ParticlesBackground: React.FC<ParticlesBackgroundProps> = React.memo(
  ({ onReady, visible }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const textureLoadedRef = useRef(false);
    const sceneReadyRef = useRef(false);

    useEffect(() => {
      if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize performance
    containerRef.current.appendChild(renderer.domElement);
    camera.position.z = 1;

    // Load background TIFF texture with blur filtering
    const backgroundTexture = loadTiffTexture(
      "/images/starbg.tif",
      (texture) => {
        // Apply filtering for soft blur effect
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;

        // Mark texture as loaded and signal ready if scene is ready
        textureLoadedRef.current = true;
        if (sceneReadyRef.current) {
          onReady();
        }
      },
    );

    // Calculate plane size for full screen coverage at z=-500
    const planeZPosition = -500;
    const planeDistance = camera.position.z - planeZPosition; // Actual distance from camera (1 - (-500) = 501)
    const vFOV = camera.fov * (Math.PI / 180); // Convert to radians
    const planeHeightAtDistance = 2 * Math.tan(vFOV / 2) * planeDistance;
    const planeWidthAtDistance = planeHeightAtDistance * camera.aspect;

    // Add 50% buffer to ensure full coverage at edges and during distortion
    // For mobile (rotated 90°), swap dimensions to maintain proper coverage
    const planeHeight = planeHeightAtDistance * 1.5;
    const planeWidth = planeWidthAtDistance * 1.5;

    const backgroundGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    const backgroundMaterial = new THREE.MeshBasicMaterial({
      map: backgroundTexture,
      side: THREE.FrontSide,
      depthWrite: false,
      transparent: true,
      opacity: 0.8, // More faded to hide low resolution
    });
    const backgroundPlane = new THREE.Mesh(
      backgroundGeometry,
      backgroundMaterial,
    );
    backgroundPlane.position.z = planeZPosition;

    // Rotation state for smooth transitions
    let targetRotation = 0;
    let currentRotation = 0;

    // Function to update target rotation based on window size
    const updateRotation = () => {
      const isMobile = window.innerWidth < 768; // Tailwind's md breakpoint
      targetRotation = isMobile ? Math.PI / 2 : 0;
    };

    // Set initial rotation
    updateRotation();
    currentRotation = targetRotation; // Start at target
    backgroundPlane.rotation.z = currentRotation;

    scene.add(backgroundPlane);

    // Atmospheric effects (fog, ambient light) - no solid background color since we have image
    const atmosphere = new AtmosphericEffects(scene, false);

    // Multi-layer parallax star field
    const starField = new ParallaxStarField();
    scene.add(starField);

    // Create render targets for post-processing
    const renderTarget1 = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      },
    );
    const renderTarget2 = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      },
    );

    // Post-processing passes
    const distortionPass = new SpaceDistortionPass(0.06, 0.12); // Subtle distortion with lighter vignette
    const glowPass = new GlowPass(0.25, 0.5); // Enhanced glow on bright stars

    let animationId: number;
    const startTime = Date.now();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Calculate elapsed time for animations
      const elapsedTime = (Date.now() - startTime) / 1000; // Convert to seconds

      // Smooth rotation interpolation (LERP)
      const rotationSpeed = 0.08; // Smooth transition speed
      currentRotation += (targetRotation - currentRotation) * rotationSpeed;
      backgroundPlane.rotation.z = currentRotation;

      // Very slow zoom effect on background (oscillates between 1.0 and 1.12 over ~80 seconds)
      const zoomSpeed = 0.04; // Very slow
      const maxZoom = 0.2; // Maximum 12% zoom
      const isMobile = window.innerWidth < 768;
      const baseScale = isMobile ? 1.1 : 0.8; // Larger scale on mobile
      const zoomFactor =
        baseScale + Math.sin(elapsedTime * zoomSpeed) * maxZoom;

      // Apply zoom while preserving aspect ratio correction from resize
      const vFOV = camera.fov * (Math.PI / 180);
      const actualDistance = camera.position.z - planeZPosition;
      const currentPlaneHeightAtDistance =
        2 * Math.tan(vFOV / 2) * actualDistance;
      const currentPlaneWidthAtDistance =
        currentPlaneHeightAtDistance * camera.aspect;

      const scaleX =
        (currentPlaneWidthAtDistance * 1.5 * zoomFactor) / planeWidth;
      const scaleY =
        (currentPlaneHeightAtDistance * 1.5 * zoomFactor) / planeHeight;
      backgroundPlane.scale.set(scaleX, scaleY, 1);

      // Update star field
      starField.update();

      // Render scene to first render target
      renderer.setRenderTarget(renderTarget1);
      renderer.clear();
      renderer.render(scene, camera);

      // Apply distortion pass (warps space)
      renderer.setRenderTarget(renderTarget2);
      distortionPass.render(renderer, renderTarget2, renderTarget1);

      // Apply glow pass and render to screen
      glowPass.renderToScreen = true;
      glowPass.render(renderer, renderTarget1, renderTarget2);

      renderer.setRenderTarget(null);
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      renderTarget1.setSize(width, height);
      renderTarget2.setSize(width, height);

      // Update rotation based on new window size
      updateRotation();

      // Background plane scale is handled in animate loop with zoom effect
    };

    window.addEventListener("resize", handleResize);

    // Mark scene as ready and start animation
    sceneReadyRef.current = true;

    // If texture is already loaded, signal ready immediately
    if (textureLoadedRef.current) {
      onReady();
    }

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);

      const container = containerRef.current;
      if (container?.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      renderTarget1.dispose();
      renderTarget2.dispose();
      distortionPass.dispose();
      glowPass.dispose();
      atmosphere.dispose();
      starField.dispose();
      backgroundGeometry.dispose();
      backgroundMaterial.dispose();
      backgroundTexture.dispose();
    };
  }, [onReady]);

    return (
      <div
        ref={containerRef}
        className={`absolute inset-0 -z-10 transition-opacity duration-1000 ease-in-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
    );
  }
);

ParticlesBackground.displayName = "ParticlesBackground";

export default StartSh;
