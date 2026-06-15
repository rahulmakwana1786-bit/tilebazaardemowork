"use server";

import fs from "fs";
import path from "path";

// In-memory cache variables for improved page load speeds
let cachedActiveTiles: string[] | null = null;
let activeTilesTimestamp = 0;

let cachedComingSoonPaths: string[] | null = null;
let comingSoonTimestamp = 0;

let cachedPreviewPaths: string[] | null = null;
let previewPathsTimestamp = 0;

const CACHE_TTL_MS = 30 * 1000; // Cache for 30 seconds

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

function formatFileName(name: string): string {
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

  // Handle hyphenated/spaced custom files like validus-relo-white-tile-adhesive-c2ft-s1-20kg
  if (clean.includes(" ") || clean.includes("-")) {
    const words = clean.split(/[-_\s]+/);
    const uppercaseWords = ["C2FT", "C2TE", "S1", "CT", "C30", "F7", "POA", "AURL", "PAVE", "TC", "EXP"];
    const formattedWords = words.map(w => {
      const upperW = w.toUpperCase();
      if (uppercaseWords.includes(upperW)) return upperW;
      if (/^\d+(?:kg|m|mm)$/i.test(w)) return w.toLowerCase();
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    });
    let result = formattedWords.join(" ");
    result = result.replace(/\s(\d+(?:kg|m|mm))\b/i, " - $1");
    return result;
  }
  return clean;
}

function getFinish(fileName: string): string {
  const name = fileName.toUpperCase();
  if (name.includes("TRIM")) {
    if (name.includes("BRUSHED BRASS")) return "Brushed Brass Effect";
    if (name.includes("BRUSHED CHROME")) return "Brushed Chrome";
    if (name.includes("POLISHED BRASS")) return "Polished Brass Effect";
    if (name.includes("POLISHED COPPER")) return "Polished Copper Effect";
    if (name.includes("GLOSS BLACK")) return "Gloss Black";
    if (name.includes("MATT BLACK")) return "Matt Black";
    if (name.includes("GRANITE")) return "Granite Effect";
    if (name.includes("LIMESTONE")) return "Limestone Effect";
    if (name.includes("SANDSTONE")) return "Sandstone Effect";
    if (name.includes("BASALT")) return "Basalt Effect";
    if (name.includes("CHROME EFFECT") || name.includes("CHROME")) return "Chrome Effect";
  }
  if (name.includes("ADHESIVE") || name.includes("LEVEL") || name.includes("GLUE") || name.includes("COMPOUND")) {
    if (name.includes("GREY")) return "Grey";
    if (name.includes("WHITE")) return "White";
    if (name.includes("ALTUS")) return "Grey";
    return "N/A";
  }
  if (name.includes("--GLOSSY") || name.includes("--GLOSS")) return "GLOSSY";
  if (name.includes("--MATT") && !name.includes("--MATTING")) return "MATT";
  if (name.includes("PAVE") || name.includes("SALTED CONCRETO")) return "MATT";
  if (name.includes("--CARVING")) return "CARVING";
  if (name.includes("--HIGHGL")) return "HIGH GLOSS";
  if (name.includes("--PUNCHGL")) return "POSTER";
  if (name.includes("--LOVIN")) return "LOVELIN";
  if (name.includes("--TPH")) return "TYPHOON";
  return "OTHER";
}

function getSize(localPath: string, fileName: string): string {
  if (localPath.includes("?size=")) {
    return localPath.split("?size=")[1].split("&")[0];
  }
  if (localPath.includes("/")) {
    const parts = localPath.split("/");
    const sizeFolder = parts.find(p => p.toLowerCase().includes("x") && /\d+x\d+/i.test(p));
    if (sizeFolder) {
      return sizeFolder;
    }
    const sizeFolderPart = parts[0];
    if (sizeFolderPart.includes("x")) {
      return sizeFolderPart;
    }
  }
  const name = fileName.toUpperCase();
  if (name.includes("TRIM")) {
    let depth = "";
    if (name.includes("10MM")) depth = "10mm";
    else if (name.includes("12MM")) depth = "12mm";
    else if (name.includes("8MM")) depth = "8mm";
    let length = "";
    if (name.includes("2.5M")) length = "2.5m";
    if (depth && length) return `${depth} × ${length}`;
    if (depth) return depth;
    if (length) return length;
  }
  if (name.includes("20KG")) {
    return "20kg";
  }
  if (localPath.includes("comingsoon")) {
    return "600x1200";
  }
  return "accessories";
}

