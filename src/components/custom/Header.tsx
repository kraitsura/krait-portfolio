'use client'

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTouchDevice } from '@/contexts/TouchContext';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/home' },
];

const Header: React.FC = React.memo(() => {
  const { isTouchDevice } = useTouchDevice();
  const pathname = usePathname();
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [shadowColor, setShadowColor] = useState('#ff0000');
  const [navHoverColors, setNavHoverColors] = useState<{[key: number]: {text: string, shadow: string}}>({});

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

  const handleSummarizeClick = () => {
    router.push('/summarize');
  };

  const handleSummarizeHover = () => {
    setShadowColor(getRandomVibrantColor());
    // Prefetch the route on hover for instant loading
    router.prefetch('/summarize');
  };

  const handleNavHover = (index: number) => {
    if (pathname !== '/summarize') return;
    setNavHoverColors(prev => ({
      ...prev,
      [index]: {
        text: getRandomVibrantColor(),
        shadow: getRandomVibrantColor()
      }
    }));
  };

  const handleNavLeave = (index: number) => {
    setNavHoverColors(prev => {
      const newColors = {...prev};
      delete newColors[index];
      return newColors;
    });
  };

  // Update selected index based on current pathname
  // -1 = summarize button, 0 = Home
  useEffect(() => {
    if (pathname === '/summarize') {
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
  // Total items: 3 (-1 = summarize, 0 = Home, 1 = Projects)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Shift + L (next) or Shift + H (previous)
      if (e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault();
        setSelectedIndex((prev) => {
          // -1 -> 0 -> 1 -> -1
          const next = prev + 1;
          return next >= navItems.length ? -1 : next;
        });
      } else if (e.shiftKey && (e.key === 'H' || e.key === 'h')) {
        e.preventDefault();
        setSelectedIndex((prev) => {
          // -1 -> 1 -> 0 -> -1
          const next = prev - 1;
          return next < -1 ? navItems.length - 1 : next;
        });
      } else if (e.shiftKey && e.key === 'Enter' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        if (selectedIndex === -1) {
          router.push('/summarize');
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
        {/* Brutalist button on the left */}
        <div className="w-auto sm:w-[200px]">
          <button
            onClick={handleSummarizeClick}
            onMouseEnter={handleSummarizeHover}
            className={`w-full px-3 py-1 sm:px-4 sm:py-1.5 font-bold text-black transition-all duration-150 hover:translate-x-[3px] hover:translate-y-[3px] active:translate-x-0 active:translate-y-0 active:shadow-none tracking-tight text-xs sm:text-sm ${
              selectedIndex === -1 && pathname !== '/summarize' ? 'ring-2 ring-black ring-offset-2' : ''
            }`}
            style={{
              backgroundColor: '#FFFBF0',
              boxShadow: selectedIndex === -1 && pathname !== '/summarize' ? `6px 6px 0 ${shadowColor}` : `0 0 0 transparent`,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = `6px 6px 0 ${shadowColor}`;
            }}
            onMouseOut={(e) => {
              if (!(selectedIndex === -1 && pathname !== '/summarize')) {
                e.currentTarget.style.boxShadow = `0 0 0 transparent`;
              }
            }}
          >
            ./summarize.sh
          </button>
        </div>

        <div className="w-auto sm:w-[200px] flex flex-col items-end space-y-1">
          {/* Navigation links */}
          <ul className="flex space-x-2 sm:space-x-4 text-sm sm:text-base">
            {navItems.map((item, index) => {
              const hoverColor = navHoverColors[index];
              return (
                <li key={item.href}>
                  <Link
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
                      color: hoverColor?.text,
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
              {/* Black brutalist background box - only on /summarize route */}
              {pathname === '/summarize' && (
                <div className="absolute inset-0 bg-black -z-10"></div>
              )}
              <div className="text-[10px] opacity-40 px-2 py-1">
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