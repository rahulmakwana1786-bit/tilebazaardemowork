import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { slugify } from '../utils/slugify.js';
import { cloudinary } from '../config/cloudinary.js';
import fs from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';
import { logAdminAction, updateAdminStatus } from '../utils/adminLogger.js';

// 1. DASHBOARD STATS (Overview)
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { data: orders } = await supabase.from('orders').select('total_amount, status');
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });

    const totalRevenue = orders?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;
    const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
    const shippedOrders = orders?.filter(o => o.status === 'shipped' || o.status === 'delivered').length || 0;

    res.json({
      totalRevenue,
      totalOrders: orders?.length || 0,
      pendingOrders,
      shippedOrders,
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

    // Log admin action
    if ((req as any).user) {
      await logAdminAction(
        (req as any).user.email,
        (req as any).user.full_name || 'Admin',
        'UPDATE_ORDER_STATUS',
        `Updated order ID: ${id} status to: ${status}`,
        '/admin/orders'
      );
    }

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
    const { name, description, price, discount_price, stock, category, finish, size, thickness, material, is_active, is_coming_soon, is_out_of_stock } = req.body;

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
    
    const isComingSoon = is_coming_soon === 'true' || is_coming_soon === true;
    const isOutOfStock = is_out_of_stock === 'true' || is_out_of_stock === true;

    const basePrice = isComingSoon ? 0 : parseFloat(price);
    const discountPrice = isComingSoon 
      ? null 
      : ((discount_price && discount_price !== "") ? parseFloat(discount_price) : null);
    const productStock = (isComingSoon || isOutOfStock) ? 0 : parseInt(stock);

    // --- SAVE TO SUPABASE ---
    const { data, error } = await supabase
      .from('products')
      .insert([{ 
        name, 
        slug: uniqueSlug, // Save the unique composite slug
        description, 
        price: basePrice, 
        discount_price: discountPrice,
        stock: productStock, 
        category,
        finish,
        size, 
        thickness, 
        material,
        is_active: is_active === 'true' || is_active === true,
        is_coming_soon: isComingSoon,
        is_out_of_stock: isOutOfStock,
        image: imageUrl 
      }])
      .select().single();

    if (error) throw error;

    // Log admin action
    if ((req as any).user) {
      await logAdminAction(
        (req as any).user.email,
        (req as any).user.full_name || 'Admin',
        'ADD_PRODUCT',
        `Registered product: ${name} (ID: ${data.id})`,
        '/admin/products'
      );
    }

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
    if (Object.prototype.hasOwnProperty.call(updates, 'is_active')) {
      updates.is_active = updates.is_active === 'true' || updates.is_active === true;
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'is_coming_soon')) {
      updates.is_coming_soon = updates.is_coming_soon === 'true' || updates.is_coming_soon === true;
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'is_out_of_stock')) {
      updates.is_out_of_stock = updates.is_out_of_stock === 'true' || updates.is_out_of_stock === true;
    }

    if (updates.is_coming_soon) {
      updates.price = 0;
      updates.discount_price = null;
      updates.stock = 0;
    } else {
      if (updates.price !== undefined && updates.price !== null && updates.price !== '') {
        updates.price = parseFloat(updates.price);
      }
      if (Object.prototype.hasOwnProperty.call(updates, 'discount_price')) {
        updates.discount_price = (updates.discount_price && updates.discount_price !== "") 
          ? parseFloat(updates.discount_price) 
          : null;
      }
      if (updates.is_out_of_stock) {
        updates.stock = 0;
      } else if (updates.stock !== undefined && updates.stock !== null && updates.stock !== '') {
        updates.stock = parseInt(updates.stock);
      }
    }

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log admin action
    if ((req as any).user) {
      await logAdminAction(
        (req as any).user.email,
        (req as any).user.full_name || 'Admin',
        'UPDATE_PRODUCT',
        `Updated product: ${data.name} (ID: ${id})`,
        '/admin/products'
      );
    }

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

    // Log admin action
    if ((req as any).user) {
      await logAdminAction(
        (req as any).user.email,
        (req as any).user.full_name || 'Admin',
        'DELETE_PRODUCT',
        `Deleted product ID: ${id}`,
        '/admin/products'
      );
    }

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

// --- MULTI-ADMIN ENDPOINTS ---

