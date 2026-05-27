"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="relative w-full max-w-[760px] overflow-hidden bg-white shadow-2xl md:flex">
        
        {/* Close Button */}
        <button
          type="button"
          aria-label="Close promo popup"
          onClick={() => setIsOpen(false)}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#222] shadow-lg transition-colors duration-300 hover:bg-[#df2c7c] hover:text-white"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Left Side */}
        <div className="flex-1 p-10 md:p-16 flex flex-col justify-center text-[#4a2c2a]">
          <h2 className="text-3xl font-serif leading-tight mb-6">
            Wait, before <br />
            <span className="italic font-light">you go...</span>
          </h2>

          <div className="mb-10 group">
            <div className="inline-block bg-[#4a2c2a] text-white px-4 py-1 text-[10px] font-bold uppercase tracking-[0.3em] mb-3">
              Limited Offer
            </div>

            <p className="text-[13px] mt-2 uppercase tracking-widest font-medium opacity-70">
              Tiles Starting from only
            </p>

            <p className="text-2xl md:text-3xl font-bold tracking-tight">
              £10 + VAT{" "}
              <span className="text-sm font-normal opacity-60">
                / sqm
              </span>
            </p>

            <div className="w-12 h-[2px] bg-[#4a2c2a] mt-4 transition-all duration-500 group-hover:w-24"></div>
          </div>

          <Link
            href="/products"
            onClick={() => setIsOpen(false)}
            className="w-full md:w-fit bg-[#4a2c2a] text-white px-10 py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-opacity-90 transition-all duration-300 shadow-lg shadow-[#4a2c2a]/20"
          >
            Shop the Collection
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex-1 bg-[#4a2c2a] flex items-center justify-center p-14 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full border border-white/5"></div>

          <div className="text-center text-white relative z-10">
            <h3 className="text-6xl md:text-[65px] font-black leading-[0.85] tracking-tighter uppercase italic">
              Opening
              <br />
              <span className="not-italic text-white/90">
                Offer
              </span>
            </h3>

            <div className="mt-6 h-[1px] w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
