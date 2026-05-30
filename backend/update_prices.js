import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const getProductPrice = (fileName) => {
  const upper = fileName.toUpperCase();
  if (upper.includes("TRIM")) return 8;
  if (upper.includes("SPACER")) return 6;
  if (upper.includes("WEDGE")) return 6;
  if (upper.includes("ADHESIVE") || upper.includes("GLUE")) return 12;
  if (upper.includes("MATTING") || upper.includes("LEVEL")) return 6;
  if (
    upper.includes("AURL GRIGIO") ||
    upper.includes("PAVE") ||
    upper.includes("SALT CONCRETO") ||
    upper.includes("SALTED CONCRETO") ||
    upper.includes("OUTDOOR")
  ) {
    return 18;
  }
  return 15;
};

async function updatePrices() {
  console.log('Fetching products...');
  const { data: products, error } = await supabase.from('products').select('*');
  
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }
  
  console.log(`Found ${products.length} products. Updating prices...`);
  
  let updatedCount = 0;
  for (const product of products) {
    const newPrice = getProductPrice(product.name);
    
    if (product.price !== newPrice) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ price: newPrice, discount_price: null }) // Optionally setting discount_price if needed, but let's just update price
        .eq('id', product.id);
        
      if (updateError) {
        console.error(`Failed to update ${product.name}:`, updateError);
      } else {
        console.log(`Updated ${product.name} to £${newPrice}`);
        updatedCount++;
      }
    }
  }
  
  console.log(`Finished updating ${updatedCount} products.`);
}

updatePrices();
