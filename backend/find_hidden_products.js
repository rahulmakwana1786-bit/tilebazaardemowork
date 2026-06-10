import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

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

const getFinish = (fileName) => {
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

const formatFileName = (name) => {
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

async function run() {
  const { data: dbProducts, error } = await supabase.from('products').select('*');
  if (error) {
    console.error(error);
    process.exit(1);
  }

  const tilesDirectory = path.resolve(process.cwd(), '../frontend/public/tiles');
  const localFiles = getFilesRecursively(tilesDirectory, tilesDirectory);

  // Replicate actions.ts getActiveTilePaths mapping logic
  let initialImages = localFiles.map(localPath => {
    const basename = localPath.split('/').pop() || localPath;
    const baseStr = basename.split('--')[0].replace(/\.[^/.]+$/, "").toLowerCase();
    const cleanStr = baseStr.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();

    const matchedProduct = dbProducts.find((p) => 
      (p.image && p.image.toLowerCase() === basename.toLowerCase()) || 
      (p.name && p.name.toLowerCase() === baseStr) || 
      (p.name && p.name.toLowerCase() === cleanStr)
    );

    if (matchedProduct) {
       let url = `${localPath}?id=${matchedProduct.id}&name=${encodeURIComponent(matchedProduct.name)}`;
       return url;
    }
    return null;
  }).filter(Boolean);

  const externalImages = dbProducts
    .filter((p) => p.image && p.image.startsWith("http"))
    .map((p) => {
      let url = `${p.image}?id=${p.id}&size=${p.size || '600x600'}&name=${encodeURIComponent(p.name)}`;
      return url;
    });
    
  initialImages = [...initialImages, ...externalImages];

  // Replicate TileGallery deduplication
  const baseImages = initialImages.filter((img) => {
    const fileName = img.split("/").pop().split("?")[0];
    const upperName = fileName.toUpperCase();
    const finish = getFinish(fileName);
    const isAccessory = /TRIM|SPACER|WEDGE|ADHESIVE|GLUE|MATTING|LEVEL/.test(upperName);

    if (!isAccessory && finish === "OTHER") return false;

    if (upperName.startsWith("AURL") && (upperName.includes("(1)") || upperName.includes("(2)") || upperName.includes("(3)") || upperName.includes("(5)"))) return false;
    if (upperName.startsWith("GRID_AURL")) return false;
    if (upperName.includes("PAVE") && (upperName.includes("(1)") || upperName.includes("(2)") || upperName.includes("(3)") || upperName.includes("(4)"))) return false;
    if (upperName.includes("GRID_PAVE")) return false;
    if (upperName.includes("SALTED CONCRETO") && upperName.includes("(1)")) return false;
    
    return true;
  });

  const grouped = new Map();
  baseImages.forEach(img => {
    const fileName = img.split("?")[0].split("/").pop();
    const baseName = formatFileName(fileName).toLowerCase();
    
    let size = "OTHER";
    if (img.includes("?size=")) {
      size = img.split("?size=")[1].split("&")[0];
    } else if (img.split("/").length > 1 && !img.startsWith("http")) {
      size = img.split("/")[0].split("?")[0];
    }
    
    const key = `${baseName}_${size}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(img);
  });

  const displayedProductIds = new Set();
  grouped.forEach((images) => {
    let selected = [];
    if (images.length > 1) {
      const nonMatt = images.filter(img => {
        const fileName = img.split("/").pop().split("?")[0];
        return getFinish(fileName) !== "MATT";
      });
      if (nonMatt.length > 0) {
        selected = nonMatt;
      } else {
        selected = images;
      }
    } else {
      selected = [images[0]];
    }

    selected.forEach(img => {
      // Extract ID
      const urlParams = new URLSearchParams(img.split('?')[1]);
      const id = urlParams.get('id');
      if (id) displayedProductIds.add(id);
    });
  });

  console.log(`Total Database Products: ${dbProducts.length}`);
  console.log(`Displayed Products in Frontend Gallery: ${displayedProductIds.size}`);

  const hiddenProducts = dbProducts.filter(p => !displayedProductIds.has(p.id));
  console.log(`Hidden Products in DB (Not displayed in frontend gallery): ${hiddenProducts.length}`);
  hiddenProducts.forEach(p => {
    console.log(`- ID: ${p.id} | Name: ${p.name} | Size: ${p.size} | Finish: ${p.finish} | Image: ${p.image}`);
  });
}

run();
