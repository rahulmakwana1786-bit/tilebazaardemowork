"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addProductAsync } from '@/store/slices/productSlice';
import { IoArrowBackOutline, IoCloudUploadOutline, IoCloseOutline } from 'react-icons/io5';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function AddProductPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.products);
  

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    stock: '',
    category: 'Floor Tiles',
    finish: 'Glossy',
    size: '',
    thickness: '',
    material: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return toast.error("PLEASE UPLOAD A PRODUCT IMAGE", {
      style: { fontSize: '10px', letterSpacing: '0.1em' }
    });

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // Option A: Send as JSON string (Best for Supabase JSONB columns)
      data.append(key, JSON.stringify(value));
    } else {
      data.append(key, value);
    }
  });
    data.append('image', imageFile);

    // 1. Create the promise by unwrapping the dispatch
    const addPromise = dispatch(addProductAsync(data)).unwrap();

    // 2. Trigger the professional themed toast promise
    toast.promise(
      addPromise,
      {
        loading: 'Adding new collection item...',
        success: <b>Product added successfully!</b>,
        error: <b>Failed to add to collection.</b>,
      },
      {
        style: {
          minWidth: '300px',
          borderRadius: '4px', // Sharper corners for architectural feel
          background: '#4a2c2a',
          color: '#fff',
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          padding: '16px',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#fff',
            secondary: '#4a2c2a',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: '#ef4444', // Red for errors
            color: '#fff',
          }
        }
      }
    );

    try {
      await addPromise;
      // 3. Navigate only after the server confirms success
      router.push('/admin/products');
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <Link href="/admin/products" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#4a2c2a] mb-4 transition-colors">
            <IoArrowBackOutline size={16} />
            Back to Inventory
          </Link>
          <h1 className="text-3xl font-serif text-[#4a2c2a]">New Collection Item</h1>
        </div>
        <p className="text-[10px] text-gray-400 italic hidden md:block">Fields marked with * are required</p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT: DRAG & DROP IMAGE SECTION */}
        <div className="lg:col-span-1 space-y-4">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Product Image *</label>
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative aspect-square border-2 border-dashed rounded-sm flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden group
              ${isDragging ? 'border-[#4a2c2a] bg-[#4a2c2a]/5 scale-[1.02]' : 'border-gray-100 bg-gray-50 hover:border-[#4a2c2a]'}
            `}
          >
            {previewUrl ? (
              <>
                <Image src={previewUrl} alt="Preview" fill sizes="90vw" className="object-contain p-2" />
                <div className="absolute inset-0 bg-[#4a2c2a]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-[10px] font-bold uppercase tracking-widest">Replace Image</p>
                </div>
              </>
            ) : (
              <div className="text-center p-6 pointer-events-none">
                <IoCloudUploadOutline size={40} className={`mx-auto mb-2 transition-transform ${isDragging ? '-translate-y-2' : ''} text-gray-300`} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Drop file here</p>
                <p className="text-[9px] text-gray-400 mt-1 uppercase">or click to browse</p>
              </div>
            )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>

        {/* RIGHT: COMPREHENSIVE DETAILS SECTION */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Row 1: Name */}
  <div className="md:col-span-2">
    <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Product Name *</label>
    <input required name="name" value={formData.name} onChange={handleChange} className="w-full mt-2 p-3 border-b border-gray-100 focus:border-[#4a2c2a] outline-none text-sm bg-transparent" placeholder="e.g. Onyx Sky Blue Polished" />
  </div>

  {/* Row 2: Price & Stock */}
  <div>
    <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Price (£/sqm) *</label>
    <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full mt-2 p-3 border-b border-gray-100 focus:border-[#4a2c2a] outline-none text-sm bg-transparent" placeholder="0.00" />
  </div>
  <div>
    <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Discount Price (£/sqm)</label>
    <input 
      type="number" 
      step="0.01" 
      name="discount_price" 
      value={formData.discount_price} 
      onChange={handleChange} 
      className="w-full mt-2 p-3 border-b border-gray-100 focus:border-[#4a2c2a] outline-none text-sm bg-transparent" 
      placeholder="0.00 (Leave empty for no discount)" 
    />
  </div>
  <div>
    <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Initial Stock (sqm) *</label>
    <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full mt-2 p-3 border-b border-gray-100 focus:border-[#4a2c2a] outline-none text-sm bg-transparent" placeholder="100" />
  </div>

  {/* Row 3: Size & Thickness */}
  <div>
    <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Dimensions (mm) *</label>
    <input required name="size" value={formData.size} onChange={handleChange} className="w-full mt-2 p-3 border-b border-gray-100 focus:border-[#4a2c2a] outline-none text-sm bg-transparent" placeholder="e.g. 600x1200" />
  </div>
  <div>
    <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Thickness (mm) *</label>
    <input required name="thickness" value={formData.thickness} onChange={handleChange} className="w-full mt-2 p-3 border-b border-gray-100 focus:border-[#4a2c2a] outline-none text-sm bg-transparent" placeholder="e.g. 8" />
  </div>

  {/* Row 4: Material & Finish (RESTORED) */}
  <div>
    <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Material *</label>
    <input required name="material" value={formData.material} onChange={handleChange} className="w-full mt-2 p-3 border-b border-gray-100 focus:border-[#4a2c2a] outline-none text-sm bg-transparent" placeholder="e.g. Porcelain" />
  </div>
  <div>
    <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Finish *</label>
    <select name="finish" value={formData.finish} onChange={handleChange} className="w-full mt-2 p-3 border-b border-gray-100 focus:border-[#4a2c2a] outline-none text-sm bg-transparent uppercase">
      <option value="Glossy">GLOSSY</option>
      <option value="Matt">MATT</option>
      <option value="Carving">CARVING</option>
      <option value="High Gloss">HIGH GLOSS</option>
      <option value="Punch Glossy">PUNCH GLOSSY</option>
      <option value="Lovelin">LOVELIN</option>
      <option value="Typhoon">TYPHOON</option>
    </select>
  </div>

  {/* Row 5: Category */}
  {/* <div className="md:col-span-2">
    <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Category *</label>
    <select name="category" value={formData.category} onChange={handleChange} className="w-full mt-2 p-3 border-b border-gray-100 focus:border-[#4a2c2a] outline-none text-sm bg-transparent uppercase">
      <option value="Floor Tiles">Floor Tiles</option>
      <option value="Wall Tiles">Wall Tiles</option>
      <option value="Outdoor">Outdoor</option>
      <option value="Mosaic">Mosaic</option>
    </select>
  </div> */}
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Description</label>
            <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="w-full mt-2 p-4 bg-gray-50 border-none focus:ring-1 focus:ring-[#4a2c2a] outline-none text-sm resize-none" placeholder="Provide details on the design, usage, and surface finish..." />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <IoCloseOutline size={18} /> {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#4a2c2a] text-white py-5 text-[11px] cursor-pointer font-bold uppercase tracking-[0.4em] hover:bg-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gray-200"
          >
            {loading ? 'Committing to Archive...' : 'Add to Collection'}
          </button>
        </div>
      </form>
    </div>
  );
}