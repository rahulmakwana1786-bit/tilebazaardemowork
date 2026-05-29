"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/common/AddToCartButton";
import { useSearchParams, usePathname } from "next/navigation";

interface TileGalleryProps {
  initialImages?: string[];
}

const getFinish = (fileName: string) => {
  const name = fileName.toUpperCase();
  if (name.includes("--GLOSS")) return "GLOSSY";
  if (name.includes("--MATT") && !name.includes("--MATTING")) return "MATT";
  if (name.includes("PAVE") || name.includes("SALTED CONCRETO")) return "MATT";
  if (name.includes("--CARVING")) return "CARVING";
  if (name.includes("--HIGHGL")) return "HIGH GLOSS";
  if (name.includes("--PUNCHGL")) return "POSTER";
  if (name.includes("--LOVIN")) return "LOVELIN";
  if (name.includes("--TPH")) return "TYPHOON";
  return "OTHER";
};

const formatFileName = (name: string) => {
  let clean = name.split("--")[0].replace(/\.[^/.]+$/, "").replace(/-/g, " ").trim();
  const upper = clean.toUpperCase();
  if (upper === "TILE TRIM") {
    return "10mm Straight Edge Aluminium Basalt Effect Tile Trim - 2.5m";
  }
  if (upper.includes("AURL GRIGIO")) {
    return "AURL GRIGIO ARCO";
  }
  if (upper.includes("PAVE")) {
    return "PAVE’ PARIS G";
  }
  if (upper.includes("SALT CONCRETO") || upper.includes("SALTED CONCRETO")) {
    return "Salted concreto crema";
  }
  return clean;
};

const getProductDetails = (fileName: string) => {
  const upper = fileName.toUpperCase();
  if (upper.includes("TRIM")) return { price: 8, unit: "+vat/piece", isAccessory: true };
  if (upper.includes("SPACER")) return { price: 6, unit: "+vat/bag", isAccessory: true };
  if (upper.includes("WEDGE")) return { price: 6, unit: "+vat/bag", isAccessory: true };
  if (upper.includes("ADHESIVE") || upper.includes("GLUE")) return { price: 12, unit: "+vat/bag", isAccessory: true };
  if (upper.includes("MATTING")) return { price: 6, unit: "+vat/sqm", isAccessory: true };
  // New Arrivals & Outdoor tiles are priced at £18
  if (upper.includes("AURL GRIGIO") || upper.includes("PAVE") || upper.includes("SALT CONCRETO") || upper.includes("SALTED CONCRETO") || upper.includes("OUTDOOR")) return { price: 18, unit: "m²", isAccessory: false };
  // All other tiles default to £15
  return { price: 15, unit: "m²", isAccessory: false };
};

