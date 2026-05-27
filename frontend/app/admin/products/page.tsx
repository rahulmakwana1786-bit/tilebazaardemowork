"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
  IoAddOutline, 
  IoSearchOutline, 
  IoChevronBackOutline, 
  IoChevronForwardOutline,
  IoGridOutline,
  IoListOutline
} from "react-icons/io5";
import { fetchAdminProducts, updateProductAsync } from "@/store/slices/productSlice";
import toast from "react-hot-toast";

const getProductImagePath = (product: any) => {
  if (!product || !product.image) return "/placeholder-tile.jpg";
  if (product.image.startsWith("http")) return product.image;
  if (product.image.startsWith("/")) return product.image;
  
  const category = (product.category || "").toLowerCase();
  const size = (product.size || "").toLowerCase();
  const imgName = product.image.toUpperCase();
  
  if (category === "accessories" || imgName.includes("TRIM") || imgName.includes("SPACER") || imgName.includes("WEDGE") || imgName.includes("MATTING") || imgName.includes("LEVEL") || imgName.includes("ADHESIVE") || imgName.includes("GLUE")) {
    if (imgName.includes("TRIM")) {
      return `/tiles/accessories/trim/${product.image}`;
    }
    if (imgName.includes("SPACER") || imgName.includes("WEDGE")) {
      return `/tiles/accessories/spacer/${product.image}`;
    }
    if (imgName.includes("MATTING") || imgName.includes("LEVEL")) {
      return `/tiles/accessories/matting/${product.image}`;
    }
    if (imgName.includes("ADHESIVE") || imgName.includes("GLUE")) {
      return `/tiles/accessories/adhesive/${product.image}`;
    }
    return `/tiles/accessories/${product.image}`;
  }
  
  return `/tiles/${size}/${product.image}`;
};

