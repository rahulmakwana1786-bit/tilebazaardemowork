"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/common/AddToCartButton";
import { useSearchParams, usePathname } from "next/navigation";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price: number | null;
  image: string;
  size: string;
  finish: string;
  category: string;
  material: string;
  thickness: string;
  stock: number;
  is_active: boolean;
  originalPath?: string;
}

export const getValidImageUrl = (product: Product) => {
  if (product.name?.toUpperCase().includes('TRIM')) return '/images/accessories/trim/tile-trim.png';

  if (!product.image) return '/placeholder.png';
  if (product.image.startsWith('http') || product.image.startsWith('/')) {
    return product.image;
  }
  
  if (product.originalPath) {
    return `/tiles/${product.originalPath.split('/').map(encodeURIComponent).join('/')}`;
  }
  
  if (product.category?.toUpperCase() === 'ACCESSORY' || product.category?.toUpperCase() === 'ACCESSORIES') {
    return `/tiles/accessories/${encodeURIComponent(product.image)}`;
  }
  
  if (product.size) {
    return `/tiles/${product.size.toLowerCase()}/${encodeURIComponent(product.image)}`;
  }
  
  return `/tiles/${encodeURIComponent(product.image)}`;
};

export const getRawImagePath = (product: Product) => {
  if (product.originalPath) return product.originalPath;
  
  if (product.image && (product.image.startsWith('http') || product.image.startsWith('/'))) {
    const parts = product.image.split('/');
    return parts.slice(-2).join('/'); 
  }
  if (product.category?.toUpperCase() === 'ACCESSORY' || product.category?.toUpperCase() === 'ACCESSORIES') {
    return `accessories/${product.image}`;
  }
  if (product.size) {
    return `${product.size.toLowerCase()}/${product.image}`;
  }
  return product.image;
};

interface TileGalleryProps {
  initialProducts?: Product[];
}

