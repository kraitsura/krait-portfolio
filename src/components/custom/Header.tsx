'use client'

import Link from 'next/link'

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Projects', href: '/projects' },
  //{ label: 'Blog', href: '/blog' },
  //{ label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
]

const Header: React.FC = () => {

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 bg-black text-white p-4 transition-opacity duration-300"
    >
      <nav className="container mx-auto flex justify-end items-center">
        <ul className="flex space-x-4">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="hover:text-gray-300">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export default Header