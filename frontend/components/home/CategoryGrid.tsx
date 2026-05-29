"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { name: "All Tiles", img: "/images/tiles-every.jpg", href: "/products" },
  { name: "Floor Tiles", img: "/images/floor-tile.png", href: "/products" },
  { name: "Wall Tiles", img: "/images/wall-tile.jpg", href: "/products" },
  { name: "Bathroom Tiles", img: "/images/bathroom-tile.png", href: "/products" },
  { name: "Splashback Tiles", img: "/images/splash-tile.png", href: "/products" },
  { name: "Terrace Tiles", img: "/images/terrace-tile.jpg", href: "/products" },
];

export default function CategoryGrid() {
  const [activeIndex, setActiveIndex] = useState(0);

  const next = () => {
    setActiveIndex((prev) => (prev + 1) % CATEGORIES.length);
  };

  const prev = () => {
    setActiveIndex((prev) => (prev - 1 + CATEGORIES.length) % CATEGORIES.length);
  };

  const getPosition = (index: number) => {
    const diff = index - activeIndex;
    let offset = diff;
    if (diff > CATEGORIES.length / 2) offset -= CATEGORIES.length;
    if (diff < -CATEGORIES.length / 2) offset += CATEGORIES.length;
    return offset;
  };

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <main className="max-w-[1920px] mx-auto pt-10 font-sans">
        <h2 className="text-3xl md:text-4xl text-center font-serif text-[#222] mb-14 tracking-tight">
          Explore By Application Areas
        </h2>
        
        {/* Carousel Container */}
        <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center overflow-hidden">
          {CATEGORIES.map((cat, index) => {
            const offset = getPosition(index);
            const isVisible = Math.abs(offset) <= 1;

            return (
              <motion.div
                key={cat.name}
                className="absolute top-0 h-full w-[85vw] md:w-[65vw] lg:w-[55vw] max-w-[1200px]"
                initial={false}
                animate={{
                  x: `${offset * 105}%`, // 105% to create a 5% gap between cards
                  scale: offset === 0 ? 1 : 0.95, // Slight scale down for side cards
                  opacity: isVisible ? (offset === 0 ? 1 : 0.6) : 0, // Dim side cards
                  zIndex: offset === 0 ? 20 : 10,
                  pointerEvents: offset === 0 ? "auto" : "none" // Only center card is clickable
                }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              >
                <div className="relative w-full h-full bg-gray-100 overflow-hidden group">
                  {/* Full-Cover Image */}
                  <Image
                    src={cat.img}
                    alt={cat.name}
                    fill
                    priority
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 60vw"
                  />

                  {/* Dark Gradient Overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Text and Button Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex flex-col items-center justify-end text-center z-10">
                    <h3 className="text-white text-3xl md:text-4xl lg:text-5xl font-serif mb-6 tracking-wide uppercase">
                      {cat.name}
                    </h3>
                    <Link
                      href={cat.href}
                      className="border border-white/70 text-white px-8 py-3 text-xs md:text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-colors duration-300 inline-block"
                    >
                      Explore More
                    </Link>
                  </div>

                  {/* Navigation Arrows (Only on Center Image) */}
                  {offset === 0 && (
                    <>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); prev(); }}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-black/40 hover:bg-black/80 text-white flex items-center justify-center transition-colors z-30"
                      >
                        <span className="text-2xl mb-1 ml-[-2px]">‹</span>
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); next(); }}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-black/40 hover:bg-black/80 text-white flex items-center justify-center transition-colors z-30"
                      >
                        <span className="text-2xl mb-1 mr-[-2px]">›</span>
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </section>
  );
}
