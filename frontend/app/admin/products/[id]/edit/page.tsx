// "use client";

// import React, { useEffect, useState, useRef } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import Link from 'next/link';
// import Image from 'next/image';
// import { useAppDispatch, useAppSelector } from '@/store/hooks';
// import { fetchProductById, updateProductAsync } from '@/store/slices/productSlice';
// import { IoArrowBackOutline, IoCloudUploadOutline, IoCloseOutline, IoSaveOutline } from 'react-icons/io5';

// export default function EditProductPage() {
//   const { id } = useParams();
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const { currentProduct, loading, error } = useAppSelector((state) => state.products);

//   interface FormState {
//   name: string;
//   description: string;
//   price: string;
//   stock: string;
//   category: string;
//   finish: string;
//   size: string;
//   thickness: string;
//   material: string;
//   is_active: boolean;
// }

// const [formData, setFormData] = useState<FormState>({
//   name: '',
//   description: '',
//   price: '',
//   stock: '',
//   category: 'Floor Tiles',
//   finish: 'Glossy',
//   size: '',
//   thickness: '',
//   material: '',
//   is_active: true
// });

//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // 1. Fetch data if not present and populate form
//   useEffect(() => {
//     if (id) {
//       dispatch(fetchProductById(id as string));
//     }
//   }, [id, dispatch]);

//   useEffect(() => {
//   if (currentProduct) {
//     setFormData({
//       name: currentProduct.name || '',
//       description: currentProduct.description || '',
//       price: currentProduct.price?.toString() || '',
//       stock: currentProduct.stock?.toString() || '',
//       category: currentProduct.category || 'Floor Tiles',
//       finish: currentProduct.finish || 'Glossy',
//       size: currentProduct.size || '',
//       thickness: currentProduct.thickness || '',
//       material: currentProduct.material || '',
//       is_active: Boolean(currentProduct.is_active)
//     });
//     setPreviewUrl(currentProduct.image);
//   }
// }, [currentProduct]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//   const target = e.target;
//   const name = target.name;
  
//   // Logic to determine the value based on input type
//   const value = target instanceof HTMLInputElement && target.type === 'checkbox' 
//     ? target.checked 
//     : target.value;

//   setFormData(prev => ({
//     ...prev,
//     [name]: value
//   }));
// };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setImageFile(file);
//       setPreviewUrl(URL.createObjectURL(file));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const data = new FormData();
    
//     Object.entries(formData).forEach(([key, value]) => {
//       data.append(key, value.toString());
//     });

//     if (imageFile) {
//       data.append('image', imageFile);
//     }

//     const result = await dispatch(updateProductAsync({ id: id as string, data }));
//     if (updateProductAsync.fulfilled.match(result)) {
//       router.push(`/admin/products/${id}`);
//     }
//   };

//   if (loading && !currentProduct) return <div className="p-20 text-center animate-pulse uppercase text-[10px] tracking-widest">Loading Record...</div>;

//   return (
//     <div className="max-w-6xl mx-auto p-6 md:p-12 animate-in fade-in duration-500">
//       <header className="mb-10 flex justify-between items-end">
//         <div>
//           <Link href={`/admin/products/${id}`} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#4a2c2a] mb-4 transition-colors">
//             <IoArrowBackOutline size={16} />
//             Cancel Changes
//           </Link>
//           <h1 className="text-3xl font-serif text-[#4a2c2a]">Edit Product</h1>
//         </div>
//       </header>

//       <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
//         {/* IMAGE SECTION */}
//         <div className="lg:col-span-1 space-y-4">
//           <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Update Image</label>
//           <div 
//             onClick={() => fileInputRef.current?.click()}
//             className="relative aspect-square border-2 border-dashed border-gray-100 bg-gray-50 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-[#4a2c2a] transition-all overflow-hidden group"
//           >
//             {previewUrl ? (
//               <>
//                 <Image src={previewUrl} alt="Preview" fill className="object-cover" />
//                 <div className="absolute inset-0 bg-[#4a2c2a]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                   <IoCloudUploadOutline size={30} className="text-white" />
//                 </div>
//               </>
//             ) : (
//               <IoCloudUploadOutline size={40} className="text-gray-200" />
//             )}
//           </div>
//           <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
//           <p className="text-[9px] text-gray-400 italic">Leave empty to keep current image.</p>
//         </div>

//         {/* DETAILS SECTION */}
//         <div className="lg:col-span-2 space-y-8">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="md:col-span-2">
//               <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Product Name</label>
//               <input required name="name" value={formData.name} onChange={handleChange} className="w-full mt-2 p-3 border-b border-gray-100 focus:border-[#4a2c2a] outline-none text-sm bg-transparent" />
//             </div>

