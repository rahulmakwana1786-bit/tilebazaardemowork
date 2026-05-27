// "use client";
// import React from 'react';
// import Image from 'next/image';
// import Link from 'next/link';

// // Using a list of filenames from your tiles folder
// const TOP_TILES = [
//   { name: "POSTER-001", size: "145x22mm mm", price: "10", reviews: 52, img: "/tiles/POSTER-001--PUNCHGL.jpg" },
//   { name: "VECTRO-11003-HL", size: "300x600 mm", price: "10", reviews: 46, img: "/tiles/VECTRO-11003-HL--GLOSS.jpg" },
//   { name: "IRISH RED MP 1", size: "75x300 mm", price: "10", reviews: 326, img: "/tiles/IRISH RED MP 1--HIGHGL.jpg" },
//   { name: "POSTER-016", size: "450x450 mm", price: "10", reviews: 99, img: "/tiles/POSTER-016--PUNCHGL.jpg" },
//   { name: "EARTHARO BRWON__F1", size: "150x150 mm", price: "10", reviews: 326, img: "/tiles/EARTHARO BRWON__F1--HIGHGL.jpg" },
//   { name: "WAVES HL", size: "75x300 mm", price: "10", reviews: 326, img: "/tiles/WAVES HL--HIGHGL.jpg" },
// ];

// export default function TopSellingTiles() {
//   return (
//     <section className='bg-white'>
//         <main className="max-w-[1440px] mx-auto px-4 md:px-10 py-16 font-sans text-[#4a2c2a]">
      
//       {/* Header with "See All" Link */}
//       <div className="flex justify-between items-end mb-8">
//         <h2 className="text-2xl font-serif">Top selling tiles</h2>
//         <Link href="/products" className="text-[12px] font-bold flex items-center gap-1 hover:underline">
//           See All <span className="text-[14px]">→</span>
//         </Link>
//       </div>

//       {/* Horizontal Scroll Container */}
//       <div className="relative group">
//         <div className="flex gap-4 overflow-x-auto no-scrollbar pb-10 snap-x">
//           {TOP_TILES.map((tile, index) => (
//             <div key={index} className="min-w-[280px] md:min-w-[220px] lg:min-w-[240px] flex-shrink-0 snap-start group/card">
              
//               {/* Product Image */}
//               <div className="relative aspect-square overflow-hidden bg-[#f9f9f9] mb-4">
//                 <Image 
//                   src={tile.img} 
//                   alt={tile.name}
//                   width={200}
//                   height={200}
//                   className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
//                 />
//                 <button className="absolute top-3 right-3 opacity-0 group-hover/card:opacity-100 transition-opacity">
//                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
//                 </button>
//               </div>

//               {/* Text Content */}
//               <h3 className="text-[13px] font-bold mb-2 leading-tight min-h-[32px]">
//                 {tile.name}
//               </h3>
              
//               <div className="flex items-center gap-1 mb-1">
//                 <div className="flex text-[#4a2c2a] text-[10px]">★★★★★</div>
//                 <span className="text-[10px] opacity-50">({tile.reviews} Reviews)</span>
//               </div>

//               <p className="text-[11px] opacity-60 mb-1">{tile.size}</p>
//               <p className="text-[14px] font-bold mb-4">£{tile.price} + VAT</p>

//               <button className="w-full bg-[#4a2c2a] text-white py-3 text-[11px] font-bold uppercase tracking-widest transition-all cursor-not-allowed">
//                 Add to cart
//               </button>
//             </div>
//           ))}
//         </div>

//         {/* Progress Bar & Navigation Arrow */}
//         <div className="mt-4 flex items-center justify-between">
//           <div className="h-[1px] bg-gray-200 flex-grow relative max-w-[400px]">
//             <div className="absolute top-0 left-0 h-[2px] bg-[#4a2c2a] w-1/3" />
//           </div>
//           <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
//             <span className="text-[18px]">›</span>
//           </button>
//         </div>
//       </div>
//       </main>
//     </section>
//   );
// }


// "use client";
// import React, { useRef, useState } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';

