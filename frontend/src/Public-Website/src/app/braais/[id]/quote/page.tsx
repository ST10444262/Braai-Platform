'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useBraaiProductDetail } from '@/hooks/useBraaiProductDetail';
import { useQuoteForm } from '@/hooks/useQuoteForm';
import InfoBox from '@/components/InfoBox';

export default function QuoteRequestPage() {
  const params = useParams<{id:string}>();
  const { product, loading } = useBraaiProductDetail(params.id);
  const {firstName, setFirstName, lastName, setLastName, email, setEmail, phoneNumber, setPhoneNumber, message, setMessage, errors, submitting, submitted, submitError, handleSubmit,} = useQuoteForm(params.id);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] bg-[#FAF6EE] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-stone-300 border-t-[#9E2016]" />
          <p className="text-stone-500 text-xs sm:text-sm font-medium tracking-wide">
            Loading quote request...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full min-h-[60vh] bg-[#FAF6EE] flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-2xl font-serif font-semibold text-stone-800 mb-2">
          Product Not Found
        </h2>
        <p className="text-stone-500 text-xs sm:text-sm mb-6">
          The requested product could not be found to request a quote.
        </p>
        <Link
          href="/braais"
          className="bg-[#9E2016] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-sm hover:bg-red-800 transition-colors"
        >
          &larr; Back to Braais
        </Link>
      </div>
    );
  }

  const displayPrice = product.onSpecial ?? product.price;

  return (
    <div className="w-full bg-[#FAF6EE] min-h-screen py-10 sm:py-16 px-6 sm:px-12">
      <div className="max-w-6xl mx-auto">
        
        {/* link to follow when clicking to request quote */}
        <div className="mb-6">
          <Link
            href={`/braais/${product.id}`}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E2016] hover:underline transition-all"
          >
            &larr; Back to Braais
          </Link>
        </div>

        {/* Request a quote heading for page*/}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-stone-900">
            Request a Quote
          </h1>
          <p className="text-stone-500 text-sm mt-1">{product.name}</p>
        </div>

        {/* Grid for the main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left column of the grid, the product summary */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Image of the product as well as the floating info box of the product type */}
            <div className="relative w-full h-[320px] sm:h-[400px] rounded-sm overflow-hidden border border-stone-200/80 bg-white shadow-sm">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                quality={90}
                className="object-cover object-center"
              />

              {(product.braaiType) && (
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-sm shadow-md border border-stone-200/60">
                  <span className="font-serif italic text-xl sm:text-2xl text-stone-900 tracking-wide">
                    {product.braaiType}
                  </span>
                </div>
              )}
            </div>

            {/* Title of the braai and the price */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-stone-900">
                {product.name}
              </h2>
              <p className="text-2xl font-bold text-[#9E2016] mt-2">
                R {displayPrice ? displayPrice.toLocaleString() : 'POA'}
              </p>
            </div>

            {/* Grid for the info box */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
              {product.fuelType && <InfoBox label="Fuel Type" value={product.fuelType} />}
              {product.braaiType && <InfoBox label="Product Type" value={product.braaiType} />}
              
              {product.brand && <InfoBox label="Brand" value={product.brand} />}
            </div>

          </div>

          {/* The quote form on the right side */}
          <div className="lg:col-span-6 bg-white border border-stone-200/80 rounded-sm p-6 sm:p-8 shadow-sm h-fit">
            
            <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-stone-100">
              <svg
                className="w-5 h-5 text-[#9E2016]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-base font-bold text-stone-900 tracking-tight">
                Your Details
              </h3>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h4 className="text-xl font-serif font-semibold text-stone-900">
                  Quote Request Received!
                </h4>
                <p className="text-stone-600 text-sm leading-relaxed max-w-md mx-auto">
                  Thanks! Your quote request has been sent — we typically respond within 24 hours.
                </p>
                <div className="pt-2">
                  <Link
                    href="/braais"
                    className="inline-block bg-[#9E2016] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-sm hover:bg-red-800 transition-colors"
                  >
                    Explore More Products
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                
                {/* Asking for the users full name*/}
                <div>
                  <label htmlFor="fullName" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    First Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your full name"
                    className={`w-full bg-white border rounded-sm px-3.5 py-2.5 text-xs sm:text-sm text-stone-800 placeholder-stone-300 focus:outline-none transition-colors ${
                      errors.firstName
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-stone-300 focus:border-[#9E2016]'
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-red-600 text-xs mt-1 font-medium">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="fullName" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your full name"
                    className={`w-full bg-white border rounded-sm px-3.5 py-2.5 text-xs sm:text-sm text-stone-800 placeholder-stone-300 focus:outline-none transition-colors ${
                      errors.lastName
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-stone-300 focus:border-[#9E2016]'
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-red-600 text-xs mt-1 font-medium">{errors.lastName}</p>
                  )}
                </div>

                {/* Asking for the users email address */}
                <div>
                  <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={`w-full bg-white border rounded-sm px-3.5 py-2.5 text-xs sm:text-sm text-stone-800 placeholder-stone-300 focus:outline-none transition-colors ${
                      errors.email
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-stone-300 focus:border-[#9E2016]'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-xs mt-1 font-medium">{errors.email}</p>
                  )}
                </div>

                {/* asking for the users phone number */}
                <div>
                  <label htmlFor="phone" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+27 00 000 0000"
                    className={`w-full bg-white border rounded-sm px-3.5 py-2.5 text-xs sm:text-sm text-stone-800 placeholder-stone-300 focus:outline-none transition-colors ${
                      errors.phoneNumber
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-stone-300 focus:border-[#9E2016]'
                    }`}
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-600 text-xs mt-1 font-medium">{errors.phoneNumber}</p>
                  )}
                </div>

                {/* Optional additional notes */}
                <div>
                  <label htmlFor="notes" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Any specific requirements or installation details?"
                    className="w-full bg-white border border-stone-300 rounded-sm px-3.5 py-2.5 text-xs sm:text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-[#9E2016] transition-colors resize-none"
                  />
                </div>

                {/* Displaying error from api if an error occurs */}
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-sm">
                    <p className="text-red-600 text-xs font-medium">{submitError}</p>
                  </div>
                )}

                {/* Button to submit quote request */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#9E2016] hover:bg-red-800 disabled:opacity-60 text-white text-xs sm:text-sm font-bold uppercase tracking-wider py-3.5 px-6 rounded-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                  >
                    {submitting ? 'Sending...' : 'Submit Quote Request \u2192'}
                  </button>
                </div>

                <p className="text-center text-[11px] text-stone-400 font-light pt-1">
                  We typically respond within 24 hours.
                </p>

              </form>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}