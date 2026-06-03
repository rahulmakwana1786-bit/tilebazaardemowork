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
    const response = await fetch(`${apiUrl}/api/products`, { next: { revalidate: 0 } });
    
    if (response.ok) {
      const products = await response.json();
      const supabaseImages = products.map((p: any) => p.image);
      const supabaseNames = products.map((p: any) => p.name.toLowerCase());
      
      // Filter localFiles: keep the file if its basename matches Supabase 'image'
      // OR if the file's prefix name matches the Supabase product 'name'
      allFiles = localFiles.filter(localPath => {
        const basename = localPath.split('/').pop() || localPath;
        if (supabaseImages.includes(basename)) return true;
        
        const baseStr = basename.split('--')[0].replace(/\.[^/.]+$/, "").toLowerCase();
        if (supabaseNames.includes(baseStr)) return true;
        
        const cleanStr = baseStr.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
        if (supabaseNames.includes(cleanStr)) return true;
        
        return false;
      });
    } else {
      console.warn("Failed to fetch products from backend, falling back to all local files.");
    }
  } catch (e) {
    console.error("Error fetching active tiles:", e);
  }

  return allFiles;
}
