/**
 * Browser detection utilities for handling browser-specific behaviors
 */

/**
 * Detects if the current browser is Safari (desktop or mobile)
 */
export const isSafari = (): boolean => {
  if (typeof window === 'undefined' || !navigator) return false;

  const userAgent = navigator.userAgent.toLowerCase();
  const vendor = (navigator as Navigator & { vendor?: string }).vendor?.toLowerCase() || '';

  // Check for Safari browser (not Chrome which includes 'safari' in UA)
  const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(userAgent) ||
                          vendor.includes('apple');

  return isSafariBrowser;
};

/**
 * Detects if the current browser is mobile Safari (iOS)
 */
export const isMobileSafari = (): boolean => {
  if (typeof window === 'undefined' || !navigator) return false;

  const userAgent = navigator.userAgent.toLowerCase();

  // Check for iOS devices
  const isIOS = /iphone|ipad|ipod/.test(userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPad Pro detection

  return isIOS && isSafari();
};

/**
 * Detects if the current browser is desktop Safari
 */
export const isDesktopSafari = (): boolean => {
  return isSafari() && !isMobileSafari();
};

/**
 * Gets the appropriate video format based on browser support
 */
export const getVideoFormat = (videoPath: string): string => {
  // If already has an extension, replace it
  const basePath = videoPath.replace(/\.(webm|mp4)$/, '');

  // Safari has better MP4 support than WebM
  if (isSafari()) {
    return `${basePath}.mp4`;
  }

  // Default to WebM for other browsers (better compression)
  return `${basePath}.webm`;
};

/**
 * Gets the MIME type for video based on format
 */
export const getVideoMimeType = (videoPath: string): string => {
  if (videoPath.endsWith('.mp4')) {
    return 'video/mp4';
  }
  return 'video/webm';
};