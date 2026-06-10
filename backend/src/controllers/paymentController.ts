import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import * as paypal from '../utils/paypalService.js';
import Stripe from 'stripe';
import { calculateShippingRateInternal } from './deliveryController.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_123', {
  apiVersion: '2024-04-10' as any,
});

const checkIsAccessory = (product: any): boolean => {
  if (!product) return false;
  const name = (product?.name || "").toUpperCase();
  const category = (product?.category || "").toUpperCase();
  const image = (product?.image || "").toUpperCase();
  return category === "ACCESSORIES" || 
         name.includes("TRIM") || name.includes("SPACER") || name.includes("WEDGE") || name.includes("MATTING") || name.includes("LEVEL") || name.includes("ADHESIVE") || name.includes("GLUE") ||
         image.includes("TRIM") || image.includes("SPACER") || image.includes("WEDGE") || image.includes("MATTING") || image.includes("LEVEL") || image.includes("ADHESIVE") || image.includes("GLUE") ||
         image.includes("/ACCESSORIES/");
};

/**
 * Initiates the checkout payment by:
 * 1. Performing server-side validation and calculations on the user's cart.
 * 2. Creating a pending, unpaid local database order.
 * 3. Calling the PayPal REST API to create a PayPal Order.
 * 4. Returning both the local order ID and PayPal Order ID to the client.
 */
export const createPaypalPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || null;
    const { address_line1, address_line2, city, postcode, country = 'United Kingdom' } = req.body;

    if (!address_line1 || !city || !postcode) {
      return res.status(400).json({ message: "Address, city, and postcode are required fields." });
    }

    // 1. Get cart items (either from DB if logged in, or from body payload if guest)
    let cartItems: any[] = [];
    if (!userId) {
      const bodyCartItems = req.body.cartItems;
      if (!bodyCartItems || !Array.isArray(bodyCartItems) || bodyCartItems.length === 0) {
        return res.status(400).json({ message: "Your cart is empty." });
      }

      const productIds = bodyCartItems.map((item: any) => item.product_id);
      const uuids = productIds.filter((id: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id));
      const filenames = productIds.filter((id: string) => !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id));

      let dbProducts: any[] = [];
      if (uuids.length > 0) {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, image, price, discount_price, category, size')
          .in('id', uuids);
        if (error) console.error("Error fetching by UUID:", error);
        if (data) dbProducts = [...dbProducts, ...data];
      }
      if (filenames.length > 0) {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, image, price, discount_price, category, size')
          .in('image', filenames);
        if (error) console.error("Error fetching by filename:", error);
        if (data) dbProducts = [...dbProducts, ...data];
      }

      if (dbProducts.length === 0) {
        return res.status(400).json({ message: "Failed to retrieve product details." });
      }

      cartItems = bodyCartItems.map((item: any) => {
        const product = dbProducts.find((p: any) => p.id === item.product_id || p.image === item.product_id);
        return {
          quantity: item.quantity,
          unit: item.unit || 'boxes',
          product_id: product ? product.id : item.product_id,
          products: product ? {
            name: product.name,
            image: product.image,
            price: product.price,
            discount_price: product.discount_price,
            category: product.category,
            size: product.size
          } : null
        };
      }).filter((item: any) => item.products !== null);

      if (cartItems.length === 0) {
        return res.status(400).json({ message: "No valid products in cart." });
      }
    } else {
      const { data: dbCartItems, error: cartError } = await supabase
        .from('cart_items')
        .select(`
          quantity,
          unit,
          product_id,
          products (name, image, price, discount_price, category, size)
        `)
        .eq('user_id', userId);

      if (cartError || !dbCartItems || dbCartItems.length === 0) {
        return res.status(400).json({ message: "Your cart is empty." });
      }
      cartItems = dbCartItems;
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

      const isAcc = checkIsAccessory(product);
      let coverage = item.quantity;
      if (!isAcc) {
        const is600x600 = (product?.size || "").toLowerCase().includes("600x600");
        const piecesPerBox = is600x600 ? 4 : 2;
        coverage = item.unit === "pieces"
          ? item.quantity * (1.44 / piecesPerBox)
          : item.quantity * 1.44;
      }
      subtotal += unitPrice * coverage;

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

    // 3. Create the pending local order in Supabase
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
 * 3. Creating/retrieving guest user profile on-the-fly and updating order with the user_id.
 * 4. Updating the local database order status to 'processing' and payment_status to 'paid'.
 * 5. Clearing the user's cart upon successful validation.
 */
export const capturePaypalPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || null;
    const { orderId, paypalOrderId, email, firstName, lastName, phone } = req.body;

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

    if (order.user_id && order.user_id !== userId) {
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

    // 5. Create guest customer profile in Supabase on-the-fly ONLY after successful capture
    let finalUserId = order.user_id || userId;
    if (!finalUserId && email) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        finalUserId = existingUser.id;
      } else {
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{
            email,
            full_name: `${firstName || ''} ${lastName || ''}`.trim() || 'Guest Customer',
            phone_number: phone || '',
            address_line1: order.address_line1,
            city: order.city,
            postcode: order.postcode,
            country: order.country,
            role: 'customer',
            password: '' // no password for guest accounts
          }])
          .select()
          .single();

        if (!insertError && newUser) {
          finalUserId = newUser.id;
        } else {
          console.error("Failed to create guest user profile:", insertError);
        }
      }
    }

    // Update local database order to mark as paid and update user_id
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
        user_id: finalUserId
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
    if (userId) {
      await supabase.from('cart_items').delete().eq('user_id', userId);
    }

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

