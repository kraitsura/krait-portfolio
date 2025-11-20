"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { videoPreloader } from '@/utils/videoPreloader';

// List of videos to preload across the entire app
const VIDEOS_TO_PRELOAD = [
  '/gifs/skyscrape.webm',
  // Add other videos here if needed
];

export default function VideoPreloader() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't preload on the /home page itself
    if (pathname === '/home') return;

    // Preload all videos using the centralized service
    VIDEOS_TO_PRELOAD.forEach(videoSrc => {
      videoPreloader.preloadVideo(videoSrc);
    });
  }, [pathname]);

  return null; // This component doesn't render anything
}