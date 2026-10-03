'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useParams} from 'next/navigation';
import {useFireplaceProductDetail} from '@/hooks/useFireplaceProductDetail';
import InfoBox from '@/components/InfoBox';

export default function FireplaceDetailPage() {
  const params = useParams<{ id: string }>();
  const { product, loading } = useFireplaceProductDetail(params.id);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] bg-[#FAF6EE] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-stone-300 border-t-[#9E2016]" />
          <p className="text-stone-500 text-xs sm:text-sm font-medium tracking-wide">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }
// if product isnt found then display appropriate error message
  if (!product) {
    return (
      <div className="w-full min-h-[60vh] bg-[#FAF6EE] flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-2xl font-serif font-semibold text-stone-800 mb-2">
          Product Not Found
        </h2>
        <p className="text-stone-500 text-xs sm:text-sm mb-6">
          The requested fireplace could not be found or has been removed.
        </p>
        <Link
          href="/fireplaces"
          className="bg-[#9E2016] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-sm hover:bg-red-800 transition-colors"
        >
          &larr; Back to Fireplaces
        </Link>
      </div>
    );
  }

  const displayPrice = product.onSpecial ?? product.price;

  return (
    <div className="w-full bg-[#FAF6EE] min-h-screen py-10 sm:py-16 px-6 sm:px-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Button to go back to fireplace home page */}
        <div className="mb-8">
          <Link
            href="/fireplaces"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E2016] hover:underline transition-all"
          >
            &larr; Back to Fireplaces
          </Link>
        </div>

        {/* Grid for main product */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Image and floating info box on left side */}
          <div className="lg:col-span-7 relative w-full h-[380px] sm:h-[480px] rounded-sm overflow-hidden border border-stone-200/80 bg-white shadow-sm">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              quality={90}
              className="object-cover object-center"
            />

            {(product.fireplaceType) && (
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-sm shadow-md border border-stone-200/60">
                <span className="font-serif italic text-xl sm:text-2xl text-stone-900 tracking-wide">
                  {product.fireplaceType}
                </span>
              </div>
            )}
          </div>

          {/* product details and info box on right side */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-stone-900 leading-tight">
                {product.name}
              </h1>
              <p className="text-2xl sm:text-3xl font-bold text-[#9E2016] mt-4">
                R {displayPrice ? displayPrice.toLocaleString() : 'POA'}
              </p>
            </div>

            <hr className="border-stone-200/80" />

            {/* grid for info box */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {product.heatOutputKw && <InfoBox label="HeatOutput" value={`${product.heatOutputKw} kW`} />}
              {product.fireplaceType && <InfoBox label="Product Type" value={product.fireplaceType} />}
              
              {product.brand && <InfoBox label="Brand" value={product.brand} />}
            </div>

            {/* Product description underneath the infoboxes */}
            {product.description && (
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light">
                {product.description}
              </p>
            )}

            {/* buttons to call or request a quote */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Link
                href={`/fireplaces/${product.id}/quote`}
                className="w-full bg-[#9E2016] hover:bg-red-800 text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-6 py-4 rounded-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                Request Quote &rarr;
              </Link>

              <a
                href="tel:0827346827"
                className="w-full border border-[#9E2016] text-[#9E2016] hover:bg-[#9E2016] hover:text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-6 py-4 rounded-sm flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Call Us
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}