function getCategory(localPath: string): string {
  const upper = localPath.toUpperCase();
  if (
    upper.includes("AURL GRIGIO") ||
    upper.includes("PAVE") ||
    upper.includes("SALT CONCRETO") ||
    upper.includes("SALTED CONCRETO")
  ) {
    return "Outdoor tiles";
  }
  if (
    upper.includes("TRIM") ||
    upper.includes("SPACER") ||
    upper.includes("WEDGE") ||
    upper.includes("ADHESIVE") ||
    upper.includes("GLUE") ||
    upper.includes("MATTING") ||
    upper.includes("LEVEL")
  ) {
    return "Accessories";
  }
  if (upper.includes("OUTDOOR")) return "Outdoor";
  if (upper.includes("DECOR") || upper.includes("POSTER")) return "Decorative";
  if (upper.includes("GLOSS") || upper.includes("HIGHGL")) return "Glossy Collection";
  if (upper.includes("MATT") || upper.includes("PAVE") || upper.includes("SALTED CONCRETO")) return "Matt Collection";
  if (upper.includes("CARVING")) return "Carving Collection";
  return "Premium Collection";
}

function getProductDetails(fileName: string) {
  const upper = fileName.toUpperCase();
  if (upper.includes("TRIM")) return { price: 8, unit: "+vat/piece" };
  if (upper.includes("SPACER")) return { price: 6, unit: "+vat/bag" };
  if (upper.includes("WEDGE")) return { price: 6, unit: "+vat/bag" };
  if (upper.includes("ADHESIVE") || upper.includes("GLUE")) return { price: 12, unit: "+vat/bag" };
  if (upper.includes("MATTING") || upper.includes("LEVEL")) return { price: 6, unit: "+vat/sqm" };
  if (
    upper.includes("AURL GRIGIO") ||
    upper.includes("PAVE") ||
    upper.includes("SALT CONCRETO") ||
    upper.includes("SALTED CONCRETO") ||
    upper.includes("OUTDOOR")
  ) {
    return { price: 18, unit: "m²" };
  }
  return { price: 15, unit: "m²" };
}

function mapLocalPathToUrl(localPath: string, products: any[] = []): string[] {
  const basename = localPath.split('/').pop() || localPath;
  const baseStr = basename.split('--')[0].replace(/\.[^/.]+$/, "").toLowerCase();
  const cleanStr = baseStr.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();

  // Find matching products
  const matchedProducts = products.filter((p: any) => {
    if (p.image && p.image.startsWith("http")) {
      return false;
    }
    if (p.image === basename) {
      const localSize = getSize(localPath, basename);
      const prodSize = p.size;
      if (localSize && prodSize) {
        const normLocal = localSize.toLowerCase().replace(/[^a-z0-9]/g, "");
        const normProd = prodSize.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (normLocal === normProd) {
          return true;
        }
        return false;
      }
      return true;
    }
    const nameMatches = p.name.toLowerCase() === baseStr || p.name.toLowerCase() === cleanStr;
    if (nameMatches) {
      const localSize = getSize(localPath, basename);
      const prodSize = p.size;
      if (localSize && prodSize) {
        const normLocal = localSize.toLowerCase().replace(/[^a-z0-9]/g, "");
        const normProd = prodSize.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (normLocal === normProd) {
          return true;
        }
      } else {
        const isLocalAcc = !localSize || localSize === "accessories";
        const isProdAcc = !prodSize || prodSize.toLowerCase() === "accessories" || prodSize.toLowerCase() === "n/a" || prodSize === "";
        if (isLocalAcc && isProdAcc) {
          return true;
        }
      }
    }
    return false;
  });

  if (matchedProducts.length > 0) {
    return matchedProducts.map((matchedProduct: any) => {
      let url = `${localPath}?name=${encodeURIComponent(matchedProduct.name)}&price=${matchedProduct.price}`;
      if (matchedProduct.slug) {
        url += `&slug=${matchedProduct.slug}`;
      }
      if (matchedProduct.discount_price !== undefined && matchedProduct.discount_price !== null) {
        url += `&discountPrice=${matchedProduct.discount_price}`;
      }
      if (matchedProduct.category) {
        url += `&category=${encodeURIComponent(matchedProduct.category)}`;
      }
      if (matchedProduct.size) {
        url += `&size=${encodeURIComponent(matchedProduct.size)}`;
      }
      if (matchedProduct.finish) {
        url += `&finish=${encodeURIComponent(matchedProduct.finish)}`;
      }
      return url;
    });
  }

  // Fallback for unmatched local file
  const cleanName = formatFileName(basename);
  const fallbackSlug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const fallbackCategory = getCategory(localPath);
  const fallbackDetails = getProductDetails(basename);
  const fallbackSize = getSize(localPath, basename);
  const fallbackFinish = getFinish(basename);

  let url = `${localPath}?name=${encodeURIComponent(cleanName)}&price=${fallbackDetails.price}&slug=${fallbackSlug}&category=${encodeURIComponent(fallbackCategory)}`;
  if (fallbackSize && fallbackSize !== "accessories") {
    url += `&size=${encodeURIComponent(fallbackSize)}`;
  }
  if (fallbackFinish && fallbackFinish !== "OTHER" && fallbackFinish !== "N/A") {
    url += `&finish=${encodeURIComponent(fallbackFinish)}`;
  }
  return [url];
}

