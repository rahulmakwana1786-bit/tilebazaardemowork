import { supabase } from './config/supabase.js';

async function fetchProducts() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('name, image, category, slug, size')
      .ilike('name', '%alexa%');
    
    if (error) {
      console.error(error.message);
    } else {
      console.log(`Found ${products?.length} alexa products.`);
      console.log(products);
    }
  } catch (e) {
    console.error("Exception:", e);
  }
}

fetchProducts();
