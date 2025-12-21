'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTouchDevice } from '@/contexts/TouchContext';
import { useAppTheme } from '@/contexts/AppThemeContext';
import { useThemeColor } from '@/contexts/ThemeColorContext';
import { useRocketScene } from '@/contexts/RocketSceneContext';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/home' },
  { label: 'Projects', href: '/projects' },
];

const Header: React.FC = React.memo(() => {
  const { isTouchDevice } = useTouchDevice();
  const { theme } = useAppTheme();
  const { color } = useThemeColor();
  const { isInRocketScene } = useRocketScene();
  const pathname = usePathname();
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [navHoverColors, setNavHoverColors] = useState<{[key: number]: {text: string, shadow: string}}>({});

  // When on black background (about page or light mode), white should stay white
  const hasBlackBackground = pathname === '/about' || theme === 'light';
  const keystrokeColor = useMemo(() => {
    if (hasBlackBackground && color === 'white') {
      return '#F5F5F5'; // Keep white on black background
    }
    return 'var(--theme-primary)';
  }, [hasBlackBackground, color]);

  // In Rocket Scene (dark space background) in light mode with white selected, nav links should be white
  const navLinkColor = useMemo(() => {
    if (isInRocketScene && theme === 'light' && color === 'white') {
      return '#F5F5F5';
    }
    return undefined; // Use default theme color
  }, [isInRocketScene, theme, color]);

  // Generate random vibrant color
  const getRandomVibrantColor = () => {
    const vibrantColors = [
      '#FF0080', // Hot pink
      '#00FF00', // Lime
      '#0080FF', // Azure
      '#FF00FF', // Magenta
      '#FFFF00', // Yellow
      '#00FFFF', // Cyan
      '#FF4500', // Orange red
      '#8B00FF', // Electric violet
      '#00FF80', // Spring green
      '#FF0040', // Neon red
    ];
    return vibrantColors[Math.floor(Math.random() * vibrantColors.length)];
  };

  const [aboutShadowColor, setAboutShadowColor] = useState('#ff0000');
  const [blogShadowColor, setBlogShadowColor] = useState('#ff0000');

  const handleAboutClick = () => {
    router.push('/about');
  };

  const handleBlogClick = () => {
    router.push('/blog');
  };

  const handleAboutHover = () => {
    setAboutShadowColor(getRandomVibrantColor());
    router.prefetch('/about');
  };

  const handleBlogHover = () => {
    setBlogShadowColor(getRandomVibrantColor());
    router.prefetch('/blog');
  };

  const handleNavHover = (index: number) => {
    // Apply random color hover effect on /about page OR in light mode
    if (pathname === '/about' || theme === 'light') {
      setNavHoverColors(prev => ({
        ...prev,
        [index]: {
          text: getRandomVibrantColor(),
          shadow: getRandomVibrantColor()
        }
      }));
    }
  };

  const handleNavLeave = (index: number) => {
    setNavHoverColors(prev => {
      const newColors = {...prev};
      delete newColors[index];
      return newColors;
    });
  };

  // Update selected index based on current pathname
  // -2 = about button, -1 = blog button, 0 = Home, 1 = Projects
  useEffect(() => {
    if (pathname === '/about') {
      setSelectedIndex(-2);
    } else if (pathname === '/blog' || pathname?.startsWith('/blog/')) {
      setSelectedIndex(-1);
    } else {
      const currentIndex = navItems.findIndex(item => item.href === pathname);
      // Default to Home (0) if page not found in navItems
      setSelectedIndex(currentIndex === -1 ? 0 : currentIndex);
    }
  }, [pathname]);

  const handleLinkClick = useCallback((index: number) => () => {
    setSelectedIndex(index);
  }, []);

  // Keyboard navigation
  // Total items: 4 (-2 = about, -1 = blog, 0 = Home, 1 = Projects)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Shift + L (next) or Shift + H (previous)
      if (e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault();
        setSelectedIndex((prev) => {
          // -2 -> -1 -> 0 -> 1 -> -2
          const next = prev + 1;
          return next >= navItems.length ? -2 : next;
        });
      } else if (e.shiftKey && (e.key === 'H' || e.key === 'h')) {
        e.preventDefault();
        setSelectedIndex((prev) => {
          // -2 -> 1 -> 0 -> -1 -> -2
          const next = prev - 1;
          return next < -2 ? navItems.length - 1 : next;
        });
      } else if (e.shiftKey && e.key === 'Enter' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        if (selectedIndex === -2) {
          router.push('/about');
        } else if (selectedIndex === -1) {
          router.push('/blog');
        } else {
          router.push(navItems[selectedIndex].href);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, router]);

  // Hide header on splash screen and project detail pages
  if (pathname === '/' || (pathname?.startsWith('/projects/') && pathname !== '/projects')) {
    return null;
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-transparent theme-text p-4 transition-opacity duration-300`}
    >
      <nav className="font-mono theme-body container mx-auto flex justify-between items-start gap-2">
        {/* Brutalist buttons on the left */}
        <div className="flex gap-2">
          <button
            suppressHydrationWarning
            onClick={handleAboutClick}
            onMouseEnter={handleAboutHover}
            className={`w-[70px] sm:w-[80px] px-2 py-1 sm:px-3 sm:py-1.5 font-bold text-black transition-all duration-150 hover:translate-x-[3px] hover:translate-y-[3px] active:translate-x-0 active:translate-y-0 active:shadow-none tracking-tight text-xs sm:text-sm ${
              selectedIndex === -2 && theme !== 'light' ? 'ring-2 ring-black ring-offset-2' : ''
            }`}
            style={{
              backgroundColor: '#FFFBF0',
              boxShadow: selectedIndex === -2 ? `6px 6px 0 ${aboutShadowColor}` : `0 0 0 transparent`,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = `6px 6px 0 ${aboutShadowColor}`;
            }}
            onMouseOut={(e) => {
              if (selectedIndex !== -2) {
                e.currentTarget.style.boxShadow = `0 0 0 transparent`;
              }
            }}
          >
            /about
          </button>
          <button
            suppressHydrationWarning
            onClick={handleBlogClick}
            onMouseEnter={handleBlogHover}
            className={`w-[70px] sm:w-[80px] px-2 py-1 sm:px-3 sm:py-1.5 font-bold text-black transition-all duration-150 hover:translate-x-[3px] hover:translate-y-[3px] active:translate-x-0 active:translate-y-0 active:shadow-none tracking-tight text-xs sm:text-sm ${
              selectedIndex === -1 && theme !== 'light' ? 'ring-2 ring-black ring-offset-2' : ''
            }`}
            style={{
              backgroundColor: '#FFFBF0',
              boxShadow: selectedIndex === -1 ? `6px 6px 0 ${blogShadowColor}` : `0 0 0 transparent`,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = `6px 6px 0 ${blogShadowColor}`;
            }}
            onMouseOut={(e) => {
              if (selectedIndex !== -1) {
                e.currentTarget.style.boxShadow = `0 0 0 transparent`;
              }
            }}
          >
            /blog
          </button>
        </div>

        <div className="w-auto sm:w-[200px] flex flex-col items-end space-y-1">
          {/* Navigation links */}
          <ul className="flex space-x-2 sm:space-x-4 text-sm sm:text-base">
            {navItems.map((item, index) => {
              const hoverColor = navHoverColors[index];
              return (
                <li key={item.href} suppressHydrationWarning>
                  <Link
                    suppressHydrationWarning
                    href={item.href}
                    onClick={handleLinkClick(index)}
                    onMouseEnter={() => handleNavHover(index)}
                    onMouseLeave={() => handleNavLeave(index)}
                    className={`theme-hover transition-all duration-200 ${
                      selectedIndex === index
                        ? 'text-shadow font-bold border-b-2 border-current'
                        : ''
                    }`}
                    style={{
                      color: hoverColor?.text || navLinkColor,
                      textShadow: hoverColor?.shadow ? `4px 4px 0 ${hoverColor.shadow}` : undefined,
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Vim-style keystroke indicator */}
          {!isTouchDevice && (
            <div className="relative">
              {/* Black background box - on about page or in light mode */}
              {hasBlackBackground && (
                <div className="absolute inset-0 bg-black -z-10"></div>
              )}
              <div
                className={`text-[10px] px-2 py-1 opacity-40`}
                style={{
                  color: keystrokeColor,
                  opacity: hasBlackBackground ? 0.9 : undefined,
                }}
              >
                ⇧H/⇧L nav | ⇧⏎ select
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;