export default function TileGallery({ initialImages = [] }: TileGalleryProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const finishFilter = searchParams.get("finish");
  const sizeFilter = searchParams.get("size");

  const accessoriesList = [
    { id: "trim", name: "Tile Trims" },
    { id: "spacer", name: "Spacers" },
    { id: "wedge", name: "Wedges" },
    { id: "adhesive", name: "Adhesive Bags" },
    { id:"matting",name:"dura Elite matting"}
  ];

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
    initialImages.forEach((img) => {
      const parts = img.split("/");
      if (parts.length > 1) sizes.add(parts[0]);
      const finish = getFinish(img.split("/").pop() || img);
      if (finish !== "OTHER") finishes.add(finish);
    });
    return {
      uniqueSizes: Array.from(sizes).sort(),
      uniqueFinishes: Array.from(finishes).sort(),
    };
  }, [initialImages]);

  const filteredTiles = useMemo(() => {
    return initialImages.filter((img) => {
      const fileName = img.split("/").pop() || img;
      const finish = getFinish(fileName);
      const parts = img.split("/");
      const size = parts.length > 1 ? parts[0] : "OTHER";

      const upperName = fileName.toUpperCase();

      // Only show the main AURL image in the products listing, and hide variant/grid images
      if (upperName.startsWith("AURL") && (upperName.includes("(1)") || upperName.includes("(2)") || upperName.includes("(3)") || upperName.includes("(5)"))) {
        return false;
      }
      if (upperName.startsWith("GRID_AURL")) {
        return false;
      }

      // Only show the main PAVE PARIS image in the products listing, and hide variant/grid images
      if (upperName.includes("PAVE") && (upperName.includes("(1)") || upperName.includes("(2)") || upperName.includes("(3)") || upperName.includes("(4)"))) {
        return false;
      }
      if (upperName.includes("GRID_PAVE")) {
        return false;
      }

      // Hide horizontal preview for SALTED CONCRETO in listing
      if (upperName.includes("SALTED CONCRETO") && upperName.includes("(1)")) {
        return false;
      }
      if (sizeFilter === "accessories") {
        let matchesAccessory = true;
        if (finishFilter) {
          if (finishFilter === "trim")
            matchesAccessory = upperName.includes("TRIM");
          else if (finishFilter === "spacer")
            matchesAccessory = upperName.includes("SPACER");
          else if (finishFilter === "wedge")
            matchesAccessory = upperName.includes("WEDGE");
          else if (finishFilter === "adhesive")
            matchesAccessory =
              upperName.includes("ADHESIVE") || upperName.includes("GLUE");
          else if (finishFilter === "matting")
            matchesAccessory = upperName.includes("MATTING");
          else matchesAccessory = false;
        } else {
          matchesAccessory =
            upperName.includes("TRIM") ||
            upperName.includes("SPACER") ||
            upperName.includes("WEDGE") ||
            upperName.includes("ADHESIVE") ||
            upperName.includes("GLUE") ||
            upperName.includes("MATTING");
        }
        return matchesAccessory;
      } else {
        const isAccessory =
          upperName.includes("TRIM") ||
          upperName.includes("SPACER") ||
          upperName.includes("WEDGE") ||
          upperName.includes("ADHESIVE") ||
          upperName.includes("GLUE") ||
          upperName.includes("MATTING");
        if (isAccessory) return false;

        const matchesFinish =
          !finishFilter ||
          (finishFilter === "NEW ARRIVALS"
            ? upperName.startsWith("EXP") || upperName.startsWith("TC") || upperName.startsWith("AURL") || upperName.includes("PAVE") || upperName.includes("SALTED CONCRETO")
            : finish === finishFilter);
        const matchesSize = !sizeFilter || size === sizeFilter;
        return matchesFinish && matchesSize;
      }
    });
  }, [finishFilter, sizeFilter, initialImages]);

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

      {/* Conditional Sub-Filter */}
      {sizeFilter === "accessories" ? (
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">
            Accessory Type
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={createFilterUrl("finish", null)}
              scroll={false}
              onClick={() => setIsMobileFilterOpen(false)}
              className={`px-7 border rounded-full transition-all duration-300 inline-flex flex-col items-center justify-center min-h-[48px] hover:scale-105 ${
                finishFilter === null
                  ? "bg-[#4a2c2a] text-white border-[#4a2c2a] shadow-lg scale-105"
                  : "bg-white text-[#5e7e95] border-gray-100 hover:border-gray-200"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest">
                All Types
              </span>
            </Link>

            {accessoriesList.map((acc) => (
              <Link
                key={acc.id}
                href={createFilterUrl("finish", acc.id)}
                scroll={false}
                onClick={() => setIsMobileFilterOpen(false)}
                className={`px-7 border rounded-full transition-all duration-300 inline-flex flex-col items-center justify-center min-w-[140px] min-h-[48px] hover:scale-105 ${
                  finishFilter === acc.id
                    ? "bg-[#4a2c2a] text-white border-[#4a2c2a] shadow-lg scale-105"
                    : "bg-white text-[#5e7e95] border-gray-100 hover:border-gray-200"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest mb-[2px]">
                  {acc.name}
                </span>
                <span
                  className={`text-[9px] font-medium tracking-wider ${finishFilter === acc.id ? "text-white/70" : "text-gray-400"}`}
                >
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
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
      )}
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
        {filteredTiles.map((imageName) => {
          const fileNameOnly = imageName.split("/").pop() || imageName;
          const finish = getFinish(fileNameOnly);
          const details = getProductDetails(fileNameOnly);
          const isPoster = fileNameOnly.toUpperCase().includes("POSTER");
          return (
            <div key={imageName} className="group flex flex-col">
              {/* Boxed Aspect Ratio like the original design */}
              <Link href={`/products/${encodeURIComponent(imageName)}`} className="relative w-full aspect-[5/4] bg-[#fbfbfb] flex items-center justify-center p-6 mb-5 overflow-hidden group/image cursor-pointer">
                <Image
                  src={`/tiles/${imageName.split('/').map(s => encodeURIComponent(s)).join('/')}`}
                  alt={fileNameOnly}
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
                {finish && finish !== "OTHER" && !details.isAccessory && (
                  <div className="absolute top-4 left-4 bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-[#4a2c2a] shadow-sm z-30">
                    {finish}
                  </div>
                )}
              </Link>

              <div className="flex flex-col flex-grow text-left px-2">
                <Link href={`/products/${encodeURIComponent(imageName)}`} className="hover:text-[#4a2c2a]/70 transition-colors">
                  <h3 className="text-[12px] font-bold uppercase mb-3 text-left">
                    {formatFileName(fileNameOnly)}
                  </h3>
                </Link>

                <div className="flex items-end gap-2 mb-5">
                  {isPoster ? (
                    <span className="text-[16px] font-bold text-[#4a2c2a]">POA</span>
                  ) : (
                    <>
                      <span className="text-[16px] font-medium text-[#4a2c2a]">
                        £{details.price.toFixed(2)}{" "}
                        <span className="text-[11px] font-normal text-gray-400">
                          / {details.unit}
                        </span>
                      </span>
                      {!details.isAccessory && (
                        <span className="text-[12px] line-through text-gray-300 mb-[2px]">
                          £{(details.price + 5).toFixed(2)}
                        </span>
                      )}
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
                        id: fileNameOnly,
                        name: formatFileName(fileNameOnly),
                        image: `/tiles/${imageName}`,
                        price: details.price,
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
