'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useFireplaceProducts } from '@/hooks/useFireplaceProduct';
import RoomSizeCalculator from '@/components/RoomSizeCalculator';

export default function FireplacesPage() {
  const { products, loading, fireplaceTypes, powerRatings, brands, search, setSearch, fireplaceType, setFireplaceType, powerRating, setPowerRating, brand, setBrand, sort, setSort, page, setPage, totalPages, clearFilters,} = useFireplaceProducts();

  const [showCalculator, setShowCalculator] = useState(false);

  return (
    <div className="w-full flex flex-col bg-[#FAF6EE] min-h-screen">
      {/* Main background section */}
      <section className="relative w-full min-h-[300px] sm:min-h-[360px] bg-[#0F0F0F] text-white flex items-center justify-center text-center px-6 overflow-hidden">
        <Image
          src="/homebackground.jpg"
          alt="Elite Fireplaces Header"
          fill
          priority
          quality={85}
          className="object-cover object-center opacity-30 z-0"
        />
        <div className="relative max-w-2xl z-10 space-y-3 py-12">
          <h1 className="text-3xl sm:text-5xl font-serif font-semibold tracking-tight">
            Elite Fireplaces
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm font-light leading-relaxed max-w-lg mx-auto">
            From sleek gas inserts to traditional wood-burning stoves, bring warmth and character to your home.
          </p>
        </div>
      </section>

      {/* Fireplace title of the page */}
      <section className="w-full max-w-7xl mx-auto px-6 sm:px-12 pt-10 pb-6 text-center">
        <h2 className="text-2xl sm:text-4xl font-serif font-semibold text-[#9E2016]">
          Explore Our Range of Fireplaces
        </h2>
        <p className="text-stone-500 text-xs sm:text-sm mt-1 font-light">
          Crafted for the ultimate experience
        </p>
      </section>

      {/* container for the catalogue of products and filters */}
      <section className="w-full max-w-7xl mx-auto px-6 sm:px-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* the side bars with filters */}
          <aside className="lg:col-span-3 bg-stone-100/60 border border-stone-200/80 rounded-sm p-5 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="text-xs font-serif font-bold text-[#9E2016] uppercase tracking-wider">
                Filters
              </h3>
              <button
                onClick={clearFilters}
                className="text-[10px] font-bold uppercase tracking-wider text-stone-500 hover:text-[#9E2016] transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* the filter for product type */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-stone-700">
                Product Type
              </label>
              <select
                value={fireplaceType}
                onChange={(e) => setFireplaceType(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xs px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#9E2016]"
              >
                <option value="">All Product Types</option>
                {fireplaceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* the filter for kw power rating */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-stone-700">
                Power Rating
              </label>
              <select
                value={powerRating}
                onChange={(e) => setPowerRating(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xs px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#9E2016]"
              >
                <option value="">All Power Ratings</option>
                {powerRatings.map((kw) => (
                  <option key={kw} value={kw}>
                    {kw} kW
                  </option>
                ))}
              </select>
            </div>

            {/* the filter for the fireplaces brand */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-stone-700">
                Brand
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xs px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#9E2016]"
              >
                <option value="">All Brands</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </aside>

          {/* The section for the main products */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Section for search, sort and room size calculator */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* input for searching */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search fireplaces..."
                  className="w-full bg-white border border-stone-300 rounded-xs pl-3 pr-4 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#9E2016]"
                />
              </div>

              {/* button for room size calculator */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCalculator((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 border border-[#9E2016] px-3.5 py-2 rounded-xs text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    showCalculator
                      ? 'bg-[#9E2016] text-white'
                      : 'text-[#9E2016] hover:bg-[#9E2016] hover:text-white'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m-6 4h6m-6 4h6M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Room Size Calculator
                </button>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-white border border-stone-300 rounded-xs px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-stone-700 focus:outline-none focus:border-[#9E2016]"
                >
                  <option value="name_asc">Sort By: Name A-Z</option>
                  <option value="name_desc">Sort By: Name Z-A</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* dropdown panel for the room size calculator */}
            {showCalculator && (
              <div className="mb-6 border border-stone-200 bg-white p-4 rounded-sm shadow-xs">
                <RoomSizeCalculator />
              </div>
            )}

            {/* the grids for all the products */}
            {loading ? (
              <div className="bg-white border border-stone-200/80 rounded-sm p-16 text-center space-y-2">
                <p className="text-stone-500 text-sm animate-pulse">Loading fireplaces...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-stone-200/80 rounded-sm p-12 text-center space-y-2">
                <p className="text-stone-700 font-semibold text-base">No fireplaces match your filters.</p>
                <p className="text-stone-500 text-xs">Try clearing filters or adjusting your search keywords.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/fireplaces/${product.id}`}
                    className="group bg-white border border-stone-200/80 rounded-sm overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200"
                  >
                    <div>
                {/* images for each product. Also checks if an image is on special and displays that its on special if it is*/}
                <div className="relative w-full h-52 sm:h-56 bg-stone-100 overflow-hidden">
                    {product.onSpecial != null && (
                    <span className="absolute top-2 left-2 bg-[#9E2016] text-white text-[10px] font-bold uppercase px-2 py-1 rounded-sm z-10">
                        Special
                    </span>
                    )}
                    <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                </div>

                <div className="p-4 space-y-1">
                    <p className="text-[10px] font-bold tracking-wider text-stone-400 uppercase">
                    {product.brand}
                    </p>
                    <h3 className="text-sm font-serif font-bold text-stone-900 line-clamp-1">
                    {product.name}
                    </h3>

                    {/* displaying the price */}
                    <p className="text-base font-bold text-[#9E2016] pt-1">
                    R {(product.onSpecial ?? product.price).toLocaleString()}
                    {product.onSpecial != null && (
                        <span className="text-stone-400 text-xs font-normal line-through ml-2">
                        R {product.price.toLocaleString()}
                        </span>
                    )}
                    </p>
                </div>
                    </div>

                    <div className="px-4 pb-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#9E2016]">
                        View Details &rarr;
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* pagination at bottom of page */}
            {!loading && totalPages > 1 && (
              <div className="pt-8 flex items-center justify-center gap-2 text-xs font-bold text-stone-600">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2 py-1 hover:text-[#9E2016] disabled:opacity-30 uppercase tracking-wider transition-colors"
                >
                  &lt; Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`w-7 h-7 rounded-xs transition-colors ${
                      num === page
                        ? 'bg-[#9E2016] text-white'
                        : 'bg-white border border-stone-200 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2 py-1 hover:text-[#9E2016] disabled:opacity-30 uppercase tracking-wider transition-colors"
                >
                  Next &gt;
                </button>
              </div>
            )}

          </div>

        </div>
      </section>
    </div>
  );
}