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
    .select('id, name, slug, size, image')
    .ilike('name', '%alexa%');

  if (error) {
    console.error('Error fetching:', error);
  } else {
    console.log('Products:', JSON.stringify(data, null, 2));
  }
}

checkProducts();
