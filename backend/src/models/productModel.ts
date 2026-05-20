export interface Product {
  id: string;
  name: string;
  slug: string;           // Unique URL identifier
  description: string;
  
  // Pricing & Inventory
  price: number;          // Base price
  discount_price?: number; 
  stock: number;          // Available quantity
  
  // Technical Specs (The core of tile selling)
  category: string;       // Wall, Floor, Outdoor
  finish: string;         // Glossy, Matt, Satin
  size: string;           // 600x600, 800x1600
  thickness: string;      // 9mm, 12mm
  material: string;       // Porcelain, Ceramic
  
  // Media
  image: string;          // Main Cloudinary URL
  gallery?: string[];     // Array of additional images
  
  // Metadata
  is_active: boolean;     // To hide/show products
  created_at: string;
}

// Data Transfer Object for creating/updating
export interface ProductDTO extends Omit<Product, 'id' | 'created_at'> {}