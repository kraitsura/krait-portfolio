'use client'

import React from 'react';
import Link from 'next/link';
import { Roboto_Mono } from 'next/font/google';

interface NavItem {
  label: string;
  href: string;
}

const robotoMono = Roboto_Mono({ subsets: ['latin'] });

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Contact', href: '/contact' },
];

const Header: React.FC = () => {
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 theme-bg theme-text p-4 transition-opacity duration-300`}
    >
      <nav className={`${robotoMono.className} theme-body container mx-auto flex justify-end items-center`}>
        <ul className="flex space-x-4">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="theme-hover">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;