// const TOP_TILES = [
//   { name: "POSTER-001", size: "145x22mm", price: "10", reviews: 52, img: "/tiles/600x1200/POSTER-001--PUNCHGL.jpg" },
//   { name: "VECTRO-11003-HL", size: "300x600 mm", price: "10", reviews: 46, img: "/tiles/600x1200/VECTRO-11003-HL--GLOSS.jpg" },
//   { name: "IRISH RED MP 1", size: "75x300 mm", price: "10", reviews: 326, img: "/tiles/600x1200/IRISH RED MP 1--HIGHGL.jpg" },
//   { name: "POSTER-016", size: "450x450 mm", price: "10", reviews: 99, img: "/tiles/600x1200/POSTER-016--PUNCHGL.jpg" },
//   { name: "EARTHARO BRWON__F1", size: "150x150 mm", price: "10", reviews: 326, img: "/tiles/600x1200/EARTHARO BRWON__F1--HIGHGL.jpg" },
//   { name: "WAVES HL", size: "75x300 mm", price: "10", reviews: 326, img: "/tiles/600x1200/WAVES HL--HIGHGL.jpg" },
// ];

// export default function TopSellingTiles() {
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const [scrollProgress, setScrollProgress] = useState(0);

//   // Handle Progress Bar Calculation
//   const handleScroll = () => {
//     if (scrollRef.current) {
//       const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
//       const totalScrollable = scrollWidth - clientWidth;
//       const progress = (scrollLeft / totalScrollable) * 100;
//       setScrollProgress(progress);
//     }
//   };

//   // Manual Navigation Buttons
//   const scroll = (direction: 'left' | 'right') => {
//     if (scrollRef.current) {
//       const scrollAmount = 300; // Adjust based on card width
//       scrollRef.current.scrollBy({
//         left: direction === 'left' ? -scrollAmount : scrollAmount,
//         behavior: 'smooth'
//       });
//     }
//   };
//   return (
//     <section className='bg-white'>
//       <main className="max-w-[1440px] mx-auto px-4 md:px-10 py-16 font-sans text-[#4a2c2a]">
        
//         <div className="flex justify-between items-end mb-8">
//           <h2 className="text-3xl font-serif tracking-tight">Top selling tiles</h2>
//           <Link href="/products" className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-60 transition-opacity">
//             See All <span className="text-[16px]">→</span>
//           </Link>
//         </div>

//         <div className="relative group">
//           <div ref={scrollRef}
//             onScroll={handleScroll} className="flex gap-6 overflow-x-auto pb-10 snap-x">
//             {TOP_TILES.map((tile, index) => {
//               // Logic for POA based on the image tag
//               const isPOA = tile.img.toUpperCase().includes("--PUNCHGL");

//               return (
//                 <div key={index} className="min-w-[280px] md:min-w-[240px] flex-shrink-0 snap-start group/card">
                  
//                   {/* Product Image */}
//                   <div className="relative aspect-square overflow-hidden bg-[#f9f9f9] mb-5 rounded-sm">
//                     <Image 
//                       src={tile.img} 
//                       alt={tile.name}
//                       width={200}
//                       height={200}
//                       className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
//                     />
//                     {isPOA && (
//                       <div className="absolute top-3 left-3 bg-[#4a2c2a] text-white text-[9px] font-bold px-2 py-1 uppercase tracking-tighter">
//                         Consult Only
//                       </div>
//                     )}
//                   </div>

//                   {/* Text Content */}
//                   <h3 className="text-[13px] font-bold mb-1 uppercase tracking-tight leading-snug min-h-[36px]">
//                     {tile.name}
//                   </h3>
                  
//                   <div className="flex items-center gap-2 mb-3">
//                     <div className="flex text-[#4a2c2a] text-[9px] tracking-widest">★★★★★</div>
//                     <span className="text-[10px] opacity-40 italic">({tile.reviews})</span>
//                   </div>

//                   <p className="text-[11px] opacity-60 mb-1 font-medium uppercase tracking-tighter">{tile.size}</p>
                  
//                   {/* Updated Price Logic */}
//                   <p className="text-[15px] font-bold mb-5">
//                     {isPOA ? "POA" : `£${tile.price} + VAT`}
//                   </p>

