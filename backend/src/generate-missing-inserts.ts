import { supabase } from './config/supabase.js';

async function main() {
  const missingFiles = [
    { file: "ARMANI GRIS R1--GLOSS.jpg", cleanName: "armani gris r1" },
    { file: "ARMANI IVORY R1--GLOSS.jpg", cleanName: "armani ivory r1" },
    { file: "ARTE FLUO GREY_R1--CARVING.jpg", cleanName: "arte fluo grey r1" },
    { file: "ARTE FLUO WHITE_1--CARVING.jpg", cleanName: "arte fluo white 1" },
    { file: "EL-BLUE BELL DARK--GLOSS.jpg", cleanName: "el blue bell dark" },
    { file: "EL-BLUE BELL LIGHT--GLOSS.jpg", cleanName: "el blue bell light" },
    { file: "EL-GLITTER AQUA--GLOSS.jpg", cleanName: "el glitter aqua" },
    { file: "EL-SMOG GOLD_1--CARVING.jpg", cleanName: "el smog gold 1" },
    { file: "EL-SMOG GRIS_1--CARVING.jpg", cleanName: "el smog gris 1" },
    { file: "EL-STATUARIO FANTASTICO R1--GLOSS.jpg", cleanName: "el statuario fantastico r1" },
    { file: "EL-STATUARIO PRIME-R1--GLOSS.jpg", cleanName: "el statuario prime r1" },
    { file: "MEGLOW WHITE R1--CARVING.jpg", cleanName: "meglow white r1" },
    { file: "PHANTOM DECOR--LOVIN.jpg", cleanName: "phantom decor" },
    { file: "PHANTOM ONYX WHITE R1--LOVIN.jpg", cleanName: "phantom onyx white r1" },
    { file: "STANZA GREY R1--CARVING.jpg", cleanName: "stanza grey r1" },
    { file: "STANZA SILVER R1--CARVING.jpg", cleanName: "stanza silver r1" }
  ];

  const { data: allProducts, error } = await supabase.from('products').select('*');
  if (error) {
    console.error("Error querying products:", error);
    return;
  }

  const proposedInserts = [];

  for (const item of missingFiles) {
    // Find the 600x1200 counterpart in Supabase
    const counterpart = allProducts.find(p => {
      const pName = p.name.toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
      return pName === item.cleanName && (p.size === '600x1200' || p.size === '600X1200');
    });

    if (counterpart) {
      proposedInserts.push({
        name: counterpart.name,
        slug: counterpart.slug.replace('600x1200', '600x600').replace('600X1200', '600x600'),
        description: counterpart.description,
        price: counterpart.price,
        discount_price: counterpart.discount_price,
        stock: counterpart.stock,
        category: counterpart.category,
        finish: counterpart.finish,
        size: '600X600',
        thickness: counterpart.thickness,
        material: counterpart.material,
        image: item.file,
        is_active: true
      });
    } else {
      proposedInserts.push({
        name: item.cleanName.toUpperCase(),
        slug: `${item.cleanName.replace(/ /g, '-')}-600x600`,
        description: 'Premium quality tile.',
        price: 20,
        discount_price: 15,
        stock: 500,
        category: 'Tiles',
        finish: 'Matt',
        size: '600X600',
        thickness: '9mm',
        material: 'Porcelain',
        image: item.file,
        is_active: true
      });
    }
  }

  console.log(JSON.stringify(proposedInserts, null, 2));
}

main();
