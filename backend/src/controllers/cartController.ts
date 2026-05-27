import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

const getFinish = (fileName: string) => {
  const name = fileName.toUpperCase();
  if (name.includes("--GLOSS")) return "GLOSSY";
  if (name.includes("--MATT")) return "MATT";
  if (name.includes("--CARVING")) return "CARVING";
  if (name.includes("--HIGHGL")) return "HIGH GLOSS";
  if (name.includes("--PUNCHGL")) return "PUNCH GLOSSY";
  if (name.includes("--LOVIN")) return "LOVELIN";
  if (name.includes("--TPH")) return "TYPHOON";
  return "OTHER";
};

const getProductDetails = (fileName: string) => {
  const upper = fileName.toUpperCase();
  if (upper.includes("TRIM")) return { price: 8 };
  if (upper.includes("SPACER")) return { price: 6 };
  if (upper.includes("WEDGE")) return { price: 6 };
  if (upper.includes("ADHESIVE") || upper.includes("GLUE")) return { price: 12 };
  if (upper.includes("MATTING") || upper.includes("LEVEL")) return { price: 6 };
  return { price: 15 };
};

const getCategory = (fileName: string) => {
  const upper = fileName.toUpperCase();
  if (
    upper.includes("TRIM") ||
    upper.includes("SPACER") ||
    upper.includes("WEDGE") ||
    upper.includes("ADHESIVE") ||
    upper.includes("GLUE") ||
    upper.includes("MATTING") ||
    upper.includes("LEVEL")
  )
    return "accessories";
  if (upper.includes("OUTDOOR")) return "Outdoor";
  if (upper.includes("DECOR") || upper.includes("POSTER")) return "Decorative";
  return "Tiles";
};

// 1. Add or Update Item in Cart
export const addToCart = async (req: Request, res: Response) => {
  try {
    const { product_id, quantity, unit = 'sqm' } = req.body;
    const user_id = (req as any).user.id;

    let finalProductId = product_id;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product_id);
    if (!isUUID) {
      // Clean filename
      const cleanFileName = product_id.split('/').pop() || product_id;
      
      const { data: product } = await supabase
        .from('products')
        .select('id')
        .ilike('image', `%${cleanFileName}%`)
        .limit(1)
        .maybeSingle();

      if (product) {
        finalProductId = product.id;
      } else {
        // Fallback: search by name
        const displayName = cleanFileName
          .split("--")[0]
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        const { data: productByName } = await supabase
          .from('products')
          .select('id')
          .ilike('name', `%${displayName}%`)
          .limit(1)
          .maybeSingle();

        if (productByName) {
          finalProductId = productByName.id;
        } else {
          // Register the product on the fly!
          const category = getCategory(cleanFileName);
          const size = cleanFileName.toUpperCase().includes("600X1200") ? "600X1200" : (cleanFileName.toUpperCase().includes("600X600") ? "600X600" : "600X600");
          const finish = getFinish(cleanFileName);
          const details = getProductDetails(cleanFileName);
          
          const { data: newProduct, error: insertError } = await supabase
            .from('products')
            .insert([{
              name: displayName,
              slug: cleanFileName.toLowerCase(),
              description: 'Premium quality tile/accessory.',
              price: details.price,
              discount_price: 0, // No discount for fallback products
              stock: 1000,
              category: category,
              finish: finish,
              size: size,
              thickness: '9mm',
              material: 'Porcelain',
              image: cleanFileName,
              is_active: true
            }])
            .select().single();
            
          if (insertError) throw insertError;
          finalProductId = newProduct.id;
        }
      }
    }

    // 1. Check if the item exists
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user_id)
      .eq('product_id', finalProductId)
      .maybeSingle();

    let result;
    if (existingItem) {
      // 2. Update existing
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select().single();
      if (error) throw error;
      result = data;
    } else {
      // 3. Insert new
      const { data, error } = await supabase
        .from('cart_items')
        .insert({ user_id, product_id: finalProductId, quantity, unit })
        .select().single();
      if (error) throw error;
      result = data;
    }

    res.status(200).json({ message: 'Cart updated', item: result });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Get User's Cart with Product Details
export const getMyCart = async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).user.id;

    // Fetching with product details
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        unit,
        product:products (
          id,
          name,
          price,
          discount_price,
          image,
          size
        )
      `)
      .eq('user_id', user_id);

    if (error) throw error;

    // Calculate Cart Total on the fly for the frontend
    const cartTotal = data?.reduce((acc, item: any) => {
      const p = item.product;
      const basePrice = Number(p?.price) || 0;
      const discountPrice = Number(p?.discount_price) || 0;
      const price = (discountPrice > 0 && discountPrice < basePrice)
        ? discountPrice
        : basePrice;
      return acc + (price * item.quantity);
    }, 0);

    res.status(200).json({
      items: data,
      cartTotal: Number(cartTotal.toFixed(2)),
      vatEstimate: Number((cartTotal * 0.20).toFixed(2))
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Remove Item from Cart
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Cart Item ID
    const user_id = (req as any).user.id;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id); // Security: Ensure they own the cart item

    if (error) throw error;
    res.status(200).json({ message: 'Item removed' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// 4. Update Quantity (Direct Update)
export const updateCartQuantity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // The cart item UUID
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    res.status(200).json({ message: 'Quantity updated', item: data });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};