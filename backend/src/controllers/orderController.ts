import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    // We only take address from body; we calculate amounts on the server for security
    const { address_line1, address_line2, city, postcode, country = 'United Kingdom' } = req.body;

    // 1. Get current cart items with product snapshots (name, image, price)
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        quantity,
        unit,
        product_id,
        products (name, image, price, discount_price)
      `)
      .eq('user_id', userId);

    if (cartError || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 2. Server-side Calculation logic
    const shipping_cost = 15.00; // Standard UK shipping
    let subtotal = 0;

    const orderItemsToInsert = cartItems.map((item: any) => {
      // Handle the Supabase join structure safely
      const product = Array.isArray(item.products) ? item.products[0] : item.products;
      const basePrice = Number(product?.price) || 0;
      const discountPrice = Number(product?.discount_price) || 0;
      const unitPrice = (discountPrice > 0 && discountPrice < basePrice) 
        ? discountPrice 
        : basePrice;
      subtotal += unitPrice * item.quantity;

      return {
        product_id: item.product_id,
        product_name: product?.name || 'Unknown Product',
        product_image: product?.image || '',
        quantity: item.quantity,
        unit: item.unit || 'sqm',
        price_at_purchase: unitPrice
      };
    });

    const vat_amount = subtotal * 0.20; // 20% VAT
    const total_amount = subtotal + vat_amount + shipping_cost;

    // 3. Create the main order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ 
        user_id: userId, 
        total_amount: Number(total_amount.toFixed(2)),
        vat_amount: Number(vat_amount.toFixed(2)),
        shipping_cost,
        currency: 'GBP',
        address_line1,
        address_line2,
        city,
        postcode,
        country,
        status: 'pending',
        payment_status: 'unpaid'
      }])
      .select().single();

    if (orderError) throw orderError;

    // 4. Move items to order_items with the Order ID
    const finalOrderItems = orderItemsToInsert.map(item => ({
      ...item,
      order_id: order.id
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(finalOrderItems);
    if (itemsError) throw itemsError;

    // 5. Clear the user's cart
    await supabase.from('cart_items').delete().eq('user_id', userId);

    res.status(201).json({ 
      message: 'Order placed successfully', 
      orderId: order.id,
      total: total_amount 
    });

  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Get all orders for the logged-in user


export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) return res.status(404).json({ message: "Order not found" });

    // Ensure user owns the order or is admin
    if ((req as any).user.role !== 'admin' && data.user_id !== userId) {
        return res.status(403).json({ message: "Unauthorized access" });
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};


export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        total_amount,
        status,
        order_items (
          id,
          product_id,
          quantity,
          unit_price,
          products (name, image_url)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ orders: data });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products (
            category,
            size
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data || []);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};