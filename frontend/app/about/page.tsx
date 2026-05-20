import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="bg-[#fbfaf9] text-[#4a2c2a]">
      {/* 1. Hero Section - Minimalist & Bold */}
      <section className="pt-32 pb-20 px-4 md:px-10 max-w-[1440px] mx-auto text-center">
        {/* <span className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-50 mb-6 block">
          Our Story
        </span>
        <h1 className="text-6xl md:text-8xl font-serif leading-[1.1] mb-12">
          Elevating the <br /> 
          <span className="italic font-light">Ground you walk on.</span>
        </h1> */}
        <div className="relative w-full aspect-[16/9] rounded-sm overflow-hidden shadow-sm">
          <Image 
            src="/images/about-hero.png" // High-res warehouse or showroom shot
            alt="TileBazaar Showroom"
            fill
            sizes="90vw"
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* 2. Philosophy - Split Layout */}
      <section className="py-12 px-4 md:px-10 max-w-[1440px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          <div className="w-full lg:w-1/2">
            <h2 className="text-4xl font-serif mb-8 italic">The Curation Process</h2>
            <div className="space-y-6 text-md md:text-lg leading-relaxed font-light opacity-90">
              <p>
                TileBazaar was born from a simple observation: the market was flooded with tiles, but lacked soul. We traveled to quarries across the globe to find materials that didn’t just cover a floor, but transformed a room.
              </p>
              <p>
                Every collection in our catalogue is vetted for durability, thermal performance, and—most importantly—aesthetic timelessness. We don’t follow trends; we provide the foundation for them.
              </p>
            </div>
          </div>
          <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4">
             <div className="aspect-square relative rounded-sm overflow-hidden">
                <Image src="/images/quality.jpg" fill sizes="90vw" alt="quality" className="object-cover" />
             </div>
             <div className="aspect-square relative rounded-sm overflow-hidden mt-12">
                <Image src="/images/sourcing.jpg" fill sizes="90vw" alt="sourcing" className="object-cover" />
             </div>
          </div>
        </div>
      </section>

      {/* 3. Values Grid */}
      <section className="bg-white py-24 border-y border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div>
              <span className="text-[40px] font-serif italic mb-4 block">01</span>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-4">Unmatched Quality</h4>
              <p className="text-sm leading-relaxed opacity-70">
                We source only Grade A porcelain and ceramic, ensuring each tile meets international standards for wear and tear.
              </p>
            </div>
            <div>
              <span className="text-[40px] font-serif italic mb-4 block">02</span>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-4">Direct Sourcing</h4>
              <p className="text-sm leading-relaxed opacity-70">
                By cutting out the middleman, we provide premium architectural surfaces at a fraction of high-street showroom prices.
              </p>
            </div>
            <div>
              <span className="text-[40px] font-serif italic mb-4 block">03</span>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-4">Eco-Conscious</h4>
              <p className="text-sm leading-relaxed opacity-70">
                We partner with manufacturers who prioritize sustainable firing processes and recycled water usage in production.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA Section */}
      <section className="py-32 text-center bg-[#4a2c2a] text-[#fbfaf9]">
        <h2 className="text-4xl md:text-5xl font-serif mb-8">Ready to start your project?</h2>
        <Link 
          href="/products" 
          className="inline-block border border-[#fbfaf9] px-10 py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#fbfaf9] hover:text-[#4a2c2a] transition-all duration-500"
        >
          View Collection
        </Link>
      </section>
    </main>
  );
}