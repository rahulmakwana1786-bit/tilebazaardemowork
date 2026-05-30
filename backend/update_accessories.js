import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const newAccessories = [
  {
    name: "Validus Altus",
    slug: "validus-altus-adhesive",
    image: "validus-altus--adhesive.png",
    category: "Accessories",
    price: 12,
    stock: 100,
    is_active: true,
    finish: "", size: "", material: "", thickness: "", description: ""
  },
  {
    name: "Validus Relo",
    slug: "validus-relo-adhesive",
    image: "validus-relo--adhesive.png",
    category: "Accessories",
    price: 12,
    stock: 100,
    is_active: true,
    finish: "", size: "", material: "", thickness: "", description: ""
  },
  {
    name: "Validus Structa",
    slug: "validus-structa-adhesive",
    image: "validus-structa--adhesive.png",
    category: "Accessories",
    price: 12,
    stock: 100,
    is_active: true,
    finish: "", size: "", material: "", thickness: "", description: ""
  },
  {
    name: "dura",
    slug: "dura-matting",
    image: "dura--MATTING.png",
    category: "Accessories",
    price: 6,
    stock: 100,
    is_active: true,
    finish: "", size: "", material: "", thickness: "", description: ""
  },
  {
    name: "the popular front",
    slug: "the-popular-front-spacer",
    image: "the-popular-front--spacer.png",
    category: "Accessories",
    price: 6,
    stock: 100,
    is_active: true,
    finish: "", size: "", material: "", thickness: "", description: ""
  },
  {
    name: "tile leveler",
    slug: "tile-leveler-spacer",
    image: "tile-leveler--spacer.png",
    category: "Accessories",
    price: 6,
    stock: 100,
    is_active: true,
    finish: "", size: "", material: "", thickness: "", description: ""
  },
  {
    name: "10mm Straight Edge Aluminium Basalt Effect Tile Trim - 2.5m",
    slug: "tile-trim",
    image: "public/images/accessories/trim/tile-trim.png",
    category: "Accessories",
    price: 8,
    stock: 100,
    is_active: true,
    finish: "", size: "", material: "", thickness: "", description: ""
  }
];

async function updateAccessories() {
  console.log("Removing EXP-GLO-161-LT-R1.JPG...");
  const { data: expProducts } = await supabase.from('products').select('id').ilike('image', '%EXP-GLO-161-LT-R1.JPG%');
  if (expProducts && expProducts.length > 0) {
    const ids = expProducts.map(p => p.id);
    await supabase.from('order_items').delete().in('product_id', ids);
    const { error: err1 } = await supabase.from('products').delete().in('id', ids);
    if (err1) console.error("Error deleting EXP-GLO:", err1);
    else console.log("Deleted EXP-GLO-161-LT-R1.JPG.");
  }

  console.log("Removing existing accessories...");
  const { data: accProducts } = await supabase.from('products').select('id').in('category', ['Accessories', 'Accessory', 'accessories', 'accessory']);
  if (accProducts && accProducts.length > 0) {
    const ids = accProducts.map(p => p.id);
    await supabase.from('order_items').delete().in('product_id', ids);
    const { error: err2 } = await supabase.from('products').delete().in('id', ids);
    if (err2) console.error("Error deleting accessories:", err2);
    else console.log("Deleted old accessories.");
  }

  console.log("Inserting new accessories...");
  for (const acc of newAccessories) {
    const { error: err3 } = await supabase.from('products').insert(acc);
    if (err3) {
      console.error(`Error inserting ${acc.name}:`, err3);
    } else {
      console.log(`Inserted ${acc.name}`);
    }
  }

  console.log("Done!");
}

updateAccessories();
