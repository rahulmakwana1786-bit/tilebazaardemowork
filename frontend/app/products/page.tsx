import React, { Suspense } from "react";
import TileGallery from "@/components/products/TileGallery";
import ApplicationPossibilities from "@/components/home/ApplicationPossibilities";
import { getActiveTilePaths } from "@/app/actions";

export default async function ProductsPage() {
  const allFiles = await getActiveTilePaths();

  return (
    <div className="bg-white min-h-screen">
      <section className="mt-20 md:mt-24 pb-20">
        <main className="max-w-[1440px] mx-auto px-4 md:px-10 py-6 text-[#4a2c2a]">
          <header className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <h1 className="text-5xl md:text-6xl font-serif mb-6">Our Collection</h1>
            <div className="w-24 h-[1.5px] bg-[#4a2c2a] mx-auto mb-8 opacity-40"></div>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">
              Premium Quality Tiles
            </p>
          </header>

          <Suspense fallback={<div className="py-40 flex justify-center"><div className="animate-spin h-10 w-10 border-b-2 border-[#4a2c2a] rounded-full"></div></div>}>
            <TileGallery initialImages={allFiles} />
          </Suspense>
        </main>
      </section>

      {/* Feature Section added before footer */}
      <ApplicationPossibilities />
    </div>
  );
}