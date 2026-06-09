import fs from 'fs';
import path from 'path';
import { supabase } from './config/supabase.js';

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

async function main() {
  const tilesListPath = path.join('../frontend/app/tiles-list.json');
  if (!fs.existsSync(tilesListPath)) {
    console.error(`tiles-list.json not found`);
    return;
  }

  const tilesList: string[] = JSON.parse(fs.readFileSync(tilesListPath, 'utf-8'));

  // 1. Get the 26 deduplicated 600x600 local tiles
  const local600x600 = tilesList.filter((img) => {
    if (!img.startsWith('600x600/')) return false;

    const fileName = img.split("/").pop() || img;
    const upperName = fileName.toUpperCase();
    const finish = getFinish(fileName);

    if (finish === "OTHER") return false;

    if (upperName.startsWith("AURL") && (upperName.includes("(1)") || upperName.includes("(2)") || upperName.includes("(3)") || upperName.includes("(5)"))) {
      return false;
    }
    if (upperName.startsWith("GRID_AURL")) return false;

    if (upperName.includes("PAVE") && (upperName.includes("(1)") || upperName.includes("(2)") || upperName.includes("(3)") || upperName.includes("(4)"))) {
      return false;
    }
    if (upperName.includes("GRID_PAVE")) return false;

    if (upperName.includes("SALTED CONCRETO") && upperName.includes("(1)")) return false;
    
    return true;
  });

  console.log(`Deduplicated 600x600 images in code: ${local600x600.length}`);

  // 2. Fetch all products with size 600X600 or 600x600 from Supabase
  const { data: dbProducts, error } = await supabase
    .from('products')
    .select('*')
    .or('size.eq.600X600,size.eq.600x600');

  if (error) {
    console.error('Error fetching Supabase products:', error);
    return;
  }

  console.log(`Supabase 600x600 products: ${dbProducts.length}`);

  const missing: string[] = [];

  for (const localPath of local600x600) {
    const basename = localPath.split('/').pop() || localPath;
    const baseStr = basename.split('--')[0].replace(/\.[^/.]+$/, "").toLowerCase();
    const cleanStr = baseStr.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();

    // Check if this specific 600x600 product exists in the DB
    const matchedProduct = dbProducts.find((p: any) => 
      p.image === basename || 
      p.name.toLowerCase() === baseStr || 
      p.name.toLowerCase() === cleanStr
    );

    if (!matchedProduct) {
      missing.push(localPath);
    }
  }

  console.log(`Missing 600x600 products count: ${missing.length}`);
  missing.forEach((m, idx) => {
    console.log(`${idx+1}: File: ${m}, FormatName: ${formatFileName(m.split('/').pop()!)}`);
  });
}

main();
