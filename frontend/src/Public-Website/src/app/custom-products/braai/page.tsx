'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCustomBuildForm } from '@/hooks/useCustomBuildForm';
import CustomBuildTypeSelector from '@/components/CustomBuildTypeSelector';

const BRAAI_TYPES = [
  { label: 'Free Standing Braai', value: 'Free Standing', image: '/freestanding.webp' },
  { label: 'Built In Braai', value: 'Built In', image: '/braaihomepage.jpg' },
  { label: 'Other', value: 'Other', image: '/custom-other.jpg' },
];

export default function CustomBraaiPage() {
  const {selectedType, setSelectedType,widthMm, setWidthMm, heightMm, setHeightMm, depthMm, setDepthMm,firstName, setFirstName, lastName, setLastName, email, setEmail, phone, setPhone,errors, submitting, submitted, submitError, handleSubmit,} = useCustomBuildForm('Braai');

  return (
    <div className="w-full flex flex-col">
      <section className="relative w-full min-h-[300px] flex items-center justify-center text-center px-6 overflow-hidden">
        <Image src="/custombackground.jpg" alt="Elite Braai Engineering" fill priority className="object-cover object-center -z-10" />
        <div className="absolute inset-0 bg-black/50 -z-10" />
        <div className="relative text-white space-y-3 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold">Elite Braai Engineering</h1>
          <p className="text-stone-200 text-sm">Design your perfect braai.</p>
        </div>
      </section>

      <section className="w-full bg-[#FAF6EE] py-16 px-6 sm:px-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#9E2016] text-center mb-6">
            Step 1: Select Braai Type
          </h2>
          <CustomBuildTypeSelector options={BRAAI_TYPES} selected={selectedType} onSelect={setSelectedType} />
          {errors.selectedType && <p className="text-red-600 text-sm text-center mt-2">{errors.selectedType}</p>}

          <div className="bg-stone-100 rounded p-6 sm:p-8 mt-10">
            <h2 className="text-xl font-serif font-semibold text-[#9E2016] mb-1">Step 2: Technical Specifications</h2>
            <p className="text-stone-500 text-sm mb-5">Provide estimated dimensions to help our engineers begin the drafting process.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase text-stone-500 mb-1">Width (mm)</label>
                <input type="number" step="1" value={widthMm} onChange={(e) => setWidthMm(e.target.value)}
                  placeholder="e.g. 1200" className="w-full border border-stone-300 rounded px-3 py-2 text-sm bg-white" />
                {errors.widthMm && <p className="text-red-600 text-xs mt-1">{errors.widthMm}</p>}
              </div>
              <div>
                <label className="block text-xs uppercase text-stone-500 mb-1">Height (mm)</label>
                <input type="number" step="1" value={heightMm} onChange={(e) => setHeightMm(e.target.value)}
                  placeholder="e.g. 800" className="w-full border border-stone-300 rounded px-3 py-2 text-sm bg-white" />
                {errors.heightMm && <p className="text-red-600 text-xs mt-1">{errors.heightMm}</p>}
              </div>
              <div>
                <label className="block text-xs uppercase text-stone-500 mb-1">Depth (mm)</label>
                <input type="number" step="1" value={depthMm} onChange={(e) => setDepthMm(e.target.value)}
                  placeholder="e.g. 500" className="w-full border border-stone-300 rounded px-3 py-2 text-sm bg-white" />
                {errors.depthMm && <p className="text-red-600 text-xs mt-1">{errors.depthMm}</p>}
              </div>
            </div>
          </div>

          <div className="bg-stone-100 rounded p-6 sm:p-8 mt-6">
            <h2 className="text-xl font-serif font-semibold text-[#9E2016] mb-1">Step 3: Contact Details</h2>
            <p className="text-stone-500 text-sm mb-5">Where should we send your preliminary engineering assessment?</p>

            {submitted ? (
              <p className="text-green-700 text-sm">
                Thanks! Your design enquiry has been sent &mdash; our team will be in touch shortly.
              </p>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-stone-500 mb-1">First Name</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                      className="w-full border border-stone-300 rounded px-3 py-2 text-sm bg-white" />
                    {errors.firstName && <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-stone-500 mb-1">Last Name</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                      className="w-full border border-stone-300 rounded px-3 py-2 text-sm bg-white" />
                    {errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-stone-500 mb-1">Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-stone-300 rounded px-3 py-2 text-sm bg-white" />
                    {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-stone-500 mb-1">Phone Number</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-stone-300 rounded px-3 py-2 text-sm bg-white" />
                    {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>

                {submitError && <p className="text-red-600 text-sm">{submitError}</p>}

                <button type="submit" disabled={submitting}
                  className="bg-[#9E2016] hover:bg-red-800 disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded">
                  {submitting ? 'Sending...' : 'Submit Design Enquiry'}
                </button>
              </form>
            )}
          </div>

          <div className="text-center mt-8">
            <Link href="/custom-products" className="text-xs uppercase text-[#9E2016] hover:underline">
              &larr; Back to Custom Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}