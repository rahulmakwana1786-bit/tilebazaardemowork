import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to scan files recursively
function getFilesRecursively(dir, baseDir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath, baseDir));
    } else if (/\.(jpg|jpeg|png|webp|avif)$/i.test(file)) {
      const relativePath = path.relative(baseDir, filePath);
      results.push(relativePath.replace(/\\/g, '/'));
    }
  });

  return results;
}

async function run() {
  // 1. Fetch ALL products from Supabase
  const { data: dbProducts, error } = await supabase
    .from('products')
    .select('*')
    .order('name');
    
  if (error) {
    console.error("Error fetching Supabase products:", error);
    process.exit(1);
  }

  console.log(`Supabase 'products' table count: ${dbProducts.length}`);

  // 2. Scan frontend local tile files
  const frontendTilesDir = path.resolve(process.cwd(), '../frontend/public/tiles');
  const localFiles = getFilesRecursively(frontendTilesDir, frontendTilesDir);
  console.log(`Frontend local tile files count: ${localFiles.length}`);

  // Let's filter localFiles to exclude variants/grids that shouldn't count as standalone products
  // Based on the code logic in TileGallery.tsx:
  const getFinish = (name) => {
    const upper = name.toUpperCase();
    if (upper.includes("HIGHGL")) return "HIGH GLOSS";
    if (upper.includes("MATT")) return "MATT";
    if (upper.includes("GLOSS")) return "GLOSS";
    if (upper.includes("CARVING")) return "CARVING";
    if (upper.includes("PUNCHGL")) return "POA";
    return "OTHER";
  };

  const baseLocalTiles = localFiles.filter((img) => {
    const fileName = img.split('/').pop();
    const upperName = fileName.toUpperCase();
    const finish = getFinish(fileName);
    const isAccessory = /TRIM|SPACER|WEDGE|ADHESIVE|GLUE|MATTING|LEVEL/.test(upperName);

    // Discard other files
    if (!isAccessory && finish === "OTHER") return false;

    // Discard duplicate sub-images / grid templates
    if (upperName.startsWith("AURL") && (upperName.includes("(1)") || upperName.includes("(2)") || upperName.includes("(3)") || upperName.includes("(5)"))) return false;
    if (upperName.startsWith("GRID_AURL")) return false;
    if (upperName.includes("PAVE") && (upperName.includes("(1)") || upperName.includes("(2)") || upperName.includes("(3)") || upperName.includes("(4)"))) return false;
    if (upperName.includes("GRID_PAVE")) return false;
    if (upperName.includes("SALTED CONCRETO") && upperName.includes("(1)")) return false;

    return true;
  });

  console.log(`Deduplicated frontend local product tiles/accessories: ${baseLocalTiles.length}`);

  // Let's map dbProducts by image filename
  const dbImages = dbProducts.map(p => p.image);
  const dbActiveCount = dbProducts.filter(p => p.is_active !== false).length;
  console.log(`Active products in Supabase: ${dbActiveCount}`);
  console.log(`Inactive products in Supabase: ${dbProducts.length - dbActiveCount}`);

  // Find duplicates or odd items in Supabase
  const imageCounts = {};
  const duplicateImages = [];
  dbProducts.forEach(p => {
    if (p.image) {
      imageCounts[p.image] = (imageCounts[p.image] || 0) + 1;
      if (imageCounts[p.image] > 1 && !duplicateImages.includes(p.image)) {
        duplicateImages.push(p.image);
      }
    }
  });

  if (duplicateImages.length > 0) {
    console.log("\n--- Duplicate Images in Supabase ---");
    duplicateImages.forEach(img => {
      const matches = dbProducts.filter(p => p.image === img);
      console.log(`Image: ${img}`);
      matches.forEach(m => {
        console.log(`  - ID: ${m.id}, Name: ${m.name}, Size: ${m.size}, Active: ${m.is_active}`);
      });
    });
  } else {
    console.log("\nNo duplicate images found in Supabase.");
  }

  // Find files in frontend local tiles that are NOT in Supabase at all
  console.log("\n--- Frontend Local Tiles NOT in Supabase ---");
  let missingCount = 0;
  baseLocalTiles.forEach(localPath => {
    const filename = localPath.split('/').pop();
    const baseStr = filename.split('--')[0].replace(/\.[^/.]+$/, "").toLowerCase();
    const cleanStr = baseStr.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();

    const matched = dbProducts.find((p) => {
      const pImage = p.image || '';
      const pName = p.name ? p.name.toLowerCase() : '';
      return pImage.toLowerCase() === filename.toLowerCase() || 
             pName === baseStr || 
             pName === cleanStr;
    });

    if (!matched) {
      console.log(`- Path: ${localPath} (Derived Name: ${cleanStr})`);
      missingCount++;
    }
  });
  console.log(`Total missing products: ${missingCount}`);
}

run();
