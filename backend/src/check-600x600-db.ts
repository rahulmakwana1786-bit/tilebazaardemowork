import { supabase } from './config/supabase.js';
import fs from 'fs';
import path from 'path';

async function main() {
  const { data: dbProducts, error } = await supabase
    .from('products')
    .select('*')
    .eq('size', '600X600');

  if (error) {
    console.error("Error fetching 600x600 from Supabase:", error);
    return;
  }

  console.log(`--- Supabase 600X600 products (${dbProducts.length}) ---`);
  dbProducts.forEach(p => {
    console.log(`ID: ${p.id}, Name: "${p.name}", Slug: "${p.slug}", Image: "${p.image}"`);
  });

  // Read local tiles-list.json
  const tilesListPath = '../frontend/app/tiles-list.json';
  if (!fs.existsSync(tilesListPath)) {
    console.error("tiles-list.json not found");
    return;
  }
  const tilesList: string[] = JSON.parse(fs.readFileSync(tilesListPath, 'utf-8'));
  const local600x600 = tilesList.filter(f => f.startsWith('600x600/'));

  console.log(`\n--- Local 600x600 files (${local600x600.length}) ---`);
  local600x600.forEach(f => console.log(f));
}

main();
