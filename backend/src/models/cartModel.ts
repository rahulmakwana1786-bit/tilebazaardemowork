export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  // Joined data (Optional, for frontend display)
  product?: {
    name: string;
    price: number;
    image: string;
    size: string;
  };
}

export interface AddToCartDTO {
  product_id: string;
  quantity: number;
}