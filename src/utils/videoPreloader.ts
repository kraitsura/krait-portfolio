/**
 * Centralized video preloading service
 * Handles browser-specific video preloading strategies
 */

import { isSafari, getVideoFormat, getVideoMimeType } from './browser';

// Global cache for preloaded videos
declare global {
  interface Window {
    __videoCache?: Record<string, string>;
    __videoBlobCache?: Record<string, Blob>;
    __preloadedVideoElement?: HTMLVideoElement;
    __preloadedVideo?: string;
  }
}

class VideoPreloaderService {
  private static instance: VideoPreloaderService;
  private preloadedElements: Map<string, HTMLVideoElement> = new Map();

  private constructor() {}

  static getInstance(): VideoPreloaderService {
    if (!VideoPreloaderService.instance) {
      VideoPreloaderService.instance = new VideoPreloaderService();
    }
    return VideoPreloaderService.instance;
  }

  /**
   * Preloads a video using multiple strategies for maximum compatibility
   */
  async preloadVideo(originalPath: string): Promise<void> {
    if (typeof window === 'undefined') return;

    // Use correct format based on browser
    const videoPath = isSafari() ? getVideoFormat(originalPath) : originalPath;
    const mimeType = getVideoMimeType(videoPath);

    // Initialize global cache if needed
    if (!window.__videoCache) {
      window.__videoCache = {};
    }
    if (!window.__videoBlobCache) {
      window.__videoBlobCache = {};
    }

    // Skip if already cached
    if (window.__videoCache[videoPath]) {
      return;
    }

    // Strategy 1: Create hidden video element
    this.createHiddenVideoElement(videoPath);

    // Strategy 2: Add link preload tag
    this.addLinkPreload(videoPath, mimeType);

    // Strategy 3: Fetch as blob (not for Safari on large videos)
    if (!isSafari() || this.isSmallVideo(videoPath)) {
      await this.fetchAsBlob(videoPath);
    }
  }

  /**
   * Creates a hidden video element for preloading
   */
  private createHiddenVideoElement(videoPath: string): HTMLVideoElement {
    const elementId = `preload-${videoPath.replace(/[^a-z0-9]/gi, '-')}`;

    // Check if element already exists
    let video = document.getElementById(elementId) as HTMLVideoElement;
    if (video) return video;

    // Create new video element
    video = document.createElement('video');
    video.id = elementId;
    video.src = videoPath;
    video.preload = 'auto';
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;

    // Hide the element
    video.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 1px;
      height: 1px;
      opacity: 0;
      pointer-events: none;
      z-index: -1;
    `;

    document.body.appendChild(video);
    video.load();
    video.play().catch(() => {
      // Silently handle autoplay restrictions
    });

    // Store reference for potential transplanting (Chrome only)
    if (!isSafari() && videoPath.includes('skyscrape')) {
      window.__preloadedVideoElement = video;
    }

    this.preloadedElements.set(videoPath, video);
    return video;
  }

  /**
   * Adds a link preload tag for the video
   */
  private addLinkPreload(videoPath: string, mimeType: string): void {
    const linkId = `link-preload-${videoPath.replace(/[^a-z0-9]/gi, '-')}`;

    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'preload';
      link.as = 'video';
      link.href = videoPath;
      link.type = mimeType;
      document.head.appendChild(link);
    }
  }

  /**
   * Fetches video as blob and caches the URL
   */
  private async fetchAsBlob(videoPath: string): Promise<void> {
    try {
      const response = await fetch(videoPath);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Store in global cache
      if (window.__videoCache) {
        window.__videoCache[videoPath] = blobUrl;
      }
      if (window.__videoBlobCache) {
        window.__videoBlobCache[videoPath] = blob;
      }

      // Legacy support
      if (videoPath.includes('skyscrape')) {
        window.__preloadedVideo = blobUrl;
      }
    } catch (error) {
      // Silently fail - video preloading is not critical
    }
  }

  /**
   * Checks if a video is small enough for blob caching
   */
  private isSmallVideo(videoPath: string): boolean {
    // Assume videos under 1MB are safe to blob cache
    // This is a heuristic - adjust based on your needs
    return true;
  }

  /**
   * Gets the cached blob URL for a video if available
   */
  getCachedUrl(originalPath: string): string | null {
    if (typeof window === 'undefined' || !window.__videoCache) return null;

    const videoPath = isSafari() ? getVideoFormat(originalPath) : originalPath;
    return window.__videoCache[videoPath] || null;
  }

  /**
   * Triggers aggressive preloading (e.g., on hover)
   */
  aggressivePreload(originalPath: string): void {
    const videoPath = isSafari() ? getVideoFormat(originalPath) : originalPath;

    // Find existing video element and force loading
    const existingVideo = this.preloadedElements.get(videoPath);
    if (existingVideo && existingVideo.readyState < 4) {
      existingVideo.load();
      existingVideo.play().catch(() => {});
    }
  }

  /**
   * Cleans up preloaded elements (call on unmount if needed)
   */
  cleanup(): void {
    // Generally we want to keep preloaded videos cached
    // Only call this if you really need to free memory
    this.preloadedElements.forEach(video => {
      if (video.parentNode) {
        video.parentNode.removeChild(video);
      }
    });
    this.preloadedElements.clear();
  }
}

// Export singleton instance
export const videoPreloader = VideoPreloaderService.getInstance();