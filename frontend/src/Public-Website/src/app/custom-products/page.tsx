import Image from 'next/image';
import Link from 'next/link';



export default function CustomProductsPage() {
  return (
    <div className="w-full flex flex-col">
      <section className="relative w-full min-h-[500px] flex items-center justify-center text-center px-6 overflow-hidden">
        <Image
          src="/custom-products-hero.jpg"
          alt="Masterfully Crafted Custom Products"
          fill
          priority
          className="object-cover object-center -z-10"
        />
        <div className="absolute inset-0 bg-black/55 -z-10" />
        <div className="relative text-white space-y-4 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold leading-tight">
            Masterfully Crafted Custom Products
          </h1>
          <p className="text-stone-200 text-sm sm:text-base leading-relaxed">
            Bring your unique vision to life with our expert team of designers and artisans. From architectural centerpieces to specialized outdoor cooking solutions.
          </p>
        </div>
      </section>
      <section className="w-full bg-[#FAF6EE] py-16 px-6 sm:px-12 text-center">
        <h2 className="text-3xl font-serif font-semibold text-[#9E2016] mb-2">
          Our Custom Capabilities
        </h2>
        <p className="text-stone-500 text-sm max-w-2xl mx-auto mb-10">
          Tailored solutions engineered to exact specifications, combining rugged durability with refined aesthetics.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <CapabilityCard
            image="/custom-fireplace.jpg"
            title="Custom Fireplaces"
            description="Architectural heating solutions tailored to your space. Whether you require a massive room divider or a minimalist suspended focal point, we engineer warmth to your exact aesthetic."
            linkHref="/custom-products/fireplace"
            linkLabel="Enquire Now"
          />
          <CapabilityCard
            image="/custom-braai.jpg"
            title="Custom Braais"
            description="Premium outdoor cooking experiences built to your specifications. From massive spit braais to integrated multi-fuel stations, designed for the serious entertainer."
            linkHref="/custom-products/braai"
            linkLabel="Enquire Now"
          />
          <CapabilityCard
            image="/custom-other.jpg"
            title="Other Projects"
            description="Specialized engineering and unique steel fabrication. If it involves steel, heat, or complex structural design, our artisans can craft it to perfection."
            linkHref="/contact"
            linkLabel="Discuss Your Project"
          />
        </div>
      </section>
    </div>
  );
}
function CapabilityCard({
  image, title, description, linkHref, linkLabel,}: {
  image: string;
  title: string;
  description: string;
  linkHref: string;
  linkLabel: string;
}) {
  return (
    <div className="bg-white rounded shadow-sm overflow-hidden text-left">
      <div className="relative h-56 w-full">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-serif font-semibold text-[#9E2016] mb-2">{title}</h3>
        <p className="text-stone-600 text-sm leading-relaxed mb-4">{description}</p>
        <Link href={linkHref} className="text-xs font-bold uppercase text-[#9E2016]">
          {linkLabel} &rarr;
        </Link>
      </div>
    </div>
  );
} 