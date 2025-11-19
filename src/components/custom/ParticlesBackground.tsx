"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { ParallaxStarField } from "../three/ParallaxStarField";
import { SpaceDistortionPass } from "../three/RadialBlur";
import { AtmosphericEffects, GlowPass } from "../three/AtmosphericEffects";
import { loadTiffTexture } from "@/utils/tiffLoader";

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

      const backgroundGeometry = new THREE.PlaneGeometry(
        planeWidth,
        planeHeight,
      );
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

      // Copy ref to local variable for cleanup
      const container = containerRef.current;

      return () => {
        window.removeEventListener("resize", handleResize);
        cancelAnimationFrame(animationId);

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
  },
);

ParticlesBackground.displayName = "ParticlesBackground";

export default ParticlesBackground;