export async function getActiveTilePaths(): Promise<string[]> {
  const now = Date.now();
  if (cachedActiveTiles && (now - activeTilesTimestamp < CACHE_TTL_MS)) {
    return cachedActiveTiles;
  }

  const localFiles = await getAllTilePaths();
  const comingSoonFiles = await getAllComingSoonPaths();
  let allFiles: string[] = [];

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tilebazaardemowork-production.up.railway.app';

  try {
    // Fetch active products from backend with a 3-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${apiUrl}/api/products`, { 
      cache: 'no-store',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      let products = await response.json();

      // Check for local files that are missing from products list
      const missingFiles: string[] = [];
      localFiles.forEach(localPath => {
        const basename = localPath.split('/').pop() || localPath;
        const matched = products.find((p: any) => {
          if (p.image && p.image.toLowerCase() === basename.toLowerCase()) {
            const localSize = getSize(localPath, basename);
            const prodSize = p.size;
            if (localSize && prodSize) {
              const normLocal = localSize.toLowerCase().replace(/[^a-z0-9]/g, "");
              const normProd = prodSize.toLowerCase().replace(/[^a-z0-9]/g, "");
              if (normLocal === normProd) return true;
            }
          }
          return false;
        });
        if (!matched) {
          missingFiles.push(localPath);
        }
      });

      if (missingFiles.length > 0) {
        try {
          console.log(`Syncing ${missingFiles.length} missing local products to backend...`);
          const syncController = new AbortController();
          const syncTimeoutId = setTimeout(() => syncController.abort(), 3000);

          const syncResponse = await fetch(`${apiUrl}/api/products/sync-local`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paths: missingFiles }),
            signal: syncController.signal
          });
          clearTimeout(syncTimeoutId);

          if (syncResponse.ok) {
            const refetchController = new AbortController();
            const refetchTimeoutId = setTimeout(() => refetchController.abort(), 3000);

            const refetchedResponse = await fetch(`${apiUrl}/api/products`, { 
              cache: 'no-store',
              signal: refetchController.signal
            });
            clearTimeout(refetchTimeoutId);

            if (refetchedResponse.ok) {
              products = await refetchedResponse.json();
            }
          }
        } catch (syncError) {
          console.error("Error syncing missing local products to backend:", syncError);
        }
      }

      allFiles = localFiles.flatMap(localPath => mapLocalPathToUrl(localPath, products));

      // Add any products that have external image URLs (e.g. from Admin upload)
      const externalImages = products
        .filter((p: any) => p.image && p.image.startsWith("http"))
        .map((p: any) => {
          let url = `${p.image}?size=${p.size || '600x600'}&name=${encodeURIComponent(p.name)}&price=${p.price}`;
          if (p.slug) {
            url += `&slug=${p.slug}`;
          }
          if (p.discount_price !== undefined && p.discount_price !== null) {
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
      allFiles = localFiles.flatMap(localPath => mapLocalPathToUrl(localPath, []));
    }
  } catch (e: any) {
    const isConnRefused = e?.cause?.code === 'ECONNREFUSED' || e?.message?.includes('ECONNREFUSED') || String(e).includes('ECONNREFUSED');
    if (isConnRefused) {
      console.warn(`\n[TileBazaar Warning] Backend server is not running or is unreachable at ${apiUrl}.`);
      console.warn(`To start the backend, run 'npm run dev' inside the '/backend' directory.\n`);
    } else {
      console.error("Error fetching active tiles, falling back to local files:", e);
    }
    allFiles = localFiles.flatMap(localPath => mapLocalPathToUrl(localPath, []));
  }

  // Map and append Coming Soon files
  const comingSoonUrls = comingSoonFiles.flatMap(localPath => {
    const basename = localPath.split('/').pop() || localPath;
    const cleanName = formatFileName(basename);
    const fallbackSlug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const fallbackCategory = "Coming Soon";
    const size = getSize(localPath, basename);
    const finish = getFinish(basename);

    let url = `${localPath}?name=${encodeURIComponent(cleanName)}&price=0&slug=${fallbackSlug}&category=${encodeURIComponent(fallbackCategory)}`;
    if (size && size !== "accessories") {
      url += `&size=${encodeURIComponent(size)}`;
    }
    if (finish && finish !== "OTHER" && finish !== "N/A") {
      url += `&finish=${encodeURIComponent(finish)}`;
    }
    return [url];
  });

  allFiles = [...allFiles, ...comingSoonUrls];

  cachedActiveTiles = allFiles;
  activeTilesTimestamp = now;
  return allFiles;
}

