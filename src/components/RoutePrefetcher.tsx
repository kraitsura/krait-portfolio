'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Prefetch these routes immediately on app load
// Skip /home since it's API-heavy - let it load on demand
const ROUTES_TO_PREFETCH = ['/about', '/blog', '/projects'];

export default function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    // Small delay to not compete with initial page load
    const timeout = setTimeout(() => {
      ROUTES_TO_PREFETCH.forEach((route) => {
        router.prefetch(route);
      });
    }, 100);

    return () => clearTimeout(timeout);
  }, [router]);

  return null;
}
