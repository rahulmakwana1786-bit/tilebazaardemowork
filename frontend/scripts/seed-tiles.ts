import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: '../backend/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function seedProducts() {
  const tilesDir = '../frontend/public/tiles';
  const sizes = ['600x1200', '600x600', '300x600', '300x300'];
  
  const products = [];

  for (const size of sizes) {
    const sizePath = path.join(tilesDir, size);
    if (!fs.existsSync(sizePath)) continue;

    const files = fs.readdirSync(sizePath);
    for (const file of files) {
      if (!file.endsWith('.jpg') && !file.endsWith('.png')) continue;

      // Parse name and finish from filename (e.g. "ALEXA BEIGE_R1--GLOSS.jpg")
      const namePart = file.split('--')[0].replace(/_/g, ' ');
      const finishPart = file.split('--')[1]?.split('.')[0];
      
      products.push({
        name: namePart.toUpperCase(),
        slug: namePart.toLowerCase().replace(/ /g, '-'),
        price: 15.00,
        discount_price: 20.00,
        image: file, // Store just the filename, we build path in frontend
        size: size.toUpperCase(),
        finish: finishPart ? finishPart.toUpperCase() : null,
        category: 'Tiles',
        stock_quantity: 100,
        is_active: true
      });
    }
  }

  console.log(`Found ${products.length} products. Seeding...`);

  const { error } = await supabase.from('products').upsert(products, { onConflict: 'slug' });

  if (error) {
    console.error('Error seeding products:', error);
  } else {
    console.log('Successfully seeded products!');
  }
}

seedProducts();
