'use client';

import Image from 'next/image';
import { useContactUsForm } from '@/hooks/useContactForm'; //importing the custom hook for form input validation

export default function ContactPage() {
    //calling the methods from the contact form hook
  const { formData, errors, submitting, submitted, submitError, handleChange, handleSubmit } = useContactUsForm();

  return (
    <div className="w-full flex flex-col bg-[#FAF6EE]">
      {/* Main section under navbar */}
      <section className="relative w-full min-h-[420px] bg-[#0F0F0F] text-white flex items-center justify-center text-center px-6 py-16 overflow-hidden">
        {/* background image using the image component */}
        <Image 
          src="/homebackground.jpg"
          alt="Inflame Showroom Background"
          fill //tells the image to expand to fill its container
          priority //used to prioritise loading this image as it is the first thing the user sees when going to this page
          quality={85}
          className="object-cover object-center z-0 opacity-40"
        />

        <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none" />

        {/*greetings text in front of the image */}
        <div className="relative max-w-2xl z-20 space-y-3">
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold tracking-tight text-white">
            Get in Touch
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed font-light max-w-xl mx-auto">
            Whether you are looking for a custom installation or need expert advice on our premium range, our team is ready to bring your vision to life.
          </p>
        </div>
      </section>

      {/* Form for user to enter and card on the right with company information */}
      <section className="w-full max-w-6xl mx-auto px-6 sm:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT SIDE: THE CONTACT US FORM */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#9E2016]">
              Send a Message
            </h2>
            {/*Conditional statement, if submitted from hook class is true
            then show the success message box and if false show the contact form
            */}
            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded text-sm space-y-2">
                <p className="font-semibold text-base">Thanks for reaching out!</p>
                <p>We will be in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Input for the users name */}
                <div>
                  <label htmlFor="firstName" className="block text-[11px] uppercase tracking-wider font-bold text-stone-600 mb-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.name} //displaying the value from the hook state
                    onChange={(e) => handleChange('name', e.target.value)} //updating the state when its typed into
                    placeholder="Your Name"
                    className="w-full bg-white border border-stone-200 rounded px-4 py-3 text-stone-800 text-sm focus:outline-none focus:border-[#9E2016] transition-colors"
                  />
                  {/*displaying an error message if the validation for name input failed */}
                  {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Input for users email address */}
                <div>
                  <label htmlFor="email" className="block text-[11px] uppercase tracking-wider font-bold text-stone-600 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email} //displaying the value from the hook state
                    onChange={(e) => handleChange('email', e.target.value)} //updating the state when the user types into it
                    placeholder="your@email.com"
                    className="w-full bg-white border border-stone-200 rounded px-4 py-3 text-stone-800 text-sm focus:outline-none focus:border-[#9E2016] transition-colors"
                  />
                  {/*displaying an error message if the validation for email input failed */}
                  {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Input for the users phone number */}
                <div>
                  <label htmlFor="phone" className="block text-[11px] uppercase tracking-wider font-bold text-stone-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    placeholder="(00) 000-0000"
                    className="w-full bg-white border border-stone-200 rounded px-4 py-3 text-stone-800 text-sm focus:outline-none focus:border-[#9E2016] transition-colors"
                  />
                  {errors.phoneNumber && <p className="text-red-600 text-xs mt-1">{errors.phoneNumber}</p>}
                </div>

                {/* Input for the users message to inflame */}
                <div>
                  <label htmlFor="message" className="block text-[11px] uppercase tracking-wider font-bold text-stone-600 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    placeholder="How can we help you?"
                    className="w-full bg-white border border-stone-200 rounded px-4 py-3 text-stone-800 text-sm focus:outline-none focus:border-[#9E2016] transition-colors resize-none"
                  />
                  {errors.message && <p className="text-red-600 text-xs mt-1">{errors.message}</p>}
                </div>

                {/* displaying error message from server if form submission fails */}
                {submitError && <p className="text-red-600 text-sm">{submitError}</p>}

                {/* Button for user to submit the form */}
                <button
                  type="submit"
                  disabled={submitting} //prevents the user from submitting multiple form requests while the original request is still being completed
                  className="bg-[#9E2016] hover:bg-red-800 disabled:opacity-60 text-white text-xs font-bold px-8 py-3.5 rounded uppercase tracking-wider transition-colors"
                >
                    {/*showing loading text while the form is submitted */}
                  {submitting ? 'Sending...' : 'Send Message'} 
                </button>
              </form>
            )}
          </div>

          {/* RIGHT SIDE: CONTACT INFORMATION CARD */}
          <div className="lg:col-span-5 bg-white border border-stone-200/80 rounded-lg p-8 shadow-sm space-y-6">
            <h3 className="text-2xl font-serif font-semibold text-[#9E2016]">
              Contact Information
            </h3>
            {/*address details with the location icon */}
            <div className="space-y-5 text-stone-700 text-xs sm:text-sm">
              <div className="flex items-start gap-3.5">
                <svg className="w-5 h-5 text-[#9E2016] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm mb-0.5">Visit Us</h4>
                  <p className="text-stone-500 leading-relaxed">
                    31 Honeywell Rd, Retreat,<br />Cape Town, 7945
                  </p>
                </div>
              </div>
                {/*phone company details with a clickable phone number so user can phone the owner straight from the website */}
              <div className="flex items-start gap-3.5">
                <svg className="w-5 h-5 text-[#9E2016] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm mb-0.5">Call Us</h4>
                  <a href="tel:0827246827" className="text-stone-500 hover:text-[#9E2016] transition-colors">
                    082 724 6827
                  </a>
                </div>
              </div>
                {/*Companies email with a clickable link to open the users email automatically */}
              <div className="flex items-start gap-3.5">
                <svg className="w-5 h-5 text-[#9E2016] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm mb-0.5">Email Us</h4>
                  <a href="mailto:larzy@inflame.co.za" className="text-stone-500 hover:text-[#9E2016] transition-colors">
                    leroy@inflame.co.za
                  </a>
                </div>
              </div>

              <hr className="border-stone-200/80 my-4" />
                {/* Businesses trading hours */}
              <div className="flex items-start gap-3.5">
                <svg className="w-5 h-5 text-[#9E2016] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="w-full">
                  <h4 className="font-bold text-stone-900 text-sm mb-1.5">Trading Hours</h4>
                  <div className="space-y-1 text-stone-500 text-xs">
                    <div className="flex justify-between">
                      <span>Mon–Fri:</span>
                      <span className="font-medium text-stone-700">08:00 – 17:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sat:</span>
                      <span className="font-medium text-stone-700">Closed</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sun:</span>
                      <span className="font-medium text-stone-700">Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Section with google maps location of the business */}
      <section className="w-full h-80 sm:h-96 relative border-t border-stone-200">
        {/*The interactive google maps location of business is within an iframe as iframe acts like a mini browser window embedded inside the page  */}
        <iframe
          title="Inflame Location Map"
          src="https://maps.google.com/maps?q=31%20Honeywell%20Rd,%20Retreat,%20Cape%20Town&t=&z=15&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full grayscale-[20%] opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
        />
      </section>
    </div>
  );
}