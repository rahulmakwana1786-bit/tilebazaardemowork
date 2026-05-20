// "use client";

// import React, { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import { fetchProductById, deleteProductAsync, clearCurrentProduct } from "@/store/slices/productSlice";
// import { IoArrowBackOutline, IoCreateOutline, IoTrashOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline } from "react-icons/io5";

// export default function AdminProductDetails() {
//   const { id } = useParams();
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const { currentProduct, loading, error } = useAppSelector((state) => state.products);
//   const [isDeleting, setIsDeleting] = useState(false);

//   useEffect(() => {
//     if (id) {
//       dispatch(fetchProductById(id as string));
//     }
//     return () => {
//       dispatch(clearCurrentProduct());
//     };
//   }, [id, dispatch]);

//   const handleDelete = async () => {
//     if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
//       setIsDeleting(true);
//       const result = await dispatch(deleteProductAsync(id as string));
//       if (deleteProductAsync.fulfilled.match(result)) {
//         router.push("/admin/products");
//       } else {
//         setIsDeleting(false);
//       }
//     }
//   };

//   if (loading || (!currentProduct && !error)) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-white">
//         {/* Elegant Minimal Spinner */}
//         <div className="w-6 h-6 border-2 border-gray-200 border-t-[#4a2c2a] rounded-full animate-spin mb-4"></div>
//         <p className="text-[10px] uppercase tracking-[0.3em] text-[#4a2c2a] font-bold animate-pulse">
//           Retrieving Archive
//         </p>
//       </div>
//     );
//   }

//   /**
//    * ERROR / NOT FOUND LOGIC
//    * Only show this if we are NOT loading and the product is truly missing
//    */
//   if (error || !currentProduct) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
//         <h2 className="text-2xl font-serif text-[#4a2c2a] mb-2">Record Not Found</h2>
//         <p className="text-xs text-gray-400 uppercase tracking-widest mb-8">
//           The requested product ID does not exist in our database.
//         </p>
//         <Link 
//           href="/admin/products" 
//           className="text-[10px] font-bold uppercase tracking-widest border-b border-[#4a2c2a] pb-1 hover:opacity-60 transition-opacity"
//         >
//           Return to Inventory
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-[1200px] mx-auto p-6 md:p-12">
//       {/* Top Navigation */}
//       <div className="flex items-center justify-between mb-12">
//         <Link href="/admin/products" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#4a2c2a] transition-colors">
//           <IoArrowBackOutline size={16} />
//           Back to Inventory
//         </Link>
        
//         <div className="flex gap-4">
//           <Link 
//             href={`/admin/products/${id}`}
//             className="flex items-center gap-2 border border-[#4a2c2a] text-[#4a2c2a] px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-[#4a2c2a] hover:text-white transition-all"
//           >
//             <IoCreateOutline size={16} />
//             Edit
//           </Link>
//           <button 
//             onClick={handleDelete}
//             disabled={isDeleting}
//             className="flex items-center gap-2 bg-red-50 text-red-600 px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
//           >
//             <IoTrashOutline size={16} />
//             {isDeleting ? "Deleting..." : "Delete"}
//           </button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
//         {/* Product Image Section */}
//         <div className="space-y-6">
//           <div className="relative aspect-square bg-gray-50 border border-gray-100 rounded-sm overflow-hidden">
//             <Image 
//               src={currentProduct.image} 
//               alt={currentProduct.name} 
//               fill 
//               className="object-cover"
//               priority
//             />
//           </div>
//           <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
//             <span className="text-gray-400">Status:</span>
//             {currentProduct.is_active ? (
//               <span className="text-green-600 flex items-center gap-1"><IoCheckmarkCircleOutline size={14}/> Active on Store</span>
//             ) : (
//               <span className="text-red-400 flex items-center gap-1"><IoCloseCircleOutline size={14}/> Hidden</span>
//             )}
//           </div>
//         </div>

//         {/* Product Info Section */}
//         <div className="flex flex-col">
//           <header className="mb-8 border-b border-gray-100 pb-8">
//             <h1 className="text-4xl font-serif text-[#4a2c2a] mb-4">{currentProduct.name}</h1>
//             <p className="text-sm text-gray-500 leading-relaxed max-w-prose">
//               {currentProduct.description || "No description provided for this product."}
//             </p>
//           </header>

