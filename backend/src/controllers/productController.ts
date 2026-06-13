import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { slugify } from '../utils/slugify.js';
import { cloudinary } from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, discount_price, stock, category, finish, size, thickness, material } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    // const parsedFinish = typeof finish === 'string' ? JSON.parse(finish) : finish;
    // const parsedCategory = typeof category === 'string' ? JSON.parse(category) : category;

    // 2. Generate a Composite Slug
    // We use the first finish and the size to make the slug unique
    // const primaryFinish = Array.isArray(parsedFinish) ? parsedFinish[0] : parsedFinish;
    const slugBase = `${name} ${finish || ''} ${size || ''}`;
    let finalSlug = slugify(slugBase);

    // 3. Optional: Check for exact duplicates in Supabase
    const { data: existingProduct } = await supabase
      .from('products')
      .select('slug')
      .eq('slug', finalSlug)
      .maybeSingle();

    if (existingProduct) {
      // If by some miracle name+finish+size is identical, add a random suffix
      finalSlug = `${finalSlug}-${Math.random().toString(36).substring(7)}`;
    }

    // --- UPLOAD TO CLOUDINARY FROM BUFFER ---
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'tilebazaar/products' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result?.secure_url);
          }
        );
        stream.end(req.file!.buffer); // Pass the buffer from memory
      });
    };

    const imageUrl = await uploadToCloudinary() as string;
    
    const basePrice = parseFloat(price);
    // Only parse discount if it's a non-empty string/number, otherwise set to null
    const discountPrice = (discount_price && discount_price !== "") ? parseFloat(discount_price) : null;
    
    // --- SAVE TO SUPABASE ---
    const { data, error } = await supabase
      .from('products')
      .insert([{ 
        name, slug: finalSlug, description, price: basePrice, discount_price: discountPrice, 
        stock: parseInt(stock), 
        category, finish, size, thickness, material, 
        image: imageUrl 
      }])
      .select().single();

    if (error) throw error;

    // --- SEND PROMOTIONAL EMAIL TO ALL USERS ---
    try {
      console.log(`Promotional email mocked for product ${finalSlug}.`);
    } catch (mailError) {
      console.error("Failed to send promotional email:", mailError);
    }

    res.status(201).json({ message: 'Product created successfully', product: data });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// GET all products (Public)
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    // Run direct filesystem sync asynchronously in the background
    syncLocalDirectoryDirectly().catch(err => console.error("Background directory sync error:", err));

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// GET product by slug (Public)
export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// --- AUTOMATIC SYNCHRONIZATION HELPERS & CONTROLLERS ---

