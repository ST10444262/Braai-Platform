'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useHomeData } from '@/hooks/useHomeData';

export default function HomePage() {
  const { categories, loading } = useHomeData();

  return (
    <div className="w-full flex flex-col">
      {/* Masterfully crafted heat section*/}
      <section className="relative w-full min-h-[600px] flex items-center px-6 sm:px-16 py-24 overflow-hidden">
        <Image
          src="/homebackground.jpg"
          alt="Inflame Showroom Background"
          fill
          priority
          quality={90}
          className="object-cover object-center -z-20"
        />

        {/* Adding an overlay so the text easier to see */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent -z-10" />

        <div className="relative max-w-2xl z-10 space-y-4 text-white">
          <span className="text-xs tracking-widest uppercase text-[#E67E22] font-bold">
            PREMIUM INSTALLATIONS
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold leading-tight">
            Masterfully Crafted Heat
          </h1>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Elevate your space with architecturally designed fireplaces and custom built in and freestanding braais that bring warmth, ritual, and sophisticated style to your home.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="bg-[#9E2016] hover:bg-red-800 text-white text-xs font-bold px-6 py-3 rounded uppercase tracking-wider transition-colors"
            >
              Get an Estimate Quote &rarr;
            </Link>
            <Link
              href="/fireplaces" //REMEMBER TO CHANGE THIS LINK
              className="border border-white/60 hover:border-white text-white text-xs font-bold px-6 py-3 rounded uppercase tracking-wider transition-colors"
            >
              Room Size Calculator
            </Link>
          </div>
        </div>
      </section>

      {/* Range of products section */}
      <section className="w-full bg-[#FAF6EE] py-16 px-6 sm:px-12 text-center">
        <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#9E2016] mb-2">
          Discover Our Range
        </h2>
        <p className="text-stone-600 text-xs sm:text-sm max-w-2xl mx-auto mb-10 leading-relaxed">
          From freestanding fireplaces to custom braais, we bring your vision to life across Cape Town and surrounding areas. Need something completely unique? Get in touch with our team today, and lets design your perfect custom piece.
        </p>

        {loading ? (
          <div className="text-stone-500 py-8">Loading range...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={cat.link}
                className="group relative h-72 rounded overflow-hidden shadow-md block bg-stone-800"
              >
                {cat.image && (
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                <div className="absolute bottom-4 left-4 z-20 text-left">
                  <h3 className="text-white font-semibold text-lg group-hover:text-[#FAF6EE] transition-colors">
                    {cat.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* who we work with section */}
      <section className="w-full bg-[#FAF6EE] pb-20 px-6 sm:px-12 text-center border-t border-stone-200/60">
        <div className="pt-12 mb-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#9E2016] mb-1">
            Who We Work With
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm">
            Elevated by leading brands. Perfected by our team.
          </p>
        </div>

        <div className="max-w-5xl mx-auto flex justify-center items-center">
          <Image
            src="/brands.png" 
            alt="Partner brands including Canature, Henley Stoves, Hergom, and more"
            width={1000}
            height={400}
            className="w-full h-auto object-contain mix-blend-multiply"
          />
        </div>
      </section>

{/* mastering the elements section */}
<section className="relative w-full min-h-[550px] bg-[#0F0F0F] text-white py-20 px-6 sm:px-16 overflow-hidden flex items-center">
  <Image
    src="/mastercraft.jpg"
    alt="Fire embers background"
    fill
    quality={85}
    className="object-cover object-center z-0 opacity-60"
  />


  <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F] via-[#0F0F0F]/80 to-transparent z-10 pointer-events-none" />

  
  <div className="relative max-w-2xl z-20 space-y-6">
    <h2 className="text-3xl sm:text-5xl font-serif font-semibold tracking-wide leading-tight">
      Mastering the<br />Elements
    </h2>
    <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl font-light">
      With over three decades of dedication to the craft, Inflame brings unparalleled expertise to home heating and outdoor cooking. We believe that a fireplace is more than a utility; it is the architectural heart of a home. Our curated selection of premium fireplaces and robust braais ensures exceptional quality, efficiency, and enduring style.
    </p>
    <div className="pt-2 space-y-4">
      <div>
        <p className="text-[#9E2016] text-3xl font-bold tracking-tight">30+</p>
        <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest mt-1">
          YEARS EXPERIENCE
        </p>
      </div>
      <div>
        <Link
          href="/contact"
          className="inline-block border border-[#9E2016] text-[#9E2016] hover:bg-[#9E2016] hover:text-white text-xs font-bold px-6 py-3 rounded-sm uppercase tracking-wider transition-all"
        >
          Get in Contact With Us
        </Link>
      </div>
    </div>
  </div>
</section>
    </div>
  );
}