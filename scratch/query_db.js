import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'c:/final_tilebazaar_backup/Tilebazaar_current/backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, size, image, is_active')
    .eq('size', '600x600');

  if (error) {
    console.error('Error fetching:', error);
  } else {
    console.log(`Found ${data.length} products of size 600x600.`);
    const seen = new Map();
    const duplicates = [];
    data.forEach(p => {
      const key = `${p.name.toLowerCase().trim()}_${p.size.toLowerCase().trim()}`;
      if (seen.has(key)) {
        duplicates.push({ original: seen.get(key), duplicate: p });
      } else {
        seen.set(key, p);
      }
    });
    console.log('Duplicates found:', JSON.stringify(duplicates, null, 2));
    console.log('All 600x600 products:', JSON.stringify(data, null, 2));
  }
}

checkProducts();
