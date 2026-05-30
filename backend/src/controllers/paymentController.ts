import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import * as paypal from '../utils/paypalService.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16' as any,
});
/**
 * Initiates the checkout payment by:
 * 1. Performing server-side validation and calculations on the user's cart.
 * 2. Creating a pending, unpaid local database order.
 * 3. Calling the PayPal REST API to create a PayPal Order.
 * 4. Returning both the local order ID and PayPal Order ID to the client.
 */
export const createPaypalPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { address_line1, address_line2, city, postcode, country = 'United Kingdom', coupon_code } = req.body;

    if (!address_line1 || !city || !postcode) {
      return res.status(400).json({ message: "Address, city, and postcode are required fields." });
    }

    // 1. Fetch user's cart items
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
      return res.status(400).json({ message: "Your cart is empty." });
    }

    // 2. Server-side calculations
    const shipping_cost = 15.00; // Standard UK shipping
    let subtotal = 0;

    const orderItemsToInsert = cartItems.map((item: any) => {
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
    let total_amount = subtotal + vat_amount + shipping_cost;
    
    let discount_amount = 0;
    let final_coupon = null;
    if (coupon_code) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', coupon_code.toUpperCase())
        .eq('active', true)
        .single();
        
      if (coupon) {
        final_coupon = coupon.code;
        if (coupon.type === 'percentage') {
          discount_amount = (subtotal + vat_amount) * (Number(coupon.value) / 100);
        } else if (coupon.type === 'fixed') {
          discount_amount = Number(coupon.value);
        }
        total_amount = Math.max(0, total_amount - discount_amount);
      }
    }

    // 3. Create the pending local order in Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ 
        user_id: userId, 
        total_amount: Number(total_amount.toFixed(2)),
        vat_amount: Number(vat_amount.toFixed(2)),
        shipping_cost,
        discount_amount: Number(discount_amount.toFixed(2)),
        coupon_code: final_coupon,
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

    // 4. Insert items into order_items linked to the new local Order ID
    const finalOrderItems = orderItemsToInsert.map(item => ({
      ...item,
      order_id: order.id
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(finalOrderItems);
    if (itemsError) throw itemsError;

    // 5. Create PayPal Order
    const paypalOrder = await paypal.createPaypalOrder(total_amount, 'GBP');

    res.status(201).json({
      message: 'PayPal payment initiated successfully',
      orderId: order.id,
      paypalOrderId: paypalOrder.id,
      total: total_amount
    });

  } catch (err: any) {
    console.error("Create PayPal Payment Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Finalizes the checkout payment by:
 * 1. Calling PayPal REST API to capture the authorized payment.
 * 2. Verifying the payment status is COMPLETED.
 * 3. Updating the local database order status to 'processing' and payment_status to 'paid'.
 * 4. Clearing the user's cart upon successful validation.
 */
export const capturePaypalPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { orderId, paypalOrderId } = req.body;

    if (!orderId || !paypalOrderId) {
      return res.status(400).json({ message: "Both orderId and paypalOrderId are required." });
    }

    // 1. Fetch the local order to compare totals
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ message: "Local order not found." });
    }

    if (order.user_id !== userId) {
      return res.status(403).json({ message: "Unauthorized payment capture." });
    }

    // 2. Capture the PayPal payment
    const captureData = await paypal.capturePaypalOrder(paypalOrderId);
    
    // 3. Verify PayPal status
    const status = captureData.status;
    if (status !== 'COMPLETED') {
      return res.status(400).json({ 
        message: `PayPal transaction was not completed. Status: ${status}` 
      });
    }

    // 4. Verify transaction details (check currency and amount)
    const purchaseUnit = captureData.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];
    const capturedAmount = Number(capture?.amount?.value) || 0;
    const capturedCurrency = capture?.amount?.currency_code;

    // Soft validation on amount to protect against rounding discrepancies
    if (Math.abs(capturedAmount - order.total_amount) > 0.05 || capturedCurrency !== 'GBP') {
      return res.status(400).json({ 
        message: `Payment amount or currency mismatch. Expected £${order.total_amount} GBP, captured ${capturedCurrency} ${capturedAmount}`
      });
    }

    // 5. Update local database order to mark as paid
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing'
      })
      .eq('id', orderId);

    if (updateError) throw updateError;

    // 5.5 Decrement inventory stock for purchased products
    try {
      const { data: orderItems, error: itemsFetchError } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId);

      if (!itemsFetchError && orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
          const { data: productData } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single();
          
          if (productData) {
            const newStock = Math.max(0, (productData.stock || 0) - item.quantity);
            await supabase
              .from('products')
              .update({ stock: newStock })
              .eq('id', item.product_id);
          }
        }
      }
    } catch (stockErr) {
      console.error("Failed to decrement stock:", stockErr);
    }

    // 6. Clear user's cart now that payment is confirmed
    await supabase.from('cart_items').delete().eq('user_id', userId);

    res.status(200).json({
      message: 'Payment successfully captured and verified',
      orderId,
      paypalOrderId,
      captureId: capture?.id
    });

  } catch (err: any) {
    console.error("Capture PayPal Payment Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const createStripePaymentIntent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { address_line1, address_line2, city, postcode, country = 'United Kingdom', coupon_code } = req.body;

    if (!address_line1 || !city || !postcode) {
      return res.status(400).json({ message: "Address, city, and postcode are required fields." });
    }

    // 1. Fetch user's cart items
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
      return res.status(400).json({ message: "Your cart is empty." });
    }

    // 2. Server-side calculations
    const shipping_cost = 15.00; // Standard UK shipping
    let subtotal = 0;

    const orderItemsToInsert = cartItems.map((item: any) => {
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
    let total_amount = subtotal + vat_amount + shipping_cost;
    
    let discount_amount = 0;
    let final_coupon = null;
    if (coupon_code) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', coupon_code.toUpperCase())
        .eq('active', true)
        .single();
        
      if (coupon) {
        final_coupon = coupon.code;
        if (coupon.type === 'percentage') {
          discount_amount = (subtotal + vat_amount) * (Number(coupon.value) / 100);
        } else if (coupon.type === 'fixed') {
          discount_amount = Number(coupon.value);
        }
        total_amount = Math.max(0, total_amount - discount_amount);
      }
    }

    // 3. Create the pending local order in Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ 
        user_id: userId, 
        total_amount: Number(total_amount.toFixed(2)),
        vat_amount: Number(vat_amount.toFixed(2)),
        shipping_cost,
        discount_amount: Number(discount_amount.toFixed(2)),
        coupon_code: final_coupon,
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

    // 4. Insert items into order_items linked to the new local Order ID
    const finalOrderItems = orderItemsToInsert.map(item => ({
      ...item,
      order_id: order.id
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(finalOrderItems);
    if (itemsError) throw itemsError;

    // 5. Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total_amount * 100), // Stripe expects amount in pence/cents
      currency: 'gbp',
      metadata: {
        order_id: order.id,
        user_id: userId
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(201).json({
      message: 'Stripe payment intent created successfully',
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      total: total_amount
    });

  } catch (err: any) {
    console.error("Create Stripe Payment Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
