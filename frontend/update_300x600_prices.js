import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePrices() {
  console.log('Updating 300x600 product prices in database...');
  const { data, error } = await supabase
    .from('products')
    .update({ price: 15, discount_price: 10 })
    .ilike('size', '%300%')
    .select();

  if (error) {
    console.error('Error updating prices:', error);
  } else {
    console.log(`Successfully updated ${data.length} products of size 300x600 in the database.`);
    console.log('Sample updated products:', JSON.stringify(data.slice(0, 5), null, 2));
  }
}

updatePrices();