export default function TileGallery({ initialProducts = [] }: TileGalleryProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const finishFilter = searchParams.get("finish");
  const sizeFilter = searchParams.get("size");

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowTopBtn(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const { uniqueSizes, uniqueFinishes } = useMemo(() => {
    const sizes = new Set<string>();
    const finishes = new Set<string>();
    let hasAccessories = false;
    
    initialProducts.forEach((product) => {
      if (product.size) {
        const lowerSize = product.size.toLowerCase();
        if (lowerSize !== "20 kg" && lowerSize !== "20kg") {
          sizes.add(lowerSize);
        }
      }
      if (product.finish) {
        const upperFinish = product.finish.toUpperCase();
        if (upperFinish !== "OTHER" && upperFinish !== "POLISHED") {
          finishes.add(upperFinish);
        }
      }
      if (product.category?.toUpperCase() === 'ACCESSORIES' || product.category?.toUpperCase() === 'ACCESSORY') {
        hasAccessories = true;
      }
    });
    
    if (hasAccessories) sizes.add("accessories");
    
    return {
      uniqueSizes: Array.from(sizes).sort(),
      uniqueFinishes: Array.from(finishes).sort(),
    };
  }, [initialProducts]);

  const filteredTiles = useMemo(() => {
    const filtered = initialProducts.filter((product) => {
      if (!product.is_active) return false;

      const upperName = product.name.toUpperCase();
      const productFinish = product.finish ? product.finish.toUpperCase() : "";

      const isNewArrival = 
        product.category?.toUpperCase() === "NEW ARRIVALS" || 
        upperName.includes("NEW") ||
        upperName.includes("AURL GRIGIO") ||
        upperName.includes("SALTED CONCRETO") ||
        upperName.includes("SALT CONCRETO") ||
        upperName.includes("PAVE");

      const matchesFinish =
        !finishFilter ||
        (finishFilter === "NEW ARRIVALS"
          ? isNewArrival
          : productFinish === finishFilter);
          
      const isAccessory = product.category?.toUpperCase() === 'ACCESSORIES' || product.category?.toUpperCase() === 'ACCESSORY';
      
      let matchesSize = false;
      if (sizeFilter === "accessories") {
        matchesSize = isAccessory;
      } else if (!sizeFilter) {
        matchesSize = !isAccessory;
      } else {
        matchesSize = !isAccessory && product.size?.toLowerCase() === sizeFilter.toLowerCase();
      }
      
      return matchesFinish && matchesSize;
    });

    return filtered.sort((a, b) => {
      const getPriority = (p: Product) => {
        const pSize = p.size?.toLowerCase();
        const pFinish = p.finish?.toUpperCase();
        const pName = p.name?.toUpperCase();
        
        if (pSize === '600x1200') return 1;
        if (pFinish?.includes('POSTER') || pName?.includes('POSTER')) return 2;
        if (pSize === '600x600') return 3;
        return 4;
      };
      
      const priorityDiff = getPriority(a) - getPriority(b);
      if (priorityDiff !== 0) return priorityDiff;
      // If same priority, sort alphabetically
      return a.name.localeCompare(b.name);
    });
  }, [finishFilter, sizeFilter, initialProducts]);

  // Helper to create URLs for filters
  const createFilterUrl = (type: "size" | "finish", value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(type, value);
    } else {
      params.delete(type);
    }

    if (type === "size") {
      const currentSizeIsAcc = sizeFilter === "accessories";
      const newSizeIsAcc = value === "accessories";
      if (currentSizeIsAcc !== newSizeIsAcc) {
        params.delete("finish");
      }
    }

    return `${pathname}?${params.toString()}`;
  };

  const filterContent = (
    <div className="space-y-12">
      {/* Dimensions Filter */}
      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">
          Dimensions
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={createFilterUrl("size", null)}
            scroll={false}
            onClick={() => setIsMobileFilterOpen(false)}
            className={`px-7 py-3 text-[10px] font-bold uppercase tracking-widest border rounded-full transition-all duration-300 inline-block ${
              sizeFilter === null
                ? "bg-[#4a2c2a] text-white border-[#4a2c2a] shadow-lg"
                : "bg-white text-[#5e7e95] border-gray-100 hover:border-gray-200"
            }`}
          >
            All Sizes
          </Link>

          {uniqueSizes.map((size) => (
            <Link
              key={size}
              href={createFilterUrl("size", size)}
              scroll={false}
              onClick={() => setIsMobileFilterOpen(false)}
              className={`px-7 py-3 text-[10px] font-bold uppercase tracking-widest border rounded-full transition-all duration-300 inline-block ${
                sizeFilter === size
                  ? "bg-[#4a2c2a] text-white border-[#4a2c2a] shadow-lg"
                  : "bg-white text-[#5e7e95] border-gray-100 hover:border-gray-200"
              }`}
            >
              {size}
          </Link>
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">
          Surface Finish
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={createFilterUrl("finish", null)}
            scroll={false}
            onClick={() => setIsMobileFilterOpen(false)}
            className={`px-7 py-3 text-[10px] font-bold uppercase tracking-widest border rounded-full transition-all duration-300 inline-block ${
              finishFilter === null
                ? "bg-[#4a2c2a] text-white border-[#4a2c2a] shadow-lg"
                : "bg-white text-[#5e7e95] border-gray-100 hover:border-gray-200"
            }`}
          >
            All Finishes
          </Link>

          <Link
            href={createFilterUrl("finish", "NEW ARRIVALS")}
            scroll={false}
            onClick={() => setIsMobileFilterOpen(false)}
            className={`px-7 py-3 text-[10px] font-bold uppercase tracking-widest border rounded-full transition-all duration-300 inline-block ${
              finishFilter === "NEW ARRIVALS"
                ? "bg-[#4a2c2a] text-white border-[#4a2c2a] shadow-lg"
                : "bg-white text-[#5e7e95] border-gray-100 hover:border-gray-200"
            }`}
          >
            New Arrivals
          </Link>
          {uniqueFinishes.map((finish) => (
            <Link
              key={finish}
              href={createFilterUrl("finish", finish)}
              scroll={false}
              onClick={() => setIsMobileFilterOpen(false)}
              className={`px-7 py-3 text-[10px] font-bold uppercase tracking-widest border rounded-full transition-all duration-300 inline-block ${
                finishFilter === finish
                  ? "bg-[#4a2c2a] text-white border-[#4a2c2a] shadow-lg"
                  : "bg-white text-[#5e7e95] border-gray-100 hover:border-gray-200"
              }`}
            >
              {finish}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative pb-24 px-4 md:px-10">
      {/* Desktop Filters */}
      <div className="hidden lg:block mb-24 border-b border-gray-50 pb-16">
        {filterContent}
      </div>

      {/* Mobile Trigger */}
      <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="bg-[#4a2c2a] text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-transform active:scale-95"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path d="M4 21v-7m0-4V3m8 18v-11m0-4V3m8 18v-3m0-4V3M1 14h6m2-11h6m2 11h6" />
          </svg>
          Refine Results
        </button>
      </div>

      {/* Product Grid (Matching Screenshot & requested design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14">
        {filteredTiles.map((product) => {
          const isPoster = product.finish?.toUpperCase().includes("POSTER") || product.name?.toUpperCase().includes("POSTER");
          return (
            <div key={product.id} className="group flex flex-col">
              {/* Boxed Aspect Ratio like the original design */}
              <Link href={`/products/${encodeURIComponent(product.originalPath || getRawImagePath(product))}`} className="relative w-full aspect-[5/4] bg-[#fbfbfb] flex items-center justify-center p-6 mb-5 overflow-hidden group/image cursor-pointer">
                <Image
                  src={getValidImageUrl(product)}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-contain p-8 mix-blend-multiply transition-transform duration-700 group-hover/image:scale-105"
                />

                {/* View Details Overlay on Hover */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                  <span className="bg-white text-[#4a2c2a] px-6 py-3 text-[10px] font-bold uppercase tracking-widest shadow-xl transform translate-y-4 group-hover/image:translate-y-0 transition-all duration-300">
                    View Details
                  </span>
                </div>

                {/* Finish Badge */}
                {product.finish && (
                  <div className="absolute top-4 left-4 bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-[#4a2c2a] shadow-sm z-30">
                    {product.finish}
                  </div>
                )}
              </Link>

              <div className="flex flex-col flex-grow text-left px-2">
                <Link href={`/products/${product.slug}`} className="hover:text-[#4a2c2a]/70 transition-colors">
                  <h3 className="text-[12px] font-bold uppercase mb-3 text-left">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex items-end gap-2 mb-5">
                  {isPoster ? (
                    <span className="text-[16px] font-bold text-[#4a2c2a]">POA</span>
                  ) : (
                    <>
                      <span className="text-[16px] font-medium text-[#4a2c2a]">
                        £{product.price.toFixed(2)}{" "}
                        <span className="text-[11px] font-normal text-gray-400">
                          {(() => {
                            const upper = product.name?.toUpperCase() || "";
                            if (upper.includes("TRIM")) return "/ +vat/piece";
                            if (upper.includes("DURA") || upper.includes("MATTING")) return "/ +vat/sqm";
                            if (product.category?.toUpperCase().includes('ACCESS') || product.category?.toUpperCase().includes('ADHESIVE') || upper.includes("SPACER") || upper.includes("WEDGE") || upper.includes("LEVEL") || upper.includes("GLUE") || upper.includes("ADHESIVE") || upper.includes("VALIDUS")) return "/ +vat/bag";
                            return "/ m²";
                          })()}
                        </span>
                      </span>
                      <span className="text-[12px] line-through text-gray-300 mb-[2px]">
                        £{(product.price + 5).toFixed(2)}
                      </span>
                    </>
                  )}
                </div>

                <div className="mt-auto">
                  {isPoster ? (
                    <Link
                      href="/contact"
                      className="w-full flex justify-center bg-[#222] text-white hover:bg-black py-3 text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                      Inquire for Price
                    </Link>
                  ) : (
                    <AddToCartButton
                      product={{
                        id: product.id,
                        name: product.name,
                        image: product.image,
                        price: product.price,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-white z-[100] p-8 transition-transform duration-500 ease-in-out ${isMobileFilterOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-serif text-[#4a2c2a]">
            Collection Filters
          </h2>
          <button
            onClick={() => setIsMobileFilterOpen(false)}
            className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-full"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4a2c2a"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {filterContent}
        <button
          onClick={() => setIsMobileFilterOpen(false)}
          className="w-full absolute bottom-8 left-0 px-8"
        >
          <div className="bg-[#4a2c2a] text-white py-5 rounded-sm text-[11px] font-bold uppercase tracking-widest text-center shadow-xl">
            View {filteredTiles.length} Masterpieces
          </div>
        </button>
      </div>

      {/* Scroll to top */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-[50] w-14 h-14 bg-white border border-gray-100 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 ${showTopBtn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4a2c2a"
          strokeWidth="2.5"
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>

      {filteredTiles.length === 0 && (
        <div className="text-center py-40">
          <p className="text-2xl font-serif text-gray-200 italic">
            No pieces found matching these criteria.
          </p>
        </div>
      )}
    </div>
  );
}