//             <div>
//               <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Price (£/sqm)</label>
//               <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full mt-2 p-3 border-b border-gray-100 focus:border-[#4a2c2a] outline-none text-sm bg-transparent" />
//             </div>
//             <div>
//               <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Stock (sqm)</label>
//               <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full mt-2 p-3 border-b border-gray-100 focus:border-[#4a2c2a] outline-none text-sm bg-transparent" />
//             </div>

//             <div>
//               <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Dimensions</label>
//               <input required name="size" value={formData.size} onChange={handleChange} className="w-full mt-2 p-3 border-b border-gray-100 focus:border-[#4a2c2a] outline-none text-sm bg-transparent" />
//             </div>
//             <div>
//               <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Thickness</label>
//               <input required name="thickness" value={formData.thickness} onChange={handleChange} className="w-full mt-2 p-3 border-b border-gray-100 focus:border-[#4a2c2a] outline-none text-sm bg-transparent" />
//             </div>

//             <div>
//               <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Material</label>
//               <input required name="material" value={formData.material} onChange={handleChange} className="w-full mt-2 p-3 border-b border-gray-100 focus:border-[#4a2c2a] outline-none text-sm bg-transparent" />
//             </div>
//             <div>
//               <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Finish</label>
//               <select name="finish" value={formData.finish} onChange={handleChange} className="w-full mt-2 p-3 border-b border-gray-100 focus:border-[#4a2c2a] outline-none text-sm bg-transparent uppercase">
//                 <option value="Glossy">Glossy</option>
//                 <option value="Matt">Matt</option>
//                 <option value="Satin">Satin</option>
//                 <option value="Lappato">Lappato</option>
//                 <option value="Textured">Textured</option>
//               </select>
//             </div>
//           </div>

//           <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-sm">
//             <input 
//               type="checkbox" 
//               name="is_active" 
//               checked={formData.is_active} 
//               onChange={handleChange}
//               className="w-4 h-4 accent-[#4a2c2a]"
//             />
//             <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Display product on live store</label>
//           </div>

//           <button 
//             type="submit" 
//             disabled={loading}
//             className="w-full bg-[#4a2c2a] text-white py-5 text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
//           >
//             <IoSaveOutline size={18} />
//             {loading ? 'Updating Archive...' : 'Save Product Changes'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }


"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProductById, updateProductAsync } from '@/store/slices/productSlice';
import { IoArrowBackOutline, IoCloudUploadOutline, IoCloseOutline, IoSaveOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';

// --- MAIN PARENT COMPONENT ---
export default function EditProductPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { currentProduct, loading, error } = useAppSelector((state) => state.products);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id as string)).finally(() => {
        setHasFetched(true);
      });
    }
  }, [id, dispatch]);

  if (loading || (!hasFetched && !currentProduct)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#4a2c2a] rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#4a2c2a] font-bold animate-pulse">
          Retrieving Archive...
        </p>
      </div>
    );
  }
  if (currentProduct) {
    const productData: Product = currentProduct; // No more squiggly lines
    
    return (
      <ProductEditForm 
        key={productData.id} 
        product={productData} 
        id={id as string} 
      />
    );
  }

  // 2. Show error ONLY if we have an explicit error OR if we finished fetching and still have no product
  return (
    <div className="p-20 text-center uppercase text-[10px] tracking-widest text-red-500">
      Product not found.
    </div>
  );
}
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  discount_price?: number;
  stock: number;
  category?: string;
  finish: string;
  size: string;
  thickness: string;
  material: string;
  image: string;
  is_active: boolean;
  slug?: string;
}
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
    } else {
      folderSize = "600x600"; // default size
    }
  }

  return `/tiles/${folderSize}/${cleanImage}`;
};

