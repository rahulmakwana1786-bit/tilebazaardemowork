// import React from 'react';
// import Image from 'next/image';

// export default function AboutSection() {
//   return (
//     <section className="relative py-24 md:py-32 bg-[#fbfaf9] overflow-hidden">
//       <div className="max-w-[1440px] mx-auto px-4 md:px-10">
//         <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          
//           {/* Left Side: Visual Story */}
//           <div className="relative w-full lg:w-1/2 group">
//             <div className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-sm">
//               <Image
//                 src="/images/about-tiles.png" // Use a high-res architectural tile shot
//                 alt="TileBazaar Craftsmanship"
//                 fill
//                 className="object-cover transition-transform duration-1000 group-hover:scale-105"
//                 sizes="(max-width: 1024px) 100vw, 50vw"
//               />
//             </div>
            
//             {/* Floating Detail Box */}
//             <div className="absolute -bottom-6 -right-6 hidden md:block bg-white p-8 shadow-xl max-w-[240px] border border-gray-100">
//               <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#4a2c2a] mb-2">
//                 Quality First
//               </p>
//               <p className="text-[12px] leading-relaxed text-[#4a2c2a]/70 italic">
//                 &quot;Every slab tells a story of geological patience and human precision.&quot;
//               </p>
//             </div>
//           </div>

//           {/* Right Side: Brand Content */}
//           <div className="w-full lg:w-1/2 flex flex-col items-start">
//             <header className="mb-8">
//               <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#4a2c2a] opacity-50 block mb-4">
//                 About Us
//               </span>
//               <h2 className="text-5xl md:text-7xl font-serif text-[#4a2c2a] leading-[1.1]">
//                 Defining the <br />
//                 <span className="italic font-light">Modern Surface.</span>
//               </h2>
//             </header>

//             <div className="space-y-6 max-w-lg">
//               <p className="text-lg text-[#4a2c2a]/80 leading-relaxed font-light">
//                 At TileBazaar, we bridge the gap between raw natural beauty and contemporary architecture. Our collections are curated for those who view flooring not as a utility, but as a canvas.
//               </p>
              
//               <div className="flex flex-col sm:flex-row gap-8 py-8 border-y border-gray-200 w-full mt-10">
//                 <div className="flex-1">
//                   <h4 className="text-2xl font-serif text-[#4a2c2a]">Global Sourcing</h4>
//                   <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold opacity-50 mt-1">Ethical & Premium</p>
//                 </div>
//                 <div className="flex-1">
//                   <h4 className="text-2xl font-serif text-[#4a2c2a]">Direct-to-Client</h4>
//                   <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold opacity-50 mt-1">Unmatched Value</p>
//                 </div>
//               </div>

//               <div className="pt-8">
//                 <button className="group flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em] text-[#4a2c2a]">
//                   Explore the Gallery
//                   <span className="w-8 h-[1px] bg-[#4a2c2a] transition-all duration-300 group-hover:w-16"></span>
//                 </button>
//               </div>
//             </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// }


import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutSection() {
  return (
    <section className="relative py-24 md:py-32 bg-[#fbfaf9] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          
          {/* Left Side: Visual Story */}
          <div className="relative w-full lg:w-1/2 group">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-sm">
              <Image
                src="/images/about-tiles.png" 
                alt="TileBazaar Bulk Supply"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            
            {/* Floating Detail Box - Highlighting Experience */}
            <div className="absolute -bottom-6 -right-6 hidden md:block bg-white p-8 shadow-xl max-w-[260px] border border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#4a2c2a] mb-2">
                Industry Experts
              </p>
              <p className="text-[12px] leading-relaxed text-[#4a2c2a]/70 italic">
                &quot;Decades of experience in large-scale construction, ensuring precision in every bulk delivery.&quot;
              </p>
            </div>
          </div>

          {/* Right Side: Brand Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-start">
            <header className="mb-8">
              <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#4a2c2a] opacity-50 block mb-4">
                The Professionals&apos; Choice
              </span>
              <h2 className="text-5xl md:text-7xl font-serif text-[#4a2c2a] leading-[1.1]">
                Built for <br />
                <span className="italic font-light">Architects & Builders.</span>
              </h2>
            </header>

            <div className="space-y-6 max-w-lg">
              <p className="text-lg text-[#4a2c2a]/80 leading-relaxed font-light">
                With deep roots in the construction industry, TileBazaar is the first choice for professionals. We understand the demands of large-scale projects, offering the reliability and volume required by architects and builders.
              </p>
              
              {/* Strategic Highlights */}
              <div className="flex flex-col sm:flex-row gap-8 py-8 border-y border-gray-200 w-full mt-10">
                <div className="flex-1">
                  <h4 className="text-2xl font-serif text-[#4a2c2a]">Bulk Inventory</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold opacity-50 mt-1">Ready for Large Projects</p>
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-serif text-[#4a2c2a]">Architectural Grade</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold opacity-50 mt-1">Sourced for Durability</p>
                </div>
              </div>

              <div className="pt-8">
                <Link href="/products" className="group flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em] text-[#4a2c2a]">
                  Explore Collection
                  <span className="w-8 h-[1px] bg-[#4a2c2a] transition-all duration-300 group-hover:w-16"></span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}