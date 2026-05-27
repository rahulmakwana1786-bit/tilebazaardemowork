import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { slugify } from '../utils/slugify.js';
import { cloudinary } from '../config/cloudinary.js';

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, discount_price, stock, category, finish, size, thickness, material } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    // const parsedFinish = typeof finish === 'string' ? JSON.parse(finish) : finish;
    // const parsedCategory = typeof category === 'string' ? JSON.parse(category) : category;

    // 2. Generate a Composite Slug
    // We use the first finish and the size to make the slug unique
    // const primaryFinish = Array.isArray(parsedFinish) ? parsedFinish[0] : parsedFinish;
    const slugBase = `${name} ${finish || ''} ${size || ''}`;
    let finalSlug = slugify(slugBase);

    // 3. Optional: Check for exact duplicates in Supabase
    const { data: existingProduct } = await supabase
      .from('products')
      .select('slug')
      .eq('slug', finalSlug)
      .maybeSingle();

    if (existingProduct) {
      // If by some miracle name+finish+size is identical, add a random suffix
      finalSlug = `${finalSlug}-${Math.random().toString(36).substring(7)}`;
    }

    // --- UPLOAD TO CLOUDINARY FROM BUFFER ---
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'tilebazaar/products' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result?.secure_url);
          }
        );
        stream.end(req.file!.buffer); // Pass the buffer from memory
      });
    };

    const imageUrl = await uploadToCloudinary() as string;
    
    const basePrice = parseFloat(price);
    // Only parse discount if it's a non-empty string/number, otherwise set to null
    const discountPrice = (discount_price && discount_price !== "") ? parseFloat(discount_price) : null;
    
    // --- SAVE TO SUPABASE ---
    const { data, error } = await supabase
      .from('products')
      .insert([{ 
        name, slug: finalSlug, description, price: basePrice, discount_price: discountPrice, 
        stock: parseInt(stock), 
        category, finish, size, thickness, material, 
        image: imageUrl 
      }])
      .select().single();

    if (error) throw error;

    res.status(201).json({ message: 'Product created successfully', product: data });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// GET all products (Public)
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};