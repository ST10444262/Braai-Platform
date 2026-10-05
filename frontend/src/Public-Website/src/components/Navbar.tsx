'use client';
//importing next.js react component to allow fast navigation between pages without needing a hard refresh
import Link from "next/link";
import Image from 'next/image';
import { useState } from "react";
import { usePathname } from "next/navigation";

const navigationLinks = [
  { name: 'HOME', href: '/' },
  { name: 'BRAAIS', href: '/braais' },
  { name: 'FIREPLACES', href: '/fireplaces' },
  { name: 'SPECIALS', href: '/specials' },
  { name: 'CUSTOM PRODUCTS', href: '/custom-products' },
  { name: 'CONTACT US', href: '/contact' }
];

export default function Navbar() {
  const pathName = usePathname();
  const [openNavMenu, setOpenNavMenu] = useState(false);
  return (
    <header className="w-full bg-[#FAF6EE] border-b border-stone-200 shadow-sm px-6 sm:px-12 py-3 flex items-center justify-between relative">
      {/* Section for image logo */}
      <Link href="/" className="flex-shrink-0 flex items-center">
        <Image
          src="/INFLAME LOGO (1).jpg" 
          alt="Inflame - Fireplaces, braais & light engineering"
          width={240}
          height={80}
          priority
          className="h-16 sm:h-20 w-auto object-contain mix-blend-multiply"
        />
      </Link>

      {/* Section for navigation links */}
      <nav className="hidden lg:flex items-center gap-6 sm:gap-8 text-xs sm:text-sm font-bold tracking-wider">
        {navigationLinks.map((link) => {
          const isActive = pathName === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`transition-colors duration-150 whitespace-nowrap ${
                isActive
                  ? 'text-[#9E2016]'
                  : 'text-stone-700 hover:text-[#9E2016]'
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Burger menu option that is only available on mobile devices */}
      <button
        onClick={() => setOpenNavMenu((prev) => !prev)}
        className="lg:hidden text-stone-700 p-2"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {openNavMenu ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* code for the dropdown menu */}
      {openNavMenu && (
        <nav className="lg:hidden absolute top-full left-0 w-full bg-[#FAF6EE] border-b border-stone-200 shadow-sm flex flex-col px-6 py-4 gap-4 text-sm font-bold tracking-wider z-50">
          {navigationLinks.map((link) => {
            const isActive = pathName === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setOpenNavMenu(false)}
                className={`transition-colors duration-150 ${
                  isActive
                    ? 'text-[#9E2016]'
                    : 'text-stone-700 hover:text-[#9E2016]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}