//           <div className="grid grid-cols-2 gap-y-8 gap-x-4 mb-10">
//             <div className="space-y-1">
//               <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Category</p>
//               <p className="text-sm font-medium text-[#4a2c2a]">{currentProduct.category}</p>
//             </div>
//             <div className="space-y-1">
//               <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Base Price</p>
//               <p className="text-sm font-medium text-[#4a2c2a]">£{currentProduct.price.toFixed(2)} / sqm</p>
//             </div>
//             <div className="space-y-1">
//               <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Dimensions</p>
//               <p className="text-sm font-medium text-[#4a2c2a]">{currentProduct.size}</p>
//             </div>
//             <div className="space-y-1">
//               <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Finish</p>
//               <p className="text-sm font-medium text-[#4a2c2a] uppercase">{currentProduct.finish}</p>
//             </div>
//             <div className="space-y-1">
//               <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Thickness</p>
//               <p className="text-sm font-medium text-[#4a2c2a]">{currentProduct.thickness}</p>
//             </div>
//             <div className="space-y-1">
//               <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Stock Available</p>
//               <p className="text-sm font-medium text-[#4a2c2a]">{currentProduct.stock} sqm</p>
//             </div>
//           </div>

//           <div className="mt-auto pt-8 border-t border-gray-100">
//             <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-2">Internal Slug</p>
//             <code className="bg-gray-50 px-3 py-1 rounded text-xs text-[#4a2c2a]">{currentProduct.slug}</code>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
  fetchProductById, 
  clearCurrentProduct,
  updateProductAsync
} from "@/store/slices/productSlice";
import toast from "react-hot-toast";
import { 
  IoArrowBackOutline, 
  IoCreateOutline, 
  IoTrashOutline, 
  IoCheckmarkCircleOutline, 
  IoCloseCircleOutline,
  IoLayersOutline,
  IoResizeOutline,
  IoColorWandOutline,
  IoCubeOutline
} from "react-icons/io5";

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

export default function AdminProductDetails() {
  const { id } = useParams();
//   const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentProduct, loading, error } = useAppSelector((state) => state.products);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleVisibility = async () => {
    if (!currentProduct) return;
    setIsToggling(true);

    const data = new FormData();
    data.append("is_active", (!currentProduct.is_active).toString());
    
    // Pass other fields to preserve them
    data.append("name", currentProduct.name);
    data.append("price", currentProduct.price.toString());
    data.append("stock", currentProduct.stock.toString());
    data.append("size", currentProduct.size);
    data.append("finish", currentProduct.finish);
    data.append("thickness", currentProduct.thickness);
    data.append("material", currentProduct.material);

    const updatePromise = dispatch(updateProductAsync({ id: currentProduct.id, data })).unwrap();

    toast.promise(
      updatePromise,
      {
        loading: 'Updating visibility status...',
        success: <b>Product visibility updated!</b>,
        error: <b>Failed to update visibility.</b>,
      },
      {
        style: {
          minWidth: '250px',
          borderRadius: '4px',
          background: '#4a2c2a',
          color: '#fff',
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
        },
      }
    );

    try {
      await updatePromise;
    } catch (err) {
      console.error("Toggle visibility failed:", err);
    } finally {
      setIsToggling(false);
    }
  };
//   const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id as string));
    }
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [id, dispatch]);

//   const handleDelete = async () => {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete this product? This will remove it from the catalog permanently."
//     );
    
