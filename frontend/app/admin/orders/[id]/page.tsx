"use client";
import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminOrderById,
  updateStatus,
  OrderStatus,
} from "@/store/slices/orderSlice";
import Image from "next/image";

// Define local interfaces to handle the nested Supabase data strictly
interface ProductDetails {
  name: string;
  image: string;
  slug?: string;
}

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;      // What they bought (Snapshot)
  product_image: string;     // Image at time of purchase
  price_at_purchase: number; // Price at time of purchase
  quantity: number;
  unit: string;
  product?: {
    id: string;
    name: string;
    image: string;
    price: number;
    discount_price: number;
    size: string;
    finish: string;
    thickness: string;
    material: string;
    category: string;
  };
}

interface ExtendedOrder {
  id: string;
  created_at: string;
  status: OrderStatus;
  total_amount: number;
  vat_amount: number;
  shipping_cost: number;
  currency: string;
  payment_status: "unpaid" | "paid";
  address_line1: string;
  address_line2?: string;
  city: string;
  postcode: string;
  country: string;
  // User data joined from 'users' table
  user?: {
    full_name: string;
    email: string;
    phone_number?: string;
  };
  // The backend controller returns 'items' via the alias items:order_items
  items: OrderItem[]; 
}

const getItemUnitPrice = (item: any) => {
  const priceAtPurchase = Number(item.price_at_purchase);
  if (priceAtPurchase > 0) {
    return priceAtPurchase;
  }
  if (item.product) {
    const basePrice = Number(item.product.price) || 0;
    const discountPrice = Number(item.product.discount_price) || 0;
    if (discountPrice > 0 && discountPrice < basePrice) {
      return discountPrice;
    }
    return basePrice;
  }
  return 0;
};

const getProductImagePath = (image: string | undefined | null, category?: string, size?: string) => {
  if (!image) return "/placeholder-tile.jpg";
  if (image.startsWith("http")) return image;
  if (image.startsWith("/tiles/")) return image;

  const cleanImage = image.trim();
  const upper = cleanImage.toUpperCase();

  // Determine category and size
  const resolvedCategory = (category || "").toLowerCase();
  const resolvedSize = (size || "").toLowerCase();

  const isAccessory = resolvedCategory === "accessories" || 
    upper.includes("TRIM") || 
    upper.includes("SPACER") || 
    upper.includes("WEDGE") || 
    upper.includes("MATTING") || 
    upper.includes("LEVEL") || 
    upper.includes("ADHESIVE") || 
    upper.includes("GLUE");

  if (isAccessory) {
    if (upper.includes("TRIM")) {
      return `/tiles/accessories/trim/${cleanImage}`;
    }
    if (upper.includes("SPACER") || upper.includes("WEDGE")) {
      return `/tiles/accessories/spacer/${cleanImage}`;
    }
    if (upper.includes("MATTING") || upper.includes("LEVEL")) {
      return `/tiles/accessories/matting/${cleanImage}`;
    }
    if (upper.includes("ADHESIVE") || upper.includes("GLUE")) {
      return `/tiles/accessories/adhesive/${cleanImage}`;
    }
    return `/tiles/accessories/${cleanImage}`;
  }

  // Determine size
  let folderSize = resolvedSize;
  if (!folderSize) {
    if (upper.includes("600X1200")) {
      folderSize = "600x1200";
    } else if (upper.includes("300X600")) {
      folderSize = "300x600";
    } else {
      folderSize = "600x600"; // default size
    }
  }

  return `/tiles/${folderSize}/${cleanImage}`;
};

const OrderDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Cast the state for better IntelliSense
  const { currentOrder, loading, error } = useAppSelector(
    (state) => state.orders,
  );
  const order = currentOrder as ExtendedOrder | null;

  useEffect(() => {
    if (id) {
      dispatch(fetchAdminOrderById(id as string));
    }
  }, [dispatch, id]);

  const handleStatusUpdate = (newStatus: string) => {
    dispatch(
      updateStatus({ id: id as string, status: newStatus as OrderStatus }),
    );
  };

  if (loading)
    return (
      <div className="p-10 text-center text-xl font-semibold">
        Loading TileBazaar Details...
      </div>
    );
  if (error || !order)
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        Error: {error || "Order not found"}
      </div>
    );

  // Standardize the items list regardless of backend alias
  const displayItems = order.items || [];

  const calculatedSubtotal = displayItems.reduce((acc, item) => {
    const unitPrice = getItemUnitPrice(item);
    const qty = Number(item.quantity) || 0;
    return acc + unitPrice * qty;
  }, 0);
  
  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Top Navigation */}
        <button 
          onClick={() => router.back()} 
          className="mb-8 flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-semibold"
        >
          ← Back to Orders
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Summary Sidebar (Matches Customer Details Card) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-[#4a2c2a] rounded-2xl flex items-center justify-center text-2xl font-bold text-white uppercase">
                  {order.id.slice(0, 1)}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">Order Record</h1>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <DetailRow label="Placement Date" value={new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
                <DetailRow label="Order Status" value={
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={order.status} />
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(e.target.value)}
                      className="text-[10px] bg-transparent border-b border-gray-100 outline-none text-gray-400 hover:text-[#4a2c2a] cursor-pointer no-print"
                    >
                      <option value="pending">Update</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                } />
                <DetailRow label="Total Amount" value={`£${order.total_amount.toFixed(2)}`} />
                <DetailRow label="Payment Status" value={
                   <span className={`text-[10px] font-bold ${order.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                    {order.payment_status.toUpperCase()}
                   </span>
                } />
                <div className="pt-4 border-t border-gray-50 mt-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-4">Customer Info</h3>
                  <DetailRow label="Name" value={order.user?.full_name || "Guest"} />
                  <DetailRow label="Email" value={order.user?.email || "N/A"} />
                </div>
                <div className="pt-4 border-t border-gray-50">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-4">Shipping Address</h3>
                  <p className="text-xs font-semibold text-gray-800 leading-relaxed">
                    {[order.address_line1, order.address_line2, order.city, order.postcode, order.country]
                      .filter(part => part && part !== "-")
                      .join(", ")}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => window.print()}
                className="w-full mt-8 py-3 bg-[#4a2c2a] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md no-print"
              >
                Print Invoice
              </button>
            </div>
          </div>

          {/* Items Registry Column (Matches Order History Table) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Order Items</h2>
                <span className="text-[10px] font-black text-gray-400 uppercase">{displayItems.length} Products</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50">
                    <tr className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                      <th className="px-8 py-4">Description</th>
                      <th className="px-8 py-4 text-center">Qty</th>
                      <th className="px-8 py-4 text-right">Unit Price</th>
                      <th className="px-8 py-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {displayItems.map((item) => {
                      const unitPrice = getItemUnitPrice(item);
                      return (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-100">
                                 <Image
                                   src={getProductImagePath(item.product?.image || item.product_image, item.product?.category, item.product?.size)}
                                   alt="Product"
                                   fill
                                   className="object-cover"
                                   unoptimized
                                 />
                                  
                                
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900 uppercase">{item.product?.name || item.product_name}</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{item.product?.size} • {item.product?.finish}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center text-sm font-medium text-gray-500">{item.quantity}</td>
                          <td className="px-8 py-6 text-right text-sm text-gray-500 font-mono">£{unitPrice.toFixed(2)}</td>
                          <td className="px-8 py-6 text-right font-bold text-gray-900 font-mono">£{(unitPrice * item.quantity).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Financial Summary */}
              <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                <div className="w-full sm:w-64 space-y-3">
                  <div className="flex justify-between text-xs text-gray-400 uppercase font-bold tracking-widest">
                    <span>Subtotal</span>
                    <span className="font-mono">£{calculatedSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 uppercase font-bold tracking-widest">
                    <span>Tax (20%)</span>
                    <span className="font-mono">£{order.vat_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 uppercase font-bold tracking-widest pb-3 border-b border-gray-100">
                    <span>Logistics</span>
                    <span className="font-mono">£{order.shipping_cost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4a2c2a]">Total Payable</span>
                    <span className="text-2xl font-bold text-gray-900 font-mono">£{order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components for visual consistency (Matches Customer Details Page)
const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="border-b border-gray-50 pb-3 last:border-0">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
    <div className="text-sm font-semibold text-gray-800">{value}</div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    delivered: "bg-green-50 text-green-600 border-green-100",
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    processing: "bg-blue-50 text-blue-600 border-blue-100",
    cancelled: "bg-red-50 text-red-600 border-red-100",
    shipped: "bg-purple-50 text-purple-600 border-purple-100",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[status] || styles.pending}`}>
      {status.toUpperCase()}
    </span>
  );
};

export default OrderDetailsPage;
