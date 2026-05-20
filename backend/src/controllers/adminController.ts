import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { slugify } from '../utils/slugify.js';
import { cloudinary } from '../config/cloudinary.js';

// 1. DASHBOARD STATS (Overview)
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { data: orders } = await supabase.from('orders').select('total_amount, status');
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });

    const totalRevenue = orders?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;
    const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;

    res.json({
      totalRevenue,
      totalOrders: orders?.length || 0,
      pendingOrders,
      totalUsers: userCount,
      totalProducts: productCount
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// 2. MANAGE ALL ORDERS
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`*, user:users(full_name, email), order_items(*, products(*))`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// 3. UPDATE ORDER STATUS (e.g., mark as Shipped or Delivered)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    // 1. Perform the update
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status, payment_status })
      .eq('id', id);

    if (updateError) throw updateError;

    // 2. Re-fetch the order WITH the joined user data
    const { data: updatedOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *, 
        user:users(full_name, email), 
        order_items(*, products(*))
      `)
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    res.json({ message: 'Order updated', order: updatedOrder });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// 4. MANAGE USERS
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // We select user details and use a subquery/join to count orders
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, 
        full_name, 
        email, 
        role, 
        phone_number, 
        created_at,
        orders:orders(count),
        total_orders:orders(total_amount)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Optional: Transform data to include a simplified "orderCount" 
    // and "totalSpend" for the frontend
    const usersWithStats = data.map((user: any) => ({
      ...user,
      order_count: user.orders?.[0]?.count || 0,
      total_spend: user.total_orders?.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0) || 0
    }));

    res.json(usersWithStats);
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

// 5. GET SINGLE USER BY ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        orders:orders(
          id,
          total_amount,
          status,
          created_at,
          payment_status
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(data);
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};



// --- PRODUCT MANAGEMENT ---
// Get All Products for admin
export const adminGetProducts = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false }); // Fetches everything: active and inactive

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// 1. Add New Product
export const addProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, discount_price, stock, category, finish, size, thickness, material, is_active } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    const slugBase = `${name} ${finish || ''} ${size || ''}`;
    let uniqueSlug = slugify(slugBase);

    // 3. Collision Check: Verify if slug already exists in Supabase
    const { data: existing } = await supabase
      .from('products')
      .select('slug')
      .eq('slug', uniqueSlug)
      .maybeSingle();

    if (existing) {
      // If name+finish+size is still not unique, append a short random string
      uniqueSlug = `${uniqueSlug}-${Math.random().toString(36).substring(7)}`;
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
        stream.end(req.file!.buffer);
      });
    };

    const imageUrl = await uploadToCloudinary() as string;
    const basePrice = parseFloat(price);
    // If discount_price is an empty string or undefined, save as null
    const discountPrice = (discount_price && discount_price !== "") 
      ? parseFloat(discount_price) 
      : null;

    // --- SAVE TO SUPABASE ---
    const { data, error } = await supabase
      .from('products')
      .insert([{ 
        name, 
        slug: uniqueSlug, // Save the unique composite slug
        description, 
        price: basePrice, 
        discount_price: discountPrice,
        stock: parseInt(stock), 
        category,
        finish,
        size, 
        thickness, 
        material,
        is_active: is_active === 'true' || is_active === true,
        image: imageUrl 
      }])
      .select().single();

    if (error) throw error;

    res.status(201).json({ message: 'Product created successfully', product: data });
  } catch (err: any) {
    console.error("Add Product Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// 2. Update Product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let updates = { ...req.body };

    // 1. Process File Upload if provided
    if (req.file) {
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'tilebazaar/products' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result?.secure_url);
            }
          );
          stream.end(req.file!.buffer);
        });
      };

      const imageUrl = await uploadToCloudinary() as string;
      updates.image = imageUrl;
    }

    // 2. Regenerate Composite Slug 
    // We update the slug if the name, finish, or size changes to keep it unique
    if (updates.name || updates.finish || updates.size) {
      // Fetch existing data to fill in the blanks for the composite slug
      const { data: current } = await supabase
        .from('products')
        .select('name, finish, size')
        .eq('id', id)
        .single();

      if (current) {
        // Use new updates if they exist, otherwise fall back to current DB values
        const name = updates.name || current.name;
        const finish = updates.finish || current.finish;
        const size = updates.size || current.size;

        // Since finish is now a string, we join directly
        const slugBase = `${name} ${finish || ''} ${size || ''}`;
        let newSlug = slugify(slugBase);

        // Collision Check: Ensure no other product already has this slug
        const { data: existing } = await supabase
          .from('products')
          .select('id')
          .eq('slug', newSlug)
          .neq('id', id) // Exclude the current product
          .maybeSingle();

        if (existing) {
          newSlug = `${newSlug}-${Math.random().toString(36).substring(7)}`;
        }

        updates.slug = newSlug;
      }
    }

    // 3. Perform update in Supabase
    // price and stock are parsed just in case they come as strings from FormData
    if (updates.price) updates.price = parseFloat(updates.price);
    if (Object.prototype.hasOwnProperty.call(updates, 'discount_price')) {
      updates.discount_price = (updates.discount_price && updates.discount_price !== "") 
        ? parseFloat(updates.discount_price) 
        : null;
    }

    if (updates.stock) updates.stock = parseInt(updates.stock);
    if (Object.prototype.hasOwnProperty.call(updates, 'is_active')) {
      updates.is_active = updates.is_active === 'true' || updates.is_active === true;
    }

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Product updated successfully', product: data });
  } catch (err: any) {
    console.error("Update Product Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE PRODUCT BY ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single(); // .single() ensures we get an object, not an array

    if (error) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Delete Product (Soft delete or hard delete)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 1. Fetch the product first to get the image URL
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('image')
      .eq('id', id)
      .single();

    if (fetchError || !product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 2. Delete the image from Cloudinary if it exists
    if (product.image) {
      try {
        // Extract public_id from URL: "https://res.cloudinary.com/demo/image/upload/v1234/folder/sample.jpg"
        // We need "folder/sample"
        const urlParts = product.image.split('/');
        const fileNameWithExtension = urlParts[urlParts.length - 1]; // "sample.jpg"
        const publicId = fileNameWithExtension.split('.')[0]; 
        
        // If you are using folders, you might need a more robust extraction:
        // const publicId = product.image.split('/').slice(-2).join('/').split('.')[0];

        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryErr) {
        console.error('Cloudinary deletion failed:', cloudinaryErr);
        // We continue anyway so the DB record is still deleted
      }
    }

    // 3. Delete the record from Supabase
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    res.json({ message: 'Product and associated image deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// --- ADVANCED ORDER MANAGEMENT ---

// 4. Get Single Order Details (For Order Detail Page)
export const adminGetOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:users(full_name, email, phone_number),
        items:order_items(
          *,
          product:products(
            id,
            name,
            image,
            price,
            size,
            finish,
            thickness,
            material,
            discount_price,
            category
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (!data) {
        return res.status(404).json({ message: "Order not found" });
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
