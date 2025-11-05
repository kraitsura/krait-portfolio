'use client'

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Roboto_Mono } from 'next/font/google';
import { useTouchDevice } from '@/contexts/TouchContext';
import { useFlashBang } from '@/contexts/FlashBangContext';

interface NavItem {
  label: string;
  href: string;
}

const robotoMono = Roboto_Mono({ subsets: ['latin'] });

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
];

const Header: React.FC = React.memo(() => {
  const { isTouchDevice } = useTouchDevice();
  const { triggerFlash } = useFlashBang();
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

  const handleSummarizeClick = async () => {
    await triggerFlash();
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
  useEffect(() => {
    const currentIndex = navItems.findIndex(item => item.href === pathname);
    setSelectedIndex(currentIndex);
  }, [pathname]);

  const handleLinkClick = useCallback((index: number) => () => {
    setSelectedIndex(index);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Shift + L (next) or Shift + H (previous)
      if (e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % navItems.length);
      } else if (e.shiftKey && (e.key === 'H' || e.key === 'h')) {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + navItems.length) % navItems.length);
      } else if (e.shiftKey && e.key === 'Enter' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        router.push(navItems[selectedIndex].href);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, router]);

  // Hide header on project detail pages
  if (pathname?.startsWith('/projects/') && pathname !== '/projects') {
    return null;
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-transparent theme-text p-4 transition-opacity duration-300`}
    >
      <nav className={`${robotoMono.className} theme-body container mx-auto flex justify-between items-start gap-2`}>
        {/* Brutalist button on the left */}
        <div className="w-auto sm:w-[200px]">
          <button
            onClick={handleSummarizeClick}
            onMouseEnter={handleSummarizeHover}
            className="w-full px-3 py-1 sm:px-4 sm:py-1.5 font-bold text-black transition-all duration-150 hover:translate-x-[3px] hover:translate-y-[3px] active:translate-x-0 active:translate-y-0 active:shadow-none tracking-tight text-xs sm:text-sm"
            style={{
              backgroundColor: '#FFFBF0',
              boxShadow: `0 0 0 transparent`,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = `6px 6px 0 ${shadowColor}`;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = `0 0 0 transparent`;
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