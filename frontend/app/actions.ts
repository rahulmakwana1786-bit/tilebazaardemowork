"use server";

import fs from "fs";
import path from "path";

export async function getAllTilePaths(): Promise<string[]> {
  const tilesDirectory = path.join(process.cwd(), "public/tiles");
  let allFiles: string[] = [];

  const getFilesRecursively = (dir: string): string[] => {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat && stat.isDirectory()) {
        results = results.concat(getFilesRecursively(filePath));
      } else if (/\.(jpg|jpeg|png|webp|avif)$/i.test(file)) {
        const relativePath = path.relative(tilesDirectory, filePath);
        results.push(relativePath.replace(/\\/g, '/'));
      }
    });

    return results;
  };

  try {
    allFiles = getFilesRecursively(tilesDirectory);
  } catch (e) {
    console.error("Error reading tiles directory:", e);
  }

  return allFiles;
}

export async function getActiveTilePaths(): Promise<string[]> {
  const localFiles = await getAllTilePaths();
  let allFiles = localFiles;

  try {
    // Fetch active products from backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tilebazaardemowork-production.up.railway.app';
    const response = await fetch(`${apiUrl}/api/products`, { cache: 'no-store' });
    
    if (response.ok) {
      const products = await response.json();
      const supabaseImages = products.map((p: any) => p.image);
      const supabaseNames = products.map((p: any) => p.name.toLowerCase());
      
      // Map local files to include name and price from Supabase
      allFiles = localFiles.map(localPath => {
        const basename = localPath.split('/').pop() || localPath;
        const baseStr = basename.split('--')[0].replace(/\.[^/.]+$/, "").toLowerCase();
        const cleanStr = baseStr.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();

        // Find matching product
        const matchedProduct = products.find((p: any) => 
          p.image === basename || 
          p.name.toLowerCase() === baseStr || 
          p.name.toLowerCase() === cleanStr
        );

        if (matchedProduct) {
           let url = `${localPath}?name=${encodeURIComponent(matchedProduct.name)}&price=${matchedProduct.price}`;
           if (matchedProduct.discount_price) {
             url += `&discountPrice=${matchedProduct.discount_price}`;
           }
           if (matchedProduct.category) {
             url += `&category=${encodeURIComponent(matchedProduct.category)}`;
           }
           return url;
        }
        return null;
      }).filter(Boolean) as string[];

      // Add any products that have external image URLs (e.g. from Admin upload)
      const externalImages = products
        .filter((p: any) => p.image && p.image.startsWith("http"))
        .map((p: any) => {
          let url = `${p.image}?size=${p.size || '600x600'}&name=${encodeURIComponent(p.name)}&price=${p.price}`;
          if (p.discount_price) {
            url += `&discountPrice=${p.discount_price}`;
          }
          if (p.category) {
            url += `&category=${encodeURIComponent(p.category)}`;
          }
          return url;
        });
        
      allFiles = [...allFiles, ...externalImages];
    } else {
      console.warn("Failed to fetch products from backend, falling back to all local files.");
    }
  } catch (e) {
    console.error("Error fetching active tiles:", e);
  }

  return allFiles;
}