/**
 * Initiates the Stripe checkout by creating a PaymentIntent
 */
export const createStripePaymentIntent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || null;
    const { address_line1, address_line2, city, postcode, country = 'United Kingdom', couponCode } = req.body;

    if (!address_line1 || !city || !postcode) {
      return res.status(400).json({ message: "Address, city, and postcode are required fields." });
    }

    // 1. Get cart items (either from DB if logged in, or from body payload if guest)
    let cartItems: any[] = [];
    if (!userId) {
      const bodyCartItems = req.body.cartItems;
      if (!bodyCartItems || !Array.isArray(bodyCartItems) || bodyCartItems.length === 0) {
        return res.status(400).json({ message: "Your cart is empty." });
      }

      const productIds = bodyCartItems.map((item: any) => item.product_id);
      const uuids = productIds.filter((id: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id));
      const filenames = productIds.filter((id: string) => !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id));

      let dbProducts: any[] = [];
      if (uuids.length > 0) {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, image, price, discount_price, category, size')
          .in('id', uuids);
        if (error) console.error("Error fetching by UUID:", error);
        if (data) dbProducts = [...dbProducts, ...data];
      }
      if (filenames.length > 0) {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, image, price, discount_price, category, size')
          .in('image', filenames);
        if (error) console.error("Error fetching by filename:", error);
        if (data) dbProducts = [...dbProducts, ...data];
      }

      if (dbProducts.length === 0) {
        return res.status(400).json({ message: "Failed to retrieve product details." });
      }

      cartItems = bodyCartItems.map((item: any) => {
        const product = dbProducts.find((p: any) => p.id === item.product_id || p.image === item.product_id);
        return {
          quantity: item.quantity,
          unit: item.unit || 'boxes',
          product_id: product ? product.id : item.product_id,
          products: product ? {
            name: product.name,
            image: product.image,
            price: product.price,
            discount_price: product.discount_price,
            category: product.category,
            size: product.size
          } : null
        };
      }).filter((item: any) => item.products !== null);

      if (cartItems.length === 0) {
        return res.status(400).json({ message: "No valid products in cart." });
      }
    } else {
      const { data: dbCartItems, error: cartError } = await supabase
        .from('cart_items')
        .select(`
          quantity,
          unit,
          product_id,
          products (name, image, price, discount_price, category, size)
        `)
        .eq('user_id', userId);

      if (cartError || !dbCartItems || dbCartItems.length === 0) {
        return res.status(400).json({ message: "Your cart is empty." });
      }
      cartItems = dbCartItems;
    }

    // 2. Server-side calculations
    const shipping_cost = 15.00;
    let subtotal = 0;

    const orderItemsToInsert = cartItems.map((item: any) => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products;
      const basePrice = Number(product?.price) || 0;
      const discountPrice = Number(product?.discount_price) || 0;
      const unitPrice = (discountPrice > 0 && discountPrice < basePrice) 
        ? discountPrice 
        : basePrice;

      const isAcc = checkIsAccessory(product);
      let coverage = item.quantity;
      if (!isAcc) {
        const is600x600 = (product?.size || "").toLowerCase().includes("600x600");
        const piecesPerBox = is600x600 ? 4 : 2;
        coverage = item.unit === "pieces"
          ? item.quantity * (1.44 / piecesPerBox)
          : item.quantity * 1.44;
      }
      subtotal += unitPrice * coverage;

      return {
        product_id: item.product_id,
        product_name: product?.name || 'Unknown Product',
        product_image: product?.image || '',
        quantity: item.quantity,
        unit: item.unit || 'sqm',
        price_at_purchase: unitPrice
      };
    });

    const vat_amount = subtotal * 0.20;
    
    // Check for coupon
    let discount = 0;
    if (couponCode) {
      const { data: coupon } = await supabase.from('coupons').select('*').eq('code', couponCode.toUpperCase()).eq('active', true).single();
      if (coupon) {
        if (coupon.type === 'percentage') {
          discount = subtotal * (coupon.value / 100);
        } else {
          discount = coupon.value;
        }
      }
    }

    const total_amount = Math.max(0, subtotal + vat_amount + shipping_cost - discount);

    // 3. Create the pending local order in Supabase
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

    // 4. Insert items
    const finalOrderItems = orderItemsToInsert.map(item => ({
      ...item,
      order_id: order.id
    }));
    const { error: itemsError } = await supabase.from('order_items').insert(finalOrderItems);
    if (itemsError) throw itemsError;

    // 5. Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total_amount * 100), // in pence
      currency: 'gbp',
      metadata: {
        order_id: order.id,
        user_id: userId || 'guest'
      }
    });

    res.status(201).json({
      message: 'Stripe PaymentIntent created',
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      total: total_amount
    });

  } catch (err: any) {
    console.error("Create Stripe Payment Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const captureStripePayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || null;
    const { orderId, paymentIntentId, email, firstName, lastName, phone } = req.body;

    if (!orderId || !paymentIntentId) {
      return res.status(400).json({ message: "Both orderId and paymentIntentId are required." });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: "Payment was not successful on Stripe." });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ message: "Local order not found." });
    }

    if (order.user_id && order.user_id !== userId) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    // 5. Create guest customer profile in Supabase on-the-fly ONLY after successful capture
    let finalUserId = order.user_id || userId;
    if (!finalUserId && email) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        finalUserId = existingUser.id;
      } else {
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{
            email,
            full_name: `${firstName || ''} ${lastName || ''}`.trim() || 'Guest Customer',
            phone_number: phone || '',
            address_line1: order.address_line1,
            city: order.city,
            postcode: order.postcode,
            country: order.country,
            role: 'customer',
            password: '' // no password for guest accounts
          }])
          .select()
          .single();

        if (!insertError && newUser) {
          finalUserId = newUser.id;
        } else {
          console.error("Failed to create guest user profile:", insertError);
        }
      }
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
        user_id: finalUserId
      })
      .eq('id', orderId);

    if (updateError) throw updateError;

    // Clear cart
    if (userId) {
      await supabase.from('cart_items').delete().eq('user_id', userId);
    }

    res.status(200).json({
      message: 'Payment successfully captured',
      orderId
    });

  } catch (err: any) {
    console.error("Capture Stripe Payment Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Places an order manually without a payment gateway.
 * Looks up or registers a guest profile in Supabase on-the-fly and saves the order/items.
 */
export const placeManualOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || null;
    const {
      email,
      firstName,
      lastName,
      phone,
      address_line1,
      address_line2,
      city,
      postcode,
      country = 'United Kingdom',
      couponCode,
      cartItems: bodyCartItems
    } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required to place an order." });
    }
    if (!address_line1 || !city || !postcode) {
      return res.status(400).json({ message: "Address, city, and postcode are required fields." });
    }

    // 1. Resolve final user profile (either DB profile or create a guest profile)
    let finalUserId = userId;
    
    // Look up user by email
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      finalUserId = existingUser.id;
    } else {
      // Create user profile on-the-fly
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{
          email,
          full_name: `${firstName || ''} ${lastName || ''}`.trim() || 'Guest Customer',
          phone_number: phone || '',
          address_line1,
          address_line2: address_line2 || '',
          city,
          postcode,
          country,
          role: 'customer',
          password: '' // no password for guest accounts
        }])
        .select()
        .single();

      if (insertError) {
        console.error("Failed to create guest user profile:", insertError);
        throw new Error("Failed to register customer profile.");
      }
      if (newUser) {
        finalUserId = newUser.id;
      }
    }

    // 2. Fetch cart items details
    let cartItemsList: any[] = [];
    if (!userId) {
      if (!bodyCartItems || !Array.isArray(bodyCartItems) || bodyCartItems.length === 0) {
        return res.status(400).json({ message: "Your cart is empty." });
      }

      const productIds = bodyCartItems.map((item: any) => item.product_id);
      const uuids = productIds.filter((id: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id));
      const filenames = productIds.filter((id: string) => !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id));

      let dbProducts: any[] = [];
      if (uuids.length > 0) {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, image, price, discount_price, category, size')
          .in('id', uuids);
        if (error) console.error("Error fetching by UUID:", error);
        if (data) dbProducts = [...dbProducts, ...data];
      }
      if (filenames.length > 0) {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, image, price, discount_price, category, size')
          .in('image', filenames);
        if (error) console.error("Error fetching by filename:", error);
        if (data) dbProducts = [...dbProducts, ...data];
      }

      if (dbProducts.length === 0) {
        return res.status(400).json({ message: "Failed to retrieve product details." });
      }

      cartItemsList = bodyCartItems.map((item: any) => {
        const product = dbProducts.find((p: any) => p.id === item.product_id || p.image === item.product_id);
        return {
          quantity: item.quantity,
          unit: item.unit || 'boxes',
          product_id: product ? product.id : item.product_id,
          products: product ? {
            name: product.name,
            image: product.image,
            price: product.price,
            discount_price: product.discount_price,
            category: product.category,
            size: product.size
          } : null
        };
      }).filter((item: any) => item.products !== null);

      if (cartItemsList.length === 0) {
        return res.status(400).json({ message: "No valid products in cart." });
      }
    } else {
      const { data: dbCartItems, error: cartError } = await supabase
        .from('cart_items')
        .select(`
          quantity,
          unit,
          product_id,
          products (name, image, price, discount_price, category, size)
        `)
        .eq('user_id', userId);

      if (cartError || !dbCartItems || dbCartItems.length === 0) {
        return res.status(400).json({ message: "Your cart is empty." });
      }
      cartItemsList = dbCartItems;
    }

    // 3. Perform server-side calculations
    let subtotal = 0;
    let totalWeight = 0;

    const orderItemsToInsert = cartItemsList.map((item: any) => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products;
      const basePrice = Number(product?.price) || 0;
      const discountPrice = Number(product?.discount_price) || 0;
      const unitPrice = (discountPrice > 0 && discountPrice < basePrice) 
        ? discountPrice 
        : basePrice;

      const isAcc = checkIsAccessory(product);
      let coverage = item.quantity;
      if (!isAcc) {
        const is600x600 = (product?.size || "").toLowerCase().includes("600x600");
        const piecesPerBox = is600x600 ? 4 : 2;
        coverage = item.unit === "pieces"
          ? item.quantity * (1.44 / piecesPerBox)
          : item.quantity * 1.44;

        // Weight calculation: boxes * 29
        const boxes = item.unit === "pieces" ? item.quantity / piecesPerBox : item.quantity;
        totalWeight += (boxes * 29);
      }
      subtotal += unitPrice * coverage;

      return {
        product_id: item.product_id,
        product_name: product?.name || 'Unknown Product',
        product_image: product?.image || '',
        quantity: item.quantity,
        unit: item.unit || 'boxes',
        price_at_purchase: unitPrice
      };
    });

    let shipping_cost = 15.00;
    try {
      const rateResult = await calculateShippingRateInternal(postcode, totalWeight);
      shipping_cost = rateResult.price;
    } catch (err) {
      console.error("Error calculating dynamic shipping cost:", err);
    }

    const vat_amount = subtotal * 0.20;
    
    // Check for coupon
    let discount = 0;
    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('active', true)
        .single();
        
      if (coupon) {
        if (coupon.type === 'percentage') {
          discount = subtotal * (coupon.value / 100);
        } else {
          discount = coupon.value;
        }
      }
    }

    const total_amount = Math.max(0, subtotal + vat_amount + shipping_cost - discount);

    // 4. Create local order in Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ 
        user_id: finalUserId, 
        total_amount: Number(total_amount.toFixed(2)),
        vat_amount: Number(vat_amount.toFixed(2)),
        shipping_cost,
        currency: 'GBP',
        address_line1,
        address_line2: address_line2 || '',
        city,
        postcode,
        country,
        status: 'pending',
        payment_status: 'unpaid'
      }])
      .select().single();

    if (orderError) throw orderError;

    // 5. Insert order items
    const finalOrderItems = orderItemsToInsert.map(item => ({
      ...item,
      order_id: order.id
    }));
    const { error: itemsError } = await supabase.from('order_items').insert(finalOrderItems);
    if (itemsError) throw itemsError;

    // 6. Decrement inventory stock
    try {
      for (const item of finalOrderItems) {
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
    } catch (stockErr) {
      console.error("Failed to decrement stock:", stockErr);
    }

    // 7. Clear user's cart
    if (userId) {
      await supabase.from('cart_items').delete().eq('user_id', userId);
    }

    res.status(201).json({
      message: 'Order placed successfully',
      orderId: order.id
    });

  } catch (err: any) {
    console.error("Place Manual Order Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