//     if (confirmDelete) {
//       setIsDeleting(true);
//       try {
//         const result = await dispatch(deleteProductAsync(id as string));
//         if (deleteProductAsync.fulfilled.match(result)) {
//           router.push("/admin/products");
//         } else {
//           alert("Failed to delete product. Please try again.");
//           setIsDeleting(false);
//         }
//       } catch (err) {
//         setIsDeleting(false);
//       }
//     }
//   };

  // 1. Loading State
  if (loading || (!currentProduct && !error)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#4a2c2a] rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#4a2c2a] font-bold animate-pulse">
          Retrieving Archive
        </p>
      </div>
    );
  }

  // 2. Error / Not Found State
  if (error || !currentProduct) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-2xl font-serif text-[#4a2c2a] mb-2">Record Not Found</h2>
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-8">
          The requested product ID does not exist in the collection.
        </p>
        <Link href="/admin/products" className="text-[10px] font-bold uppercase tracking-widest border-b border-[#4a2c2a] pb-1">
          Return to Inventory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-6 md:p-12 animate-in fade-in duration-700">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <Link href="/admin/products" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#4a2c2a] transition-colors w-fit">
          <IoArrowBackOutline size={16} />
          Back to Inventory
        </Link>
        
        <div className="flex gap-3">
          <Link 
            href={`/admin/products/${id}/edit`} 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-[#4a2c2a] text-[#4a2c2a] px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#4a2c2a] hover:text-white transition-all"
          >
            <IoCreateOutline size={16} />
            Edit Product
          </Link>
          {/* <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-600 px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
          >
            <IoTrashOutline size={16} />
            {isDeleting ? "Processing..." : "Delete"}
          </button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Visual Sidebar */}
        <div className="space-y-8">
          <div className="relative aspect-square bg-gray-50 border border-gray-100 rounded-sm overflow-hidden shadow-inner">
            <Image 
              src={getProductImagePath(currentProduct)} 
              alt={currentProduct.name} 
              fill 
              sizes="90vw"
              className="object-contain p-3"
              priority
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-sm">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
              <span className="text-gray-400">Visibility:</span>
              <button 
                onClick={handleToggleVisibility}
                disabled={isToggling}
                title="Click to toggle visibility on storefront"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border font-bold text-[9px] uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${
                  currentProduct.is_active 
                    ? "bg-green-50/50 border-green-200 text-green-700 hover:bg-green-100/50" 
                    : "bg-red-50/50 border-red-200 text-red-700 hover:bg-red-100/50"
                }`}
              >
                {currentProduct.is_active ? (
                  <>
                    <IoCheckmarkCircleOutline size={14} className="text-green-600" />
                    Live on Shop
                  </>
                ) : (
                  <>
                    <IoCloseCircleOutline size={14} className="text-red-500" />
                    Hidden
                  </>
                )}
              </button>
            </div>
            <span className="text-[10px] text-gray-300 font-mono">{id}</span>
          </div>
        </div>

        {/* Data Specifications */}
        <div className="flex flex-col">
          <header className="mb-10 border-b border-gray-100 pb-8">
            <h1 className="text-5xl font-serif text-[#4a2c2a] mb-6 leading-tight">{currentProduct.name}</h1>
            <p className="text-sm text-gray-500 leading-relaxed italic">
              {currentProduct.description || "No description provided for this catalog item."}
            </p>
          </header>

          <div className="grid grid-cols-2 gap-y-10 gap-x-6 mb-12">
            {/* <DetailItem icon={<IoLayersOutline />} label="Category" value={currentProduct.category} /> */}
            <DetailItem icon={<IoCubeOutline />} label="Material" value={currentProduct.material} />
            <DetailItem icon={<IoResizeOutline />} label="Dimensions" value={currentProduct.size} />
            <DetailItem icon={<IoColorWandOutline />} label="Surface Finish" value={currentProduct.finish} />
            <DetailItem label="Thickness" value={currentProduct.thickness} />
            <DetailItem label="Unit Price" value={`£${currentProduct.price.toFixed(2)} / sqm`} isHighlight />
            {currentProduct.discount_price && (
  <DetailItem label="Discount Price" value={`£${currentProduct.discount_price.toFixed(2)} / sqm`} isHighlight />
)}
            <DetailItem label="Inventory" value={`${currentProduct.stock} sqm available`} />
            <DetailItem label="Slug" value={currentProduct.slug} isCode />
          </div>

          {/* <div className="mt-auto p-6 bg-[#4a2c2a]/5 border border-[#4a2c2a]/10 rounded-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a] mb-1">Internal Reference</p>
            <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
          </div> */}
        </div>
      </div>
    </div>
  );
}

// Reusable Detail Sub-component
function DetailItem({ label, value, icon, isHighlight, isCode }: { 
  label: string; 
  value: string | number; 
  icon?: React.ReactNode; 
  isHighlight?: boolean;
  isCode?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
        {icon && <span className="text-[#4a2c2a] opacity-50">{icon}</span>}
        {label}
      </div>
      <p className={`text-sm font-medium ${isHighlight ? 'text-[#4a2c2a] text-lg font-serif' : 'text-gray-700'} ${isCode ? 'font-mono text-[11px] bg-white px-2 py-0.5 border border-gray-100' : ''}`}>
        {value}
      </p>
    </div>
  );
}