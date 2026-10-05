'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useOnSpecialProducts } from '@/hooks/useOnSpecialProduct';
import { OnSpecialProduct } from '@/types/product';

const TABS: { key: 'all' | 'fireplace' | 'braai'; label: string }[] = [
  { key: 'all', label: 'All Specials' },
  { key: 'fireplace', label: 'Fireplaces' },
  { key: 'braai', label: 'Braais' },
];

function discountPercent(product: OnSpecialProduct): number {
  if (!product.price || !product.onSpecial) return 0;
  return Math.round(((product.price - product.onSpecial) / product.price) * 100);
}

function detailLink(product: OnSpecialProduct): string {
  return product.category === 'braai' ? `/braais/${product.id}` : `/fireplaces/${product.id}`;
}

export default function SpecialsPage() {
  const { products, loading, activeTab, setActiveTab, page, setPage, totalPages } =
    useOnSpecialProducts();

  const currentTabLabel = TABS.find((t) => t.key === activeTab)?.label || 'All Specials';

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#FAF6EE]">
      
      {/* Main background section  */}
      <section className="relative w-full min-h-[350px] sm:min-h-[400px] flex items-center justify-center text-center px-6 overflow-hidden bg-[#0F0F0F]">
        <Image
          src="/braaihomepage.jpg"
          alt="Elite Specials"
          fill
          priority
          quality={90}
          className="object-cover object-center opacity-35 z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50 z-0" />
        
        <div className="relative text-white space-y-3 max-w-2xl z-10 py-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-semibold tracking-tight">
            Elite Specials
          </h1>
          <p className="text-stone-200 text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto">
            Exclusive deals on premium fireplaces, braais and fire pits. Do not miss
            these limited-time offers.
          </p>
        </div>
      </section>

      {/* The navbar with filters for categories */}
      <section className="w-full bg-[#FAF6EE] py-4 px-6 sm:px-12 border-b border-stone-200/80 sticky top-0 z-20 backdrop-blur-md bg-[#FAF6EE]/90">
        <div className="max-w-6xl mx-auto flex gap-8 text-xs font-bold uppercase tracking-wider">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-2 transition-all relative ${
                activeTab === tab.key
                  ? 'text-[#9E2016] border-b-2 border-[#9E2016]'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* The main content section */}
      <section className="w-full bg-[#FAF6EE] py-12 sm:py-16 px-6 sm:px-12 flex-1">
        
        {/* header for specials */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-[#9E2016]">
            {currentTabLabel}
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-2 font-light max-w-lg mx-auto">
            Hand-picked architectural centerpieces at exceptional prices. Available exclusively while stocks last.
          </p>
          <div className="w-8 h-[1px] bg-stone-300 mx-auto mt-4" />
        </div>

        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-stone-300 border-t-[#9E2016]" />
              <p className="text-stone-500 text-xs sm:text-sm font-medium tracking-wide">
                Loading specials...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white border border-stone-200/80 rounded-sm p-12 text-center space-y-3 my-8 shadow-xs">
              <p className="text-stone-700 font-semibold text-base">
                No specials available in this category right now.
              </p>
              <p className="text-stone-500 text-xs">
                Check back soon or explore our full product range.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/braais"
                className="mt-2 inline-block bg-[#9E2016] text-white text-xs font-bold px-5 py-2.5 rounded-sm uppercase tracking-wider hover:bg-red-800 transition-colors">
                Explore Braais
                </Link>
                <Link
                    href="/fireplaces"
                    className="mt-2 inline-block bg-[#9E2016] text-white text-xs font-bold px-5 py-2.5 rounded-sm uppercase tracking-wider hover:bg-red-800 transition-colors">
                    Explore Fireplaces
                </Link>
                </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {products.map((product) => {
                const discount = discountPercent(product);
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-sm border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* images for products  */}
                      <div className="relative h-56 sm:h-60 w-full bg-stone-100 overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                          <span className="bg-[#9E2016] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-xs shadow-xs">
                            Special
                          </span>
                          {discount > 0 && (
                            <span className="bg-stone-900/90 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-xs shadow-xs">
                              {discount}% Off
                            </span>
                          )}
                        </div>
                      </div>

                      {/* details of the products on special */}
                      <div className="p-5 space-y-2">
                        <p className="text-[10px] font-bold tracking-wider text-[#9E2016] uppercase">
                          {product.brand}
                        </p>
                        <h3 className="font-serif font-bold text-stone-900 text-base line-clamp-1">
                          {product.name}
                        </h3>

                        {/* displaying the price */}
                        <div className="flex items-baseline gap-2.5 pt-1">
                          <span className="text-[#9E2016] font-bold text-lg sm:text-xl">
                            R {product.onSpecial.toLocaleString()}
                          </span>
                          {product.price && (
                            <span className="text-stone-400 text-xs sm:text-sm line-through">
                              R {product.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* link to view details of selected product */}
                    <div className="px-5 pb-5 pt-1">
                      <Link
                        href={detailLink(product)}
                        className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#9E2016] hover:underline transition-all"
                      >
                        View Details &rarr;
                      </Link>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination  */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12 text-xs font-bold text-stone-600">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 hover:text-[#9E2016] disabled:opacity-30 uppercase tracking-wider transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                &lsaquo;
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`w-8 h-8 rounded-xs transition-colors cursor-pointer ${
                    num === page
                      ? 'bg-[#9E2016] text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {num}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 hover:text-[#9E2016] disabled:opacity-30 uppercase tracking-wider transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                &rsaquo;
              </button>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}