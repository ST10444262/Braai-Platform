'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useBraaiProducts } from '@/hooks/useBraaiProduct';

export default function BraaisPage() {
  const {products, loading, braaiTypes, fuelTypes, brands, search, setSearch, braaiType, setBraaiType, fuelType, setFuelType, brand, setBrand, sort, setSort, page, setPage, totalPages, clearFilters,} = useBraaiProducts();

  return (
    <div className="w-full flex flex-col bg-[#FAF6EE] min-h-screen">
      {/* Elite braais background section */}
      <section className="relative w-full min-h-[400px] sm:min-h-[450px] bg-[#0F0F0F] text-white flex items-center justify-center text-center px-6 py-16 overflow-hidden">
        <Image
          src="/braaihomepage.jpg"
          alt="Elite Braais Background"
          fill
          priority
          quality={90}
          className="object-cover object-center z-0 opacity-90"
        />

        <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none" />

        <div className="relative max-w-3xl z-20 space-y-3">
          <h1 className="text-3xl sm:text-5xl font-serif font-semibold tracking-tight text-white">
            Elite Braais
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed font-light max-w-xl mx-auto">
            From built-in units to ultra-modern freestanding braais, discover the heart of outdoor cooking.
          </p>
        </div>
      </section>

      {/* Header section for the braais catalogue to follow */}
      <section className="w-full max-w-7xl mx-auto px-6 sm:px-12 pt-12 pb-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#9E2016]">
          Explore Our Range of Braais
        </h2>
        <p className="text-stone-500 text-xs sm:text-sm mt-1 font-light">
          Crafted for the ultimate experience
        </p>
      </section>

      {/* 3. Container for catalogue of products with the side bar for filtering */}
      <section className="w-full max-w-7xl mx-auto px-6 sm:px-12 pb-20">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT SIDEBAR: FILTERS */}
          <aside className="w-full lg:w-64 bg-[#EFECE6] p-6 rounded-sm border border-stone-200/80 space-y-5 shrink-0">
            <div className="flex items-center justify-between border-b border-stone-300/80 pb-3">
              <h3 className="text-base font-serif font-bold text-[#9E2016] tracking-wider uppercase">
                FILTERS
              </h3>
              <button
                onClick={clearFilters}
                className="text-[11px] font-bold uppercase text-[#9E2016] hover:underline transition-all"
              >
                Clear all
              </button>
            </div>

            {/* Filter for product type */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700">
                Product Type
              </label>
              <select
                value={braaiType}
                onChange={(e) => setBraaiType(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-sm px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#9E2016] cursor-pointer"
              >
                <option value="">All Types</option>
                {braaiTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter for fuel type */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700">
                Fuel Type
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-sm px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#9E2016] cursor-pointer"
              >
                <option value="">All Fuel Types</option>
                {fuelTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* filter for brand */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700">
                Brand
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-sm px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#9E2016] cursor-pointer"
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

          {/* The right coloumn for the product grid, search bar and sorting dropdown */}
          <main className="flex-1 w-full space-y-6">
            
            {/* Search bar and the sorting dropdown */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:flex-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search braais..."
                  className="w-full bg-white border border-stone-300 rounded-sm pl-10 pr-4 py-2 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#9E2016] transition-colors"
                />
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full sm:w-auto bg-white border border-stone-300 rounded-sm px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-700 focus:outline-none focus:border-[#9E2016] cursor-pointer"
              >
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {/* States for the product grids */}
            {loading ? (
              <div className="text-center py-24 space-y-3">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-stone-300 border-t-[#9E2016]"></div>
                <p className="text-stone-500 text-sm font-medium">Loading braais...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-stone-200/80 rounded-sm p-12 text-center space-y-3">
                <p className="text-stone-700 font-semibold text-base">No braais match your filters.</p>
                <p className="text-stone-500 text-xs">Try adjusting your search query or clear existing filters.</p>
                <button
                  onClick={clearFilters}
                  className="mt-2 inline-block bg-[#9E2016] text-white text-xs font-bold px-4 py-2 rounded uppercase tracking-wider hover:bg-red-800 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/braais/${product.id}/quote`}
                    className="group bg-white border border-stone-200/80 rounded-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="space-y-3">
                      {/* Container to store the products image */}
                      <div className="relative w-full h-48 sm:h-52 bg-stone-50 rounded-sm overflow-hidden flex items-center justify-center">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Brand and name of product text */}
                      <div>
                        <p className="text-[10px] font-bold tracking-wider text-[#9E2016] uppercase">
                          {product.brand}
                        </p>
                        <h3 className="text-xs sm:text-sm font-bold text-stone-800 line-clamp-2 mt-1 group-hover:text-[#9E2016] transition-colors leading-snug min-h-[2.5rem]">
                          {product.name}
                        </h3>
                      </div>
                    </div>

                    {/* price of the braai */}
                    <div className="pt-3 mt-2 border-t border-stone-100">
                      <p className="text-base sm:text-lg font-bold text-[#9E2016]">
                        R {(product.onSpecial ?? product.price).toLocaleString()}
                      </p>
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
                  className="px-3 py-1.5 hover:text-[#9E2016] disabled:opacity-40 uppercase tracking-wider transition-colors"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`w-8 h-8 rounded-sm transition-colors ${
                      num === page
                        ? 'bg-[#9E2016] text-white'
                        : 'hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 hover:text-[#9E2016] disabled:opacity-40 uppercase tracking-wider transition-colors"
                >
                  Next
                </button>
              </div>
            )}

          </main>
        </div>
      </section>
    </div>
  );
}