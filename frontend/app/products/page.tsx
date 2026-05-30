import React, { Suspense } from "react";
import TileGallery from "@/components/products/TileGallery";
import ApplicationPossibilities from "@/components/home/ApplicationPossibilities";
import { getAllTilePaths } from "@/app/actions";

// Force dynamic rendering so we always get the latest products
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getProducts() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tilebazaardemowork-production.up.railway.app';
  try {
    const res = await fetch(`${apiUrl}/api/products`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();
  const allTiles = await getAllTilePaths();

  const getVariantMatchName = (name: string) =>
    name
      .split("--")[0]
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\bR[1-9]\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    // Enhance products with their exact local image path
    const matchedPaths = new Set<string>();
    
    let enhancedProducts = products.map((product: any) => {
      let bestMatchPath = ""; 
      
      // Hardcode specific known exceptions
      if (product.name.toUpperCase().includes("AURL GRIGIO")) {
        bestMatchPath = "600x600/AURL GRIGIO ARCO (605x605) 16mm--MATT.jpeg";
      } else if (product.name.toUpperCase().includes("PAVE")) {
        bestMatchPath = "600x600/PAVE’ PARIS G (605x605) 16mm.jpeg";
      } else if (product.name.toUpperCase().includes("SALT CONCRETO") || product.name.toUpperCase().includes("SALTED CONCRETO")) {
        bestMatchPath = "600x600/Salted concreto crema 600x900 x 20mm.jpeg";
      } else {
        // Find the exact matching path in allTiles
        let possibleMatches: string[] = [];
        for (const t of allTiles) {
          const fileName = t.split("/").pop() || t;
          const tMatch = getVariantMatchName(fileName).toLowerCase();
          const pMatch = getVariantMatchName(product.name).toLowerCase();
          
          if (tMatch === pMatch || fileName.toLowerCase().includes(product.name.toLowerCase().replace(/_r1/i, ''))) {
            possibleMatches.push(t);
          }
        }

        if (possibleMatches.length > 0) {
          const dbSize = (product.size || "").toLowerCase().trim();
          bestMatchPath = possibleMatches.find(p => p.toLowerCase().includes(dbSize)) || possibleMatches[0];
        }
      }

      if (bestMatchPath) {
        matchedPaths.add(bestMatchPath);
        // Force size to 600x600 if the image is from the 600x600 folder
        if (bestMatchPath.startsWith("600x600/") || bestMatchPath.includes("600x600")) {
          product.size = "600x600";
        }
      }

      // Update price for outdoor tiles
      const upName = product.name.toUpperCase();
      if (upName.includes("AURL GRIGIO") || upName.includes("PAVE") || upName.includes("SALT CONCRETO") || upName.includes("SALTED CONCRETO")) {
        product.price = 18;
      }
  
      return { ...product, originalPath: bestMatchPath || product.image };
    });

    // Auto-inject missing 600x600 tiles from the local folder
    const missingTiles = allTiles.filter((t) => {
      if (matchedPaths.has(t)) return false;
      const is600x600 = t.startsWith("600x600/") || t.includes("600x600");
      if (!is600x600) return false;
      if (t.match(/\(\d+\)/)) return false; // Skip alternate variant images
      if (t.toLowerCase().includes('poster')) return false;
      if (t.toLowerCase().includes('grid_')) return false;
      return true;
    }).map((t, index) => {
      const fileName = t.split("/").pop() || t;
      const lowerName = fileName.toLowerCase();
      const finish = lowerName.includes('gloss') ? 'GLOSS' : lowerName.includes('matt') ? 'MATT' : lowerName.includes('carving') ? 'CARVING' : 'MATT';
      
      const upName = lowerName.toUpperCase();
      const isOutdoor = upName.includes("AURL GRIGIO") || upName.includes("PAVE") || upName.includes("SALT CONCRETO") || upName.includes("SALTED CONCRETO");

      return {
        id: `local-600-${index}`,
        name: getVariantMatchName(fileName),
        slug: t,
        price: isOutdoor ? 18 : 15,
        discount_price: null,
        stock: 100,
        category: 'Tiles',
        finish: finish,
        size: '600x600',
        thickness: '9mm',
        material: 'Porcelain',
        image: t,
        originalPath: t,
        is_active: true
      };
    });

    enhancedProducts = [...enhancedProducts, ...missingTiles];

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
            <TileGallery initialProducts={enhancedProducts} />
          </Suspense>
        </main>
      </section>

      {/* Feature Section added before footer */}
      <ApplicationPossibilities />
    </div>
  );
}