export async function getAllComingSoonPaths(): Promise<string[]> {
  const now = Date.now();
  if (cachedComingSoonPaths && (now - comingSoonTimestamp < CACHE_TTL_MS)) {
    return cachedComingSoonPaths;
  }

  const comingSoonDirectory = path.join(process.cwd(), "public/comingsoon");
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
        const relativePath = path.relative(path.join(process.cwd(), "public"), filePath);
        results.push(relativePath.replace(/\\/g, '/'));
      }
    });

    return results;
  };

  try {
    allFiles = getFilesRecursively(comingSoonDirectory);
  } catch (e) {
    console.error("Error reading comingsoon directory:", e);
  }

  // Fallback to static comingsoon-list.json if allFiles is empty (e.g. on Vercel serverless)
  if (allFiles.length === 0) {
    try {
      const comingsoonListPath = path.join(process.cwd(), "app/comingsoon-list.json");
      if (fs.existsSync(comingsoonListPath)) {
        const data = fs.readFileSync(comingsoonListPath, "utf-8");
        allFiles = JSON.parse(data);
      }
    } catch (err) {
      console.error("Failed to read static comingsoon list fallback:", err);
    }
  }

  cachedComingSoonPaths = allFiles;
  comingSoonTimestamp = now;
  return allFiles;
}

export async function getAllPreviewPaths(): Promise<string[]> {
  const now = Date.now();
  if (cachedPreviewPaths && (now - previewPathsTimestamp < CACHE_TTL_MS)) {
    return cachedPreviewPaths;
  }

  const previewsDirectory = path.join(process.cwd(), "public/previews");
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
        const relativePath = path.relative(previewsDirectory, filePath);
        const mtime = stat.mtimeMs ? Math.round(stat.mtimeMs) : Date.now();
        results.push(`${relativePath.replace(/\\/g, '/')}?t=${mtime}`);
      }
    });

    return results;
  };

  try {
    allFiles = getFilesRecursively(previewsDirectory);
  } catch (e) {
    console.error("Error reading previews directory:", e);
  }

  // Fallback to static previews-list.json if allFiles is empty (e.g. on Vercel serverless)
  if (allFiles.length === 0) {
    try {
      const previewsListPath = path.join(process.cwd(), "app/previews-list.json");
      if (fs.existsSync(previewsListPath)) {
        const data = fs.readFileSync(previewsListPath, "utf-8");
        const list = JSON.parse(data);
        const mtime = Date.now();
        allFiles = list.map((p: string) => `${p}?t=${mtime}`);
      }
    } catch (err) {
      console.error("Failed to read static previews list fallback:", err);
    }
  }

  cachedPreviewPaths = allFiles;
  previewPathsTimestamp = now;
  return allFiles;
}

