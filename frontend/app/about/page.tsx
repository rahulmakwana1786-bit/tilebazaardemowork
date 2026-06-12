import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="bg-[#fbfaf9] text-[#4a2c2a]">
      {/* 1. Hero Section - Full Bleed */}
      <section className="relative mt-24 w-full h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden bg-white">
        <Image 
          src="/images/about-hero.png" // High-res warehouse or showroom shot
          alt="TileBazaar Showroom"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
      </section>

      {/* 2. Philosophy - Full Width Layout */}
      <section className="py-16 px-4 md:px-10 max-w-[1440px] mx-auto">
        <div className="w-full max-w-8xl mx-auto">
          <h2 className="text-4xl font-serif mb-8 italic">About Tile Bazaar UK</h2>
          <div className="space-y-6 text-md md:text-lg leading-relaxed font-light opacity-90">
            <p>Welcome to Tile Bazaar UK, a leading supplier of premium porcelain tiles, large-format tiles, bathroom tiles, kitchen tiles and outdoor porcelain paving in Slough, Berkshire.
Founded with a simple vision of offering premium quality tiles at factory prices, Tile Bazaar UK has become a trusted destination for homeowners, builders, architects, interior designers and property developers across London and the UK.
We believe that creating beautiful spaces should not come with an excessive price tag. That's why we carefully source high-quality porcelain tiles, marble-effect tiles, stone-effect tiles, wood-effect tiles and contemporary surface solutions that combine style, durability and value.              
            </p>
            <p>
              Whether you're renovating a bathroom, designing a modern kitchen, building a new home or working on a large-scale commercial development, our extensive collection offers solutions for every project and budget. With tiles starting from just £10+VAT per square metre, we make affordable luxury accessible without compromising on quality.
            </p>
            <p>Based in Slough, our tile showroom showcases a wide range of premium floor tiles, wall tiles, bathroom tiles, kitchen tiles, large-format porcelain tiles and outdoor paving products. Customers from Slough, Berkshire, West London and across the UK visit us for expert advice, competitive pricing and access to ready-stock collections.</p>
            <p>In addition to our showroom experience, we provide nationwide delivery, making it easy to order premium porcelain tiles online from anywhere in the UK. Our team works closely with homeowners, contractors, developers and design professionals to help them find the perfect tile solution for residential and commercial spaces.</p>
            <p>At Tile Bazaar UK, we are committed to delivering exceptional quality, outstanding value and a seamless customer experience. From modern beige porcelain tiles and marble-inspired designs to durable outdoor porcelain paving, we help bring every vision to life.</p>
            <p className="font-semibold">Factory Prices. Premium Quality. Ready Stock.</p>
            <p>Visit our Slough showroom or browse our collections online to discover premium porcelain tiles for bathrooms, kitchens, living spaces and outdoor areas throughout the UK.</p>
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