// --- ACTUAL FORM COMPONENT ---
function ProductEditForm({ product, id }: { product: Product; id: string }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.products);

  // Initialize state directly from the product passed as a prop
  const [formData, setFormData] = useState({
    name: product.name || '',
    description: product.description || '',
    price: product.price?.toString() || '',
    discount_price: product.discount_price?.toString() || '',
    stock: product.stock?.toString() || '',
    category: product.category || 'Floor Tiles',
    finish: product.finish || 'Glossy',
    size: product.size || '',
    thickness: product.thickness || '',
    material: product.material || '',
    is_active: Boolean(product.is_active)
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(product.image);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const resolvedSrc = (previewUrl && (previewUrl.startsWith("blob:") || previewUrl.startsWith("http") || previewUrl.startsWith("/tiles/")))
    ? previewUrl
    : getProductImagePath(previewUrl, product.category, product.size);

  const handleDrag = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(e.type === "dragover");
};

const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(false);
  const file = e.dataTransfer.files?.[0];
  if (file && file.type.startsWith("image/")) {
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const data = new FormData();
  Object.entries(formData).forEach(([key, value]) => data.append(key, value.toString()));
  if (imageFile) data.append('image', imageFile);

  // 2. Wrap the dispatch in a promise-based toast
  const updatePromise = dispatch(updateProductAsync({ id, data })).unwrap();

  toast.promise(
    updatePromise,
    {
      loading: 'Updating inventory archive...',
      success: <b>Product updated successfully!</b>,
      error: <b>Failed to update product.</b>,
    },
    {
      // Optional: Professional styling to match your TileBazaar theme
      style: {
        minWidth: '250px',
        borderRadius: '4px',
        background: '#4a2c2a',
        color: '#fff',
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
      },
      success: {
        duration: 4000,
        iconTheme: {
          primary: '#fff',
          secondary: '#4a2c2a',
        },
      },
    }
  );

  try {
    await updatePromise;
    // 3. Navigate only after success
    router.push(`/admin/products/${id}`);
  } catch (err) {
    console.error("Update failed:", err);
  }
};

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 animate-in fade-in duration-500">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <Link href={`/admin/products/${id}`} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#4a2c2a] mb-4 transition-colors">
            <IoArrowBackOutline size={16} />
            Cancel Changes
          </Link>
          <h1 className="text-3xl font-serif text-[#4a2c2a]">Edit Product</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* IMAGE SECTION */}
        <div className="lg:col-span-1 space-y-4">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Update Image</label>
          <div 
          onDragOver={handleDrag}
  onDragLeave={handleDrag}
  onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative aspect-square border-2 border-dashed border-gray-100 bg-gray-50 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-[#4a2c2a] transition-all overflow-hidden group ${isDragging ? 'border-[#4a2c2a] bg-[#4a2c2a]/5' : 'border-gray-100 bg-gray-50'}`}
          >
            {resolvedSrc ? (
              <>
                <Image src={resolvedSrc} alt="Preview" fill sizes="90vw" className="object-contain p-2" />
                <div className="absolute inset-0 bg-[#4a2c2a]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <IoCloudUploadOutline size={30} className="text-white" />
                </div>
              </>
            ) : (
              <IoCloudUploadOutline size={40} className="text-gray-200" />
            )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          <p className="text-[9px] text-gray-400 italic">Leave empty to keep current image.</p>
        </div>

        {/* DETAILS SECTION */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Product Name</label>
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full mt-2 p-3 border-b border-gray-100 focus:border-[#4a2c2a] outline-none text-sm bg-transparent" />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Price (£/sqm)</label>
              <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full mt-2 p-3 border-b border-gray-100 focus:border-[#4a2c2a] outline-none text-sm bg-transparent" />
            </div>
            
<div>
  <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">
    Discount Price (£/sqm)
  </label>
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
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Stock (sqm)</label>
              <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full mt-2 p-3 border-b border-gray-100 focus:border-[#4a2c2a] outline-none text-sm bg-transparent" />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Dimensions (mm)</label>
              <input required name="size" value={formData.size} onChange={handleChange} className="w-full mt-2 p-3 border-b border-gray-100 focus:border-[#4a2c2a] outline-none text-sm bg-transparent" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Thickness (mm)</label>
              <input required name="thickness" value={formData.thickness} onChange={handleChange} className="w-full mt-2 p-3 border-b border-gray-100 focus:border-[#4a2c2a] outline-none text-sm bg-transparent" />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Material</label>
              <input required name="material" value={formData.material} onChange={handleChange} className="w-full mt-2 p-3 border-b border-gray-100 focus:border-[#4a2c2a] outline-none text-sm bg-transparent" />
            </div>

            {/* <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full mt-2 p-3 border-b border-gray-100 focus:border-[#4a2c2a] outline-none text-sm bg-transparent uppercase">
                <option value="Floor Tiles">FLOOR TILES</option>
                <option value="Wall Tiles">WALL TILES</option>
                <option value="Kitchen Tiles">KITCHEN TILES</option>
                <option value="Outdoor Tiles">OUTDOOR TILES</option>
                <option value="Mosaic Tiles">MOSAIC TILES</option>
              </select>
            </div> */}

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a]">Finish</label>
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
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-sm">
            <input 
              type="checkbox" 
              name="is_active" 
              id="is_active"
              checked={formData.is_active} 
              onChange={handleChange}
              className="w-4 h-4 accent-[#4a2c2a] cursor-pointer"
            />
            <label htmlFor="is_active" className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a] cursor-pointer">
              Display product on live store
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#4a2c2a] text-white py-5 cursor-pointer text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <IoSaveOutline size={18} />
            {loading ? 'Updating Archive...' : 'Save Product Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}