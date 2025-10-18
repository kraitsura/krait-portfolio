'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Roboto_Mono } from 'next/font/google';
import { useTouchDevice } from '@/contexts/TouchContext';

interface NavItem {
  label: string;
  href: string;
}

const robotoMono = Roboto_Mono({ subsets: ['latin'] });

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
];

const Header: React.FC = () => {
  const { isTouchDevice } = useTouchDevice();
  const pathname = usePathname();
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Update selected index based on current pathname
  useEffect(() => {
    const currentIndex = navItems.findIndex(item => item.href === pathname);
    if (currentIndex !== -1) {
      setSelectedIndex(currentIndex);
    }
  }, [pathname]);

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
      <nav className={`${robotoMono.className} theme-body container mx-auto flex justify-end items-start`}>
        <div className="flex flex-col items-end space-y-1">
          {/* Navigation links */}
          <ul className="flex space-x-4">
            {navItems.map((item, index) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setSelectedIndex(index)}
                  className={`theme-hover transition-all duration-200 ${
                    selectedIndex === index
                      ? 'text-shadow font-bold border-b-2 border-current'
                      : ''
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Vim-style keystroke indicator */}
          {!isTouchDevice && (
            <div className="text-[10px] opacity-40">
              ⇧H/⇧L nav | ⇧⏎ select
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;