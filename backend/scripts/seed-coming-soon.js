import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const new1200Tiles = [
  { name: 'CREMA MARFIL NEO 01', image: 'CREMA MARFIL NEO_01.jpg.jpg' },
  { name: 'CREMA MARFIL NEO 02', image: 'CREMA MARFIL NEO_02.jpg.jpg' },
  { name: 'CREMA MARFIL NEO 03', image: 'CREMA MARFIL NEO_03.jpg.jpg' },
  { name: 'MARBLE CARRARA 01', image: 'MARBLE CARRARA-01.jpg.jpg' },
  { name: 'MARBLE CARRARA 02', image: 'MARBLE CARRARA-02.jpg.jpg' },
  { name: 'MARBLE CARRARA 03', image: 'MARBLE CARRARA-03.jpg.jpg' },
  { name: 'MARBLE CARRARA 04', image: 'MARBLE CARRARA-04.jpg.jpg' },
  { name: 'MARBLE CARRARA 05', image: 'MARBLE CARRARA-05.jpg.jpg' },
  { name: 'MARBLE CARRARA 06', image: 'MARBLE CARRARA-06.jpg.jpg' },
  { name: 'OK 2', image: 'Ok (2).jpg' },
  { name: 'OK 3', image: 'Ok (3).jpg' },
  { name: 'OK', image: 'Ok.jpg' },
  { name: 'ORIOL AQUA 01', image: 'ORIOL AQUA_01.jpg.jpg' },
  { name: 'ORIOL AQUA 02', image: 'ORIOL AQUA_02.jpg.jpg' },
  { name: 'ORIOL AQUA 03', image: 'ORIOL AQUA_03.jpg.jpg' },
  { name: 'PASSION PULPIS BIANCO 01', image: 'PASSION PULPIS BIANCO_01.jpg.jpg' },
  { name: 'PASSION PULPIS BIANCO 02', image: 'PASSION PULPIS BIANCO_02.jpg.jpg' },
  { name: 'PASSION PULPIS BIANCO 03', image: 'PASSION PULPIS BIANCO_03.jpg.jpg' },
  { name: 'SERENA 2', image: 'SERENA (2).jpg' },
  { name: 'SERENA 3', image: 'SERENA (3).jpg' },
  { name: 'SERENA 4', image: 'SERENA (4).jpg' },
  { name: 'SERENA', image: 'SERENA.jpg' },
  { name: 'SNOW WHITE 01', image: 'SNOW WHITE_01.jpg.jpg' },
  { name: 'SNOW WHITE 02', image: 'SNOW WHITE_02.jpg.jpg' },
  { name: 'SNOW WHITE 03', image: 'SNOW WHITE_03.jpg.jpg' },
  { name: 'SNOW WHITE 04', image: 'SNOW WHITE_04.jpg.jpg' },
  { name: 'SNOW WHITE 05', image: 'SNOW WHITE_05.jpg.jpg' },
  { name: 'SNOW WHITE 06', image: 'SNOW WHITE_06.jpg.jpg' }
];

const existing600Tiles = [
  { name: 'ARIC BIANCA', image: 'ARIC-BIANCA--GLOSSY.jpg', finish: 'GLOSSY' },
  { name: 'BROSS DOVE', image: 'BROSS-DOVE--GLOSSY.jpg', finish: 'GLOSSY' },
  { name: 'NARVEL ASH', image: 'NARVEL-ASH--GLOSSY.jpg', finish: 'GLOSSY' },
  { name: 'NARVEL BIANCO', image: 'NARVEL-BIANCO--GLOSSY.jpg', finish: 'GLOSSY' },
  { name: 'PIETRA BIANCO', image: 'PIETRA-BIANCO--GLOSSY.jpg', finish: 'GLOSSY' }
];

const productsToUpsert = [];

// Helper to generate slugs
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// 1. Process 1200x1200px tiles
for (const item of new1200Tiles) {
  const slug = `${slugify(item.name)}-1200x1200`;
  productsToUpsert.push({
    name: item.name,
    slug: slug,
    description: 'Premium quality 1200x1200mm tile, coming soon.',
    price: 0,
    discount_price: null,
    stock: 0,
    category: 'Coming Soon',
    finish: '',
    size: '1200X1200',
    thickness: '9mm',
    material: 'Porcelain',
    image: item.image,
    is_active: true,
    is_coming_soon: true,
    is_out_of_stock: false
  });
}

// 2. Process 600x1200px tiles
for (const item of existing600Tiles) {
  const slug = `${slugify(item.name)}-600x1200`;
  productsToUpsert.push({
    name: item.name,
    slug: slug,
    description: 'Premium quality 600x1200mm tile, coming soon.',
    price: 0,
    discount_price: null,
    stock: 0,
    category: 'Coming Soon',
    finish: item.finish,
    size: '600X1200',
    thickness: '9mm',
    material: 'Porcelain',
    image: item.image,
    is_active: true,
    is_coming_soon: true,
    is_out_of_stock: false
  });
}

async function seed() {
  console.log(`Upserting ${productsToUpsert.length} coming-soon products to Supabase...`);
  const { data, error } = await supabase
    .from('products')
    .upsert(productsToUpsert, { onConflict: 'slug' });

  if (error) {
    console.error('Error upserting products:', error);
    process.exit(1);
  } else {
    console.log('Successfully seeded coming-soon products!');
    process.exit(0);
  }
}

seed();