export const getAdminAccounts = async (req: Request, res: Response) => {
  try {
    const adminEmails = [
      process.env.ADMIN_EMAIL_1 || 'jane@tilebazaar.co.uk',
      process.env.ADMIN_EMAIL_2 || 'admin2@tilebazaar.co.uk',
      process.env.ADMIN_EMAIL_3 || 'admin3@tilebazaar.co.uk',
      process.env.ADMIN_EMAIL_4 || 'admin4@tilebazaar.co.uk',
      process.env.ADMIN_EMAIL_5 || 'admin5@tilebazaar.co.uk',
    ];
    const adminNames = [
      'Jane Smith',
      'David Thompson',
      'Admin 3',
      'Admin 4',
      'Jane Smith'
    ];

    const STATUS_FILE = path.join(process.cwd(), 'admin_status.json');
    let statusMap: Record<string, any> = {};
    try {
      const data = await fs.readFile(STATUS_FILE, 'utf-8');
      statusMap = JSON.parse(data);
    } catch (e) {
      // Empty status map if not found
    }

    const admins = adminEmails.map((email, index) => {
      const status = statusMap[email] || {
        email,
        is_logged_in: false,
        last_login: null,
        last_logout: null
      };
      return {
        id: `admin-${index + 1}`,
        email,
        full_name: adminNames[index],
        status: status.is_logged_in ? 'Active Now' : 'Offline',
        last_login: status.last_login,
        last_logout: status.last_logout
      };
    });

    res.json(admins);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getAdminLogs = async (req: Request, res: Response) => {
  try {
    const LOGS_FILE = path.join(process.cwd(), 'admin_logs.json');
    let logs: any[] = [];
    try {
      const data = await fs.readFile(LOGS_FILE, 'utf-8');
      logs = JSON.parse(data);
    } catch (e) {
      // Empty logs
    }
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyAdminCredentials = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const adminEmails = [
      process.env.ADMIN_EMAIL_1 || 'jane@tilebazaar.co.uk',
      process.env.ADMIN_EMAIL_2 || 'admin2@tilebazaar.co.uk',
      process.env.ADMIN_EMAIL_3 || 'admin3@tilebazaar.co.uk',
      process.env.ADMIN_EMAIL_4 || 'admin4@tilebazaar.co.uk',
      process.env.ADMIN_EMAIL_5 || 'admin5@tilebazaar.co.uk',
    ];
    const adminPasswords = [
      process.env.ADMIN_PASSWORD_1 || 'securepassword',
      process.env.ADMIN_PASSWORD_2 || 'securepassword2',
      process.env.ADMIN_PASSWORD_3 || 'securepassword3',
      process.env.ADMIN_PASSWORD_4 || 'securepassword4',
      process.env.ADMIN_PASSWORD_5 || 'securepassword5',
    ];
    const adminNames = [
      'Jane Smith',
      'David Thompson',
      'Admin 3',
      'Admin 4',
      'Jane Smith'
    ];

    const adminIndex = adminEmails.findIndex(e => e.toLowerCase() === email.toLowerCase());
    if (adminIndex === -1 || password !== adminPasswords[adminIndex]) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Return the verified admin info with a new token for switching
    const token = jwt.sign(
      { id: `admin-${adminIndex + 1}`, role: 'admin', email: adminEmails[adminIndex], full_name: adminNames[adminIndex] },
      process.env.JWT_SECRET || 'tile_secret_key',
      { expiresIn: '7d' }
    );

    // LOG the account switch action!
    const activeAdminEmail = (req as any).user?.email || 'Unknown Admin';
    const activeAdminName = (req as any).user?.full_name || 'Admin';
    await logAdminAction(activeAdminEmail, activeAdminName, 'SWITCH_ACCOUNT', `Switched session to ${adminNames[adminIndex]} (${adminEmails[adminIndex]})`, '/admin/admins');

    if (activeAdminEmail !== 'Unknown Admin' && activeAdminEmail !== adminEmails[adminIndex]) {
      // Log out the previous admin
      await updateAdminStatus(activeAdminEmail, false);
      await logAdminAction(activeAdminEmail, activeAdminName, 'LOGOUT', 'Logged out of the system (Account Switch)', '/admin/admins');
    }

    // Make sure we mark the new admin as logged in!
    await updateAdminStatus(adminEmails[adminIndex], true);
    
    // Log the LOGIN action for the NEW admin!
    await logAdminAction(adminEmails[adminIndex], adminNames[adminIndex], 'LOGIN', 'Admin authenticated via account switch', '/admin/admins');

    res.json({
      success: true,
      token,
      user: {
        id: `admin-${adminIndex + 1}`,
        email: adminEmails[adminIndex],
        full_name: adminNames[adminIndex],
        role: 'admin'
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