//                   <button 
//                     disabled={true}
//                     className={`w-full py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all cursor-not-allowed
//                       ${isPOA ? 'bg-gray-100 text-gray-400' : 'bg-[#4a2c2a] text-white opacity-90'}
//                     `}
//                   >
//                     {isPOA ? 'Inquire for Price' : 'Add to Cart'}
//                   </button>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Progress Bar & Navigation */}
//           <div className="mt-4 flex items-center justify-between">
//             {/* The Progress Bar Wrapper */}
//             <div className="h-[2px] bg-gray-100 flex-grow relative max-w-[400px] overflow-hidden">
//               {/* The Moving Progress Indicator */}
//               <div 
//                 className="absolute top-0 left-0 h-full bg-[#4a2c2a] transition-all duration-300 ease-out" 
//                 style={{ width: `${Math.max(15, scrollProgress)}%` }} // Minimum 15% width so it's always visible
//               />
//             </div>
            
//             <div className="flex gap-2">
//               <button 
//                 onClick={() => scroll('left')}
//                 className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#4a2c2a] hover:text-white transition-all duration-300 active:scale-90"
//               >
//                 <span className="text-[20px] leading-none mb-1">‹</span>
//               </button>
//               <button 
//                 onClick={() => scroll('right')}
//                 className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#4a2c2a] hover:text-white transition-all duration-300 active:scale-90"
//               >
//                 <span className="text-[20px] leading-none mb-1">›</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </main>
//     </section>
//   );
// }


"use client";
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCartAsync } from '@/store/slices/cartSlice';
import toast from 'react-hot-toast';

const ALL_PRODUCTS = [
  { name: "POSTER-001", size: "600x1200 mm", price: "15", reviews: 52, img: "/tiles/600x1200/POSTER-001--PUNCHGL.jpg" },
  { name: "ALEXA BEIGE_R1", size: "600x600 mm", price: "15", reviews: 52, img: "/tiles/600x600/ALEXA BEIGE_R1--GLOSS.jpg" },
  
  { name: "ALEXA BIANCO_R1", size: "600x1200 mm", price: "15", reviews: 46, img: "/tiles/600x1200/ALEXA BIANCO_R1--GLOSS.jpg" },
  { name: "EL-SMOG GRIS_1", size: "600x600 mm", price: "15", reviews: 46, img: "/tiles/600x600/EL-SMOG GRIS_1--CARVING.jpg" },
  
  { name: "ARABESCATO_R1", size: "600x1200 mm", price: "15", reviews: 326, img: "/tiles/600x1200/ARABESCATO_R1--GLOSS.jpg" },
  { name: "STANZA SILVER R1", size: "600x600 mm", price: "15", reviews: 326, img: "/tiles/600x600/STANZA SILVER R1--CARVING.jpg" },
 
  { name: "POSTER-016", size: "600x1200 mm", price: "15", reviews: 99, img: "/tiles/600x1200/POSTER-016--PUNCHGL.jpg" },
  { name: "ARABESCATO_R1", size: "600x600 mm", price: "15", reviews: 99, img: "/tiles/600x600/ARABESCATO_R1--GLOSS.jpg" },
  
  { name: "EL-STATUARIO PRIME-R1", size: "600x1200 mm", price: "15", reviews: 326, img: "/tiles/600x1200/EL-STATUARIO PRIME-R1--GLOSS.jpg" },
  { name: "EL-BRICKO LIGHT R1", size: "600x600 mm", price: "15", reviews: 326, img: "/tiles/600x600/EL-BRICKO LIGHT R1--CARVING.jpg" },
 
  { name: "MEGLOW WHITE R1", size: "600x1200 mm", price: "15", reviews: 326, img: "/tiles/600x1200/MEGLOW WHITE R1--CARVING.jpg" },
  { name: "PHANTOM ONYX WHITE R1", size: "600x1200 mm", price: "15", reviews: 326, img: "/tiles/600x1200/PHANTOM ONYX WHITE R1--LOVIN.jpg" },
  { name: "STANZA GREY R1", size: "600x1200 mm", price: "15", reviews: 326, img: "/tiles/600x1200/STANZA GREY R1--CARVING.jpg" },
];