function getFilesRecursively(dir: string, baseDir: string): string[] {
  let results: string[] = [];
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

const getFinishFromFilename = (fileName: string): string => {
  const name = fileName.toUpperCase();
  if (name.includes("--GLOSSY") || name.includes("--GLOSS")) return "GLOSSY";
  if (name.includes("--MATT") && !name.includes("--MATTING")) return "MATT";
  if (name.includes("PAVE") || name.includes("SALTED CONCRETO")) return "MATT";
  if (name.includes("--CARVING")) return "CARVING";
  if (name.includes("--HIGHGL")) return "HIGH GLOSS";
  if (name.includes("--PUNCHGL")) return "POSTER";
  if (name.includes("--LOVIN")) return "LOVELIN";
  if (name.includes("--TPH")) return "TYPHOON";
  return "OTHER";
};

const formatFileNameToProductName = (name: string): string => {
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
  return clean.toUpperCase();
};

const getSizeFromFolder = (localPath: string, fileName: string): string => {
  if (localPath.includes("/")) {
    const parts = localPath.split("/");
    const sizeFolder = parts[0];
    if (sizeFolder.includes("x")) {
      return sizeFolder.toUpperCase();
    }
  }
  const name = fileName.toUpperCase();
  if (name.includes("TRIM")) {
    let depth = "";
    if (name.includes("10MM")) depth = "10MM";
    else if (name.includes("12MM")) depth = "12MM";
    else if (name.includes("8MM")) depth = "8MM";
    let length = "";
    if (name.includes("2.5M")) length = "2.5M";
    if (depth && length) return `${depth} × ${length}`;
    if (depth) return depth;
    if (length) return length;
  }
  if (name.includes("20KG")) {
    return "20KG";
  }
  return "ACCESSORIES";
};

const getCategoryFromPath = (localPath: string): string => {
  const upper = localPath.toUpperCase();
  if (
    upper.includes("AURL GRIGIO") ||
    upper.includes("PAVE") ||
    upper.includes("SALT CONCRETO") ||
    upper.includes("SALTED CONCRETO")
  ) {
    return "Outdoor Tiles";
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
  if (upper.includes("OUTDOOR")) return "Outdoor Tiles";
  return "Floor Tiles";
};

const getPriceFromFilename = (fileName: string): { price: number; discount_price: number | null } => {
  const upper = fileName.toUpperCase();
  if (upper.includes("TRIM")) return { price: 8, discount_price: null };
  if (upper.includes("SPACER")) return { price: 6, discount_price: null };
  if (upper.includes("WEDGE")) return { price: 6, discount_price: null };
  if (upper.includes("ADHESIVE") || upper.includes("GLUE")) return { price: 12, discount_price: null };
  if (upper.includes("MATTING")) return { price: 6, discount_price: null };
  if (upper.includes("AURL GRIGIO") || upper.includes("PAVE") || upper.includes("SALT CONCRETO") || upper.includes("SALTED CONCRETO") || upper.includes("OUTDOOR")) {
    return { price: 18, discount_price: null };
  }
  return { price: 15, discount_price: null };
};

const syncLocalDirectoryDirectly = async () => {
  try {
    let tilesDir = path.resolve(process.cwd(), '../frontend/public/tiles');
    if (!fs.existsSync(tilesDir)) {
      tilesDir = path.resolve(process.cwd(), 'frontend/public/tiles');
    }
    if (!fs.existsSync(tilesDir)) {
      tilesDir = path.resolve(process.cwd(), './public/tiles');
    }
    if (!fs.existsSync(tilesDir)) {
      return; // Skip if directory cannot be resolved
    }

    const localFiles = getFilesRecursively(tilesDir, tilesDir);
    if (localFiles.length === 0) return;

    // Fetch existing products
    const { data: dbProducts } = await supabase.from('products').select('name, slug, size, finish, image');
    const existingProducts = dbProducts || [];

    const productsToSync = [];
    for (const relativePath of localFiles) {
      const filename = relativePath.split('/').pop() || relativePath;
      const finish = getFinishFromFilename(filename);
      const isAccessory = /TRIM|SPACER|WEDGE|ADHESIVE|GLUE|MATTING|LEVEL/.test(filename.toUpperCase());

      if (!isAccessory && finish === "OTHER") continue;

      // Skip duplicate sub-images / grid templates
      const upperName = filename.toUpperCase();
      if (upperName.startsWith("AURL") && (upperName.includes("(1)") || upperName.includes("(2)") || upperName.includes("(3)") || upperName.includes("(5)"))) continue;
      if (upperName.startsWith("GRID_AURL")) continue;
      if (upperName.includes("PAVE") && (upperName.includes("(1)") || upperName.includes("(2)") || upperName.includes("(3)") || upperName.includes("(4)"))) continue;
      if (upperName.includes("GRID_PAVE")) continue;
      if (upperName.includes("SALTED CONCRETO") && upperName.includes("(1)")) continue;

      const displayName = formatFileNameToProductName(filename);
      const size = getSizeFromFolder(relativePath, filename);
      const slugBase = `${displayName} ${finish !== 'OTHER' ? finish : ''} ${size}`;
      const finalSlug = slugify(slugBase);

      // Robust check if product already exists
      const alreadyExists = existingProducts.some((p: any) => {
        const pImage = p.image || '';
        const dbFilename = pImage.includes('/') ? pImage.split('/').pop() : pImage;
        if (dbFilename && dbFilename.toLowerCase() === filename.toLowerCase()) return true;

        if (p.slug && p.slug.toLowerCase() === finalSlug.toLowerCase()) return true;

        const pName = p.name ? p.name.toLowerCase() : '';
        const cleanName = displayName.toLowerCase();
        const nameMatches = pName === cleanName || pName.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim() === cleanName;
        if (nameMatches) {
          const pSize = p.size || '';
          const normProdSize = pSize.toLowerCase().replace(/[^a-z0-9]/g, "");
          const normLocalSize = size.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (normProdSize === normLocalSize) {
            const pFinish = (p.finish || '').toLowerCase();
            const localFinish = (finish !== 'OTHER' ? finish : '').toLowerCase();
            if (pFinish === localFinish) return true;
          }
        }
        return false;
      });

      if (alreadyExists) continue;

      const { price, discount_price } = getPriceFromFilename(filename);
      const category = getCategoryFromPath(relativePath);

      productsToSync.push({
        name: displayName,
        slug: finalSlug,
        description: 'Premium quality tile.',
        price,
        discount_price,
        stock: 100,
        category,
        finish: finish !== 'OTHER' ? finish : '',
        size,
        thickness: category === 'Accessories' ? '' : '9mm',
        material: category === 'Accessories' ? '' : 'Porcelain',
        image: filename,
        is_active: true
      });
    }

    if (productsToSync.length > 0) {
      // Deduplicate by slug to prevent "ON CONFLICT DO UPDATE command cannot affect row a second time" postgres error
      const uniqueProducts = [];
      const seenSlugsInBatch = new Set();
      for (const prod of productsToSync) {
        if (!seenSlugsInBatch.has(prod.slug)) {
          seenSlugsInBatch.add(prod.slug);
          uniqueProducts.push(prod);
        }
      }

      console.log(`Syncing ${uniqueProducts.length} unique products directly from local filesystem...`);
      const { error } = await supabase.from('products').upsert(uniqueProducts, { onConflict: 'slug' });
      if (error) {
        console.error("Error upserting synced products:", error);
      }
    }
  } catch (err) {
    console.error("Failed to run local directory sync:", err);
  }
};

export const syncLocalProducts = async (req: Request, res: Response) => {
  try {
    const { paths } = req.body;
    if (!paths || !Array.isArray(paths)) {
      return res.status(400).json({ message: 'paths array is required' });
    }

    const results = [];
    for (const relativePath of paths) {
      const filename = relativePath.split('/').pop() || relativePath;
      const finish = getFinishFromFilename(filename);
      const isAccessory = /TRIM|SPACER|WEDGE|ADHESIVE|GLUE|MATTING|LEVEL/.test(filename.toUpperCase());

      if (!isAccessory && finish === "OTHER") {
        continue;
      }

      // Skip duplicate sub-images / grid templates
      const upperName = filename.toUpperCase();
      if (upperName.startsWith("AURL") && (upperName.includes("(1)") || upperName.includes("(2)") || upperName.includes("(3)") || upperName.includes("(5)"))) continue;
      if (upperName.startsWith("GRID_AURL")) continue;
      if (upperName.includes("PAVE") && (upperName.includes("(1)") || upperName.includes("(2)") || upperName.includes("(3)") || upperName.includes("(4)"))) continue;
      if (upperName.includes("GRID_PAVE")) continue;
      if (upperName.includes("SALTED CONCRETO") && upperName.includes("(1)")) continue;

      const displayName = formatFileNameToProductName(filename);
      const size = getSizeFromFolder(relativePath, filename);
      const slugBase = `${displayName} ${finish !== 'OTHER' ? finish : ''} ${size}`;
      const finalSlug = slugify(slugBase);

      const { price, discount_price } = getPriceFromFilename(filename);
      const category = getCategoryFromPath(relativePath);

      const productData = {
        name: displayName,
        slug: finalSlug,
        description: 'Premium quality tile.',
        price,
        discount_price,
        stock: 100,
        category,
        finish: finish !== 'OTHER' ? finish : '',
        size,
        thickness: category === 'Accessories' ? '' : '9mm',
        material: category === 'Accessories' ? '' : 'Porcelain',
        image: filename,
        is_active: true
      };

      const { data, error } = await supabase
        .from('products')
        .upsert([productData], { onConflict: 'slug' })
        .select()
        .single();

      if (error) {
        console.error(`Error syncing product ${displayName}:`, error);
      } else {
        results.push(data);
      }
    }

    res.status(200).json({ message: `Successfully synced ${results.length} products`, synced: results });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};