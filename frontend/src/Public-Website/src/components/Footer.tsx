'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [copied, setCopied] = useState(false);

  // copies website link to the users clipboard so they can share the website
  const handleShare = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.origin);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <footer className="w-full bg-[#141414] text-stone-300">
      {/* Main Footer Container - Spread Across Outer Edges */}
      <div className="w-full px-6 sm:px-12 pt-12 pb-10 flex flex-col md:flex-row justify-between items-start gap-8 text-sm">
        
        {/* Left Section: Brand & Interactive Icons */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-serif font-semibold text-white tracking-wide">
            Inflame
          </h2>
          <div className="flex items-center gap-3 text-stone-400 relative">
            {/* button to share website. It copies the url of the website */}
            <button 
              onClick={handleShare}
              aria-label="Share Website" 
              className="hover:text-white transition-colors p-1 -ml-1 relative"
              title="Copy website link"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {copied && (
                <span className="absolute -top-8 left-0 text-[10px] bg-stone-800 text-white px-2 py-1 rounded shadow whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </button>

            {/* Attaching business owners email to email icon */}
            <a 
              href="mailto:leroy@inflame.co.za" 
              aria-label="Email Us" 
              className="hover:text-white transition-colors p-1"
              title="Send an email"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Explore section to different pages of the website */}
        <div className="flex flex-col sm:flex-row gap-10 sm:gap-16 items-start">
          <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
            Explore
          </h3>
          <ul className="space-y-2 text-stone-400 text-xs sm:text-sm">
            <li><Link href="/fireplaces" className="hover:text-white transition-colors">Fireplaces</Link></li>
            <li><Link href="/braais" className="hover:text-white transition-colors">Braais</Link></li>
            <li><Link href="/specials" className="hover:text-white transition-colors">Specials</Link></li>
            <li><Link href="/custom-products" className="hover:text-white transition-colors">Custom Products</Link></li>
          </ul>
        </div>

        {/* contact details and google maps link to business address */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
            Contact
          </h3>
          <ul className="space-y-3 text-stone-400 text-xs sm:text-sm">
            <li>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=31+Honeywell+Rd,+Retreat,+Cape+Town,+7965" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 hover:text-white transition-colors group"
                title="Open location in Google Maps"
              >
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-stone-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>31 Honeywell Rd,<br />Retreat, Cape Town, 7965</span>
              </a>
            </li>
            <li>
              <a 
                href="tel:0827346827" 
                className="flex items-center gap-2.5 hover:text-white transition-colors group"
              >
                <svg className="w-4 h-4 flex-shrink-0 text-stone-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>082 734 6827</span>
              </a>
            </li>
          </ul>
        </div>
        </div>
      </div>

      {/* copywrite bar */}
      <div className="border-t border-stone-800/80">
        <div className="w-full px-6 sm:px-12 py-4 text-xs text-stone-500">
          © {new Date().getFullYear()} Inflame
        </div>
      </div>
    </footer>
  );
}