export default function AdminProductsPage() {
  const dispatch = useAppDispatch();
  const { items: products, loading } = useAppSelector((state) => state.products);
  
  // --- STATE ---
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFinish, setFilterFinish] = useState("All");
  const [filterSize, setFilterSize] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- STOCK EDIT STATE ---
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockValue, setEditingStockValue] = useState<string>("");
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  const handleStartEdit = (productId: string, currentStock: number) => {
    setEditingStockId(productId);
    setEditingStockValue(currentStock.toString());
  };

  const handleCancelEdit = () => {
    setEditingStockId(null);
    setEditingStockValue("");
  };

  const handleSaveStock = async (productId: string) => {
    if (isUpdatingStock) return;
    
    const newStock = parseInt(editingStockValue);
    if (isNaN(newStock) || newStock < 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.stock === newStock) {
      setEditingStockId(null);
      return;
    }

    setIsUpdatingStock(true);
    const data = new FormData();
    data.append("stock", newStock.toString());
    
    // Pass other fields to preserve them
    data.append("name", product.name);
    data.append("price", product.price.toString());
    data.append("size", product.size);
    data.append("finish", product.finish);
    data.append("thickness", product.thickness || "");
    data.append("material", product.material || "");
    data.append("category", product.category || "");

    try {
      await dispatch(updateProductAsync({ id: productId, data })).unwrap();
      toast.success("Stock updated successfully");
    } catch (err) {
      toast.error("Failed to update stock");
      console.error(err);
    } finally {
      setIsUpdatingStock(false);
      setEditingStockId(null);
    }
  };

  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  // Derived filter options
  const finishes = ["All", ...Array.from(new Set(products.map(p => p.finish).filter(Boolean)))];
  const sizes = ["All", "600x600", "600x1200", "Accessories"];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterFinish, filterSize, filterStatus, sortOrder]);

  // --- FILTER & SORT LOGIC ---
  const filteredProducts = products
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFinish = filterFinish === "All" || p.finish === filterFinish;
      const matchesSize = filterSize === "All" || 
        (filterSize === "Accessories" 
          ? p.category?.toLowerCase() === "accessories" 
          : p.size === filterSize);
      const matchesStatus = filterStatus === "All" || 
        (filterStatus === "Active" ? p.is_active : !p.is_active);
      
      return matchesSearch && matchesFinish && matchesSize && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === "price-low") return a.price - b.price;
      if (sortOrder === "price-high") return b.price - a.price;
      if (sortOrder === "stock-low") return a.stock - b.stock;
      return 0;
    });

  // --- PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-white p-8 md:p-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-serif text-[#4a2c2a] mb-2">Company Inventory</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Operational Registry & Stock Control</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex bg-gray-50 p-1 rounded-sm">
            <button 
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-sm transition-all ${viewMode === "table" ? "bg-white shadow-sm text-[#4a2c2a]" : "text-gray-400"}`}
            >
              <IoListOutline size={18} />
            </button>
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-sm transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-[#4a2c2a]" : "text-gray-400"}`}
            >
              <IoGridOutline size={18} />
            </button>
          </div>

          <Link 
            href="/admin/products/add" 
            className="flex items-center gap-2 bg-[#4a2c2a] text-white px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl rounded-sm"
          >
            <IoAddOutline size={18} />
            Register Product
          </Link>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12 bg-gray-50/50 p-6 rounded-sm border border-gray-100">
        <div className="relative">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 outline-none text-[10px] font-bold tracking-widest uppercase text-gray-600 focus:border-[#4a2c2a] transition-all"
          />
        </div>

        <select 
          value={filterSize} 
          onChange={(e) => setFilterSize(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-100 outline-none text-[10px] font-bold uppercase tracking-widest text-gray-600 focus:border-[#4a2c2a] transition-all"
        >
          {sizes.map(s => <option key={s} value={s}>{s === "All" ? "All Products" : s}</option>)}
        </select>

        <select 
          value={filterFinish} 
          onChange={(e) => setFilterFinish(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-100 outline-none text-[10px] font-bold uppercase tracking-widest text-gray-600 focus:border-[#4a2c2a] transition-all"
        >
          {finishes.map(f => <option key={f} value={f}>{f === "All" ? "All Finishes" : f}</option>)}
        </select>

        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-100 outline-none text-[10px] font-bold uppercase tracking-widest text-gray-600 focus:border-[#4a2c2a] transition-all"
        >
          <option value="All">All Status</option>
          <option value="Active">Active / Live</option>
          <option value="Inactive">Archived</option>
        </select>

        <select 
          value={sortOrder} 
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-100 outline-none text-[10px] font-bold uppercase tracking-widest text-gray-600 focus:border-[#4a2c2a] transition-all"
        >
          <option value="newest">Sort: Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="stock-low">Stock: Low to High</option>
        </select>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-40 text-center text-[10px] font-black uppercase tracking-[0.5em] text-gray-200 animate-pulse">Syncing Database...</div>
      ) : viewMode === "table" ? (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">
                <th className="text-left pb-4 pl-4">Product Ref</th>
                <th className="text-left pb-4">Identity</th>
                <th className="text-left pb-4">Dimensions</th>
                <th className="text-left pb-4">Total Value</th>
                <th className="text-left pb-4">Inventory</th>
                <th className="text-left pb-4">Status</th>
                <th className="text-right pb-4 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((product) => (
                <tr key={product.id} className="group hover:bg-gray-50/50 transition-all border-b border-gray-100">
                  <td className="py-6 pl-4">
                    <span className="bg-[#f0f7ff] text-[#0066ff] px-3 py-1.5 text-[10px] font-bold tracking-widest rounded-sm">
                      #{product.id.toString().substring(0, 8)}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 relative bg-gray-50 rounded-sm overflow-hidden border border-gray-100">
                        <Image src={getProductImagePath(product)} alt={product.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">{product.name}</p>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">{product.finish}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{product.size}</td>
                  <td className="text-[12px] font-black text-[#4a2c2a]">£ {product.price.toFixed(2)}</td>
                  <td>
                    {editingStockId === product.id ? (
                      <input
                        type="number"
                        value={editingStockValue}
                        onChange={(e) => setEditingStockValue(e.target.value)}
                        onBlur={() => handleSaveStock(product.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveStock(product.id);
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        className="w-16 px-2 py-1 border border-[#4a2c2a] outline-none text-xs rounded-sm focus:ring-1 focus:ring-[#4a2c2a] font-bold"
                        autoFocus
                      />
                    ) : (
                      <div 
                        onClick={() => handleStartEdit(product.id, product.stock)}
                        className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-sm transition-all w-fit flex items-center gap-1 group/stock"
                        title="Click to edit stock inline"
                      >
                        <span className={`text-[10px] font-bold ${
                          product.stock > 10 
                            ? 'text-green-600' 
                            : product.stock > 0 
                              ? 'text-amber-500' 
                              : 'text-red-500 font-extrabold'
                        }`}>
                          {product.stock}
                        </span>
                        <span className="text-[8px] text-gray-300 opacity-0 group-hover/stock:opacity-100 transition-opacity ml-1">
                          ✏️
                        </span>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${product.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-300'}`}></div>
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${product.is_active ? 'text-gray-900' : 'text-gray-300'}`}>
                        {product.is_active ? 'Active' : 'Archived'}
                      </span>
                    </div>
                  </td>
                  <td className="text-right pr-4">
                    <Link 
                      href={`/admin/products/${product.id}`}
                      className="inline-flex items-center justify-center bg-white border border-gray-100 text-[#4a2c2a] px-6 py-2 text-[9px] font-black uppercase tracking-widest rounded-sm hover:border-[#4a2c2a] transition-all active:scale-95 shadow-sm"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {currentItems.map((product) => (
            <div key={product.id} className="group border border-gray-100 p-4 rounded-sm hover:shadow-xl transition-all">
               <div className="relative aspect-square mb-4 bg-gray-50 rounded-sm overflow-hidden">
                  <Image src={getProductImagePath(product)} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-3 left-3 bg-white/95 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-[#4a2c2a] shadow-sm">
                    {product.finish}
                  </div>
               </div>
               <div className="text-center">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider mb-1 truncate">{product.name}</h3>
                  <p className="text-[12px] font-black text-[#4a2c2a] mb-4">£{product.price}</p>
                  <Link 
                    href={`/admin/products/${product.id}`}
                    className="block w-full border border-gray-100 text-[9px] font-black uppercase py-2 hover:border-[#4a2c2a] transition-all"
                  >
                    View Record
                  </Link>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-16 pt-12 border-t border-gray-50 flex flex-col items-center gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-100 text-[#4a2c2a] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
            >
              <IoChevronBackOutline size={18} />
            </button>
            
            <div className="flex items-center gap-2">
               {[...Array(totalPages)].map((_, i) => (
                 <button
                   key={i + 1}
                   onClick={() => setCurrentPage(i + 1)}
                   className={`w-8 h-8 text-[9px] font-black rounded-full transition-all ${
                     currentPage === i + 1 
                     ? "bg-[#4a2c2a] text-white shadow-md" 
                     : "text-gray-400 hover:bg-gray-50"
                   }`}
                 >
                   {i + 1}
                 </button>
               ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-100 text-[#4a2c2a] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
            >
              <IoChevronForwardOutline size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && currentItems.length === 0 && (
        <div className="py-40 text-center">
          <p className="text-xl font-serif text-gray-300 italic mb-4">Inventory Registry Empty</p>
          <button onClick={() => {setSearchTerm(""); setFilterFinish("All"); setFilterSize("All");}} className="text-[10px] font-black uppercase tracking-widest text-[#4a2c2a] underline underline-offset-8">Clear Filter Queries</button>
        </div>
      )}
    </div>
  );
}