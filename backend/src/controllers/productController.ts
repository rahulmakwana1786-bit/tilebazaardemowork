import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { slugify } from '../utils/slugify.js';
import { cloudinary } from '../config/cloudinary.js';
import { transporter } from '../config/mail.js';

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

    // --- SEND PROMOTIONAL EMAIL TO ALL USERS ---
    try {
      // Get all user emails
      const { data: users } = await supabase.from('users').select('email, full_name');
      
      if (users && users.length > 0) {
        const productUrl = `${process.env.FRONTEND_URL}/products/${finalSlug}`;
        const emails: string[] = users.map((u: any) => u.email as string).filter(Boolean);
        
        // Send emails
        await transporter.sendMail({
          from: `"TileBazaar Updates" <${process.env.MAIL_USER}>`,
          bcc: emails, // Use BCC to hide other users' emails
          subject: 'New Arrival at TileBazaar! 🎉',
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4a2c2a;">Check out our latest addition!</h2>
              <h3>${name}</h3>
              <p>We just added this beautiful new tile to our collection.</p>
              
              <div style="text-align: center; margin: 20px 0;">
                <img src="${imageUrl}" alt="${name}" style="max-width: 100%; height: auto; border-radius: 8px;" />
              </div>
              
              <div style="background-color: #fbfbfb; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                <p><strong>Size:</strong> ${size || 'N/A'}</p>
                <p><strong>Finish:</strong> ${finish || 'N/A'}</p>
                <p><strong>Price:</strong> £${basePrice.toFixed(2)}</p>
                ${discountPrice ? `<p><strong>Special Offer:</strong> <span style="color: green; font-weight: bold;">£${discountPrice.toFixed(2)}</span></p>` : ''}
              </div>
              
              <div style="text-align: center;">
                <a href="${productUrl}" style="display: inline-block; background-color: #4a2c2a; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">View Product</a>
              </div>
            </div>
          `
        });
        console.log(`Promotional email sent to ${emails.length} users.`);
      }
    } catch (mailError) {
      console.error("Failed to send promotional email:", mailError);
    }

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

// GET product by slug (Public)
export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};