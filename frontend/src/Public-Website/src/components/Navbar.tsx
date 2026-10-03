'use client';
//importing next.js react component to allow fast navigation between pages without needing a hard refresh
import Link from "next/link";
import Image from 'next/image';
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

  return (
    <header className="w-full bg-[#FAF6EE] border-b border-stone-200 shadow-sm px-6 sm:px-12 py-3 flex items-center justify-between">
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
      <nav className="flex items-center gap-6 sm:gap-8 text-xs sm:text-sm font-bold tracking-wider">
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
    </header>
  );
}