export default function TopSellingTiles() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [randomizedTiles, setRandomizedTiles] = useState<typeof ALL_PRODUCTS>([]);
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.cart);

  useEffect(() => {
    const shuffle = () => {
      const result = [...ALL_PRODUCTS]
        .sort(() => Math.random() - 0.5)
        .slice(0, 8); // Increased to 8 for a better variety
      setRandomizedTiles(result);
    };
    shuffle();
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const totalScrollable = scrollWidth - clientWidth;
      const progress = (scrollLeft / totalScrollable) * 100;
      setScrollProgress(progress);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 350; // Increased to match larger containers
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleAddToCart = (product: any) => {
    if (!token) {
      toast.error("Please login to add items to cart");
      return;
    }
    // Note: Since these are static products, we'd normally need a real ID from the DB
    // For now, we'll try to use the name as ID if no ID is present, or just show a message
    toast.success(`${product.name} added to cart (Demo)`);
    // dispatch(addToCartAsync({ product_id: product.id || product.name, quantity: 1 }));
  };

  if (randomizedTiles.length === 0) return <div className="h-[600px] bg-white" />;

  return (
    <section className='bg-white'>
      <main className="max-w-[1440px] mx-auto px-4 md:px-10 py-16 font-sans text-[#4a2c2a]">
        
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-serif tracking-tight">Top selling tiles</h2>
          <Link href="/products" className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-60 transition-opacity">
            See All <span className="text-[16px]">→</span>
          </Link>
        </div>

        <div className="relative group">
          <div 
            ref={scrollRef}
            onScroll={handleScroll} 
            className="flex gap-8 overflow-x-auto pb-10 snap-x no-scrollbar"
          >
            {randomizedTiles.map((tile, index) => {
              const isPOA = tile.name.toUpperCase().includes("POSTER");

              return (
                <div key={`${tile.name}-${index}`} className="min-w-[280px] md:max-w-[320px] flex-shrink-0 snap-start group/card">
                  
                  {/* Container designed to handle both 600x600 and 600x1200 */}
                  <div className="relative aspect-[3/4] flex items-center justify-center bg-[#FBFBFB] mb-5 p-6 rounded-[4px] overflow-hidden">
                    <Image 
                      src={tile.img} 
                      alt={tile.name}
                      width={280}
                      height={200}
                      className="transition-transform duration-700 group-hover/card:scale-105 object-contain max-h-full w-auto"
                    />
                    {isPOA && (
                      <div className="absolute top-3 left-3 bg-[#4a2c2a] text-white text-[9px] font-bold px-2 py-1 uppercase tracking-tighter">
                        Consult Only
                      </div>
                    )}
                  </div>

                  <h3 className="text-[13px] font-bold mb-1 uppercase tracking-tight leading-snug min-h-[18px]">
                    {tile.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-[#4a2c2a] text-[9px] tracking-widest">★★★★★</div>
                    <span className="text-[10px] opacity-40 italic">({tile.reviews})</span>
                  </div>

                  <p className="text-[11px] opacity-60 mb-1 font-medium uppercase tracking-tighter">{tile.size}</p>
                  
                  <p className="text-[15px] font-bold mb-5">
                    {isPOA ? "POA" : `£${tile.price} + VAT`}
                  </p>

                  <button 
                    onClick={() => handleAddToCart(tile)}
                    disabled={isPOA || loading}
                    className={`w-full py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all
                      ${isPOA ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#4a2c2a] text-white opacity-90 hover:opacity-100 active:scale-[0.98]'}
                    `}
                  >
                    {isPOA ? 'Inquire for Price' : 'Add to Cart'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="h-[2px] bg-gray-100 flex-grow relative max-w-[400px] overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-[#4a2c2a] transition-all duration-300 ease-out" 
                style={{ width: `${Math.max(15, scrollProgress)}%` }} 
              />
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => scroll('left')} className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#4a2c2a] hover:text-white transition-all active:scale-90">
                <span className="text-[20px]">‹</span>
              </button>
              <button onClick={() => scroll('right')} className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#4a2c2a] hover:text-white transition-all active:scale-90">
                <span className="text-[20px]">›</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}