export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  currency: string; // 'GBP' for UK market
  vat_amount: number; // 20% for UK logic
  shipping_cost: number;
  status: OrderStatus;
  
  // Shipping details
  address_line1: string;
  address_line2?: string;
  city: string;
  postcode: string;
  country: string;
  
  payment_status: 'unpaid' | 'paid';
  payment_method?: 'stripe' | 'razorpay' | 'xepay'; // Useful for tracking expansion
  
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string; // Snapshot for history
  product_image: string; // Thumbnail URL from Cloudinary
  quantity: number;
  unit: 'sqm' | 'box' | 'piece'; // Tiles are sold in different units
  price_at_purchase: number;
}