// "use client";
// import { useCart } from '@/context/CartContext';
// import Image from 'next/image';
// import { IoCloseOutline, IoAddOutline, IoRemoveOutline, IoTrashOutline } from 'react-icons/io5';

// export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
//   const { cartItems, setCartOpen, updateQuantity, removeItem } = useCart();

//   const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

//   return (
//     <>
//       {/* Backdrop */}
//       <div
//         className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
//         onClick={onClose}
//       />

//       {/* Drawer */}
//       <div className={`fixed top-0 right-0 h-full w-full max-w-[450px] bg-white z-[70] shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>

//         {/* Header */}
//         <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
//           <h2 className="text-[13px] font-bold text-[#4a2c2a] uppercase tracking-widest">
//             Your Cart ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
//           </h2>
//           <button onClick={onClose} className="text-black p-1 hover:rotate-90 transition-transform">
//             <IoCloseOutline size={24} />
//           </button>
//         </div>

//         {/* Scrollable Items Area */}
//         <div className="flex-grow overflow-y-auto p-6 no-scrollbar">
//           {cartItems.length === 0 ? (
//             <div className="text-center pt-20">
//               <h1 className="text-3xl font-serif text-[#4a2c2a] mb-4">Your cart is empty.</h1>
//             </div>
//           ) : (
//             <div className="space-y-8">
//               {cartItems.map((item) => (
//                 <div key={item.id} className="flex gap-4">
//                   {/* Item Image */}
//                   <div className="relative w-24 h-24 flex-shrink-0 bg-[#f9f9f9] rounded-lg overflow-hidden">
//                     <Image src={item.image} alt={item.name} fill className="object-cover" />
//                   </div>

//                   {/* Item Details */}
//                   <div className="flex flex-col flex-grow">
//                     <div className="flex justify-between items-start mb-1">
//                       <h4 className="text-[12px] font-bold uppercase tracking-tight text-[#4a2c2a] pr-4 leading-snug">
//                         {item.name}
//                       </h4>
//                       <button
//                         onClick={() => removeItem(item.id)}
//                         className="text-gray-400 hover:text-red-500 transition-colors"
//                       >
//                         <IoTrashOutline size={18} />
//                       </button>
//                     </div>

//                     <p className="text-[13px] text-[#4a2c2a]/60 font-bold mb-4">${item.price} /m²</p>

//                     {/* Quantity Controls */}
//                     <div className="flex items-center justify-between mt-auto">
//                       <div className="flex items-center border border-gray-200">
//                         <button
//                           onClick={() => updateQuantity(item.id, -1)}
//                           className="p-2 hover:bg-gray-50 text-[#4a2c2a]"
//                         >
//                           <IoRemoveOutline size={14} />
//                         </button>
//                         <span className="px-4 text-[13px] text-[#4a2c2a]/90 font-bold min-w-[40px] text-center">
//                           {item.quantity}
//                         </span>
//                         <button
//                           onClick={() => updateQuantity(item.id, 1)}
//                           className="p-2 hover:bg-gray-50 text-[#4a2c2a]"
//                         >
//                           <IoAddOutline size={14} />
//                         </button>
//                       </div>
//                       <p className="text-[13px] font-bold text-[#4a2c2a]">
//                         ${(item.price * item.quantity).toFixed(2)}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Sticky Footer */}
//         {cartItems.length > 0 && (
//           <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
//             <div className="flex justify-between items-center mb-6">
//               <span className="text-[14px] font-bold uppercase tracking-widest opacity-60">Subtotal</span>
//               <span className="text-[18px] font-bold text-[#4a2c2a]">${totalPrice.toFixed(2)}</span>
//             </div>
//             <button className="w-full bg-[#4a2c2a] text-white py-5 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#5d3a37] transition-all">
//               Checkout
//             </button>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCart,
  addToCartAsync,
  updateQuantityAsync,
  removeFromCartAsync,
  mockRemoveFromCart,
  mockUpdateQuantity,
} from "@/store/slices/cartSlice";
import {
  IoCloseOutline,
  IoAddOutline,
  IoRemoveOutline,
  IoTrashOutline,
} from "react-icons/io5";

import { useRouter } from "next/navigation";

const getProductImagePath = (product: any) => {
  if (!product || !product.image) return "/placeholder-tile.jpg";
  if (product.image.startsWith("http")) return product.image;
  if (product.image.startsWith("/tiles/")) return product.image;
  
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

const getProductPrice = (product: any) => {
  if (!product) return 0;
  const price = Number(product.price) || 0;
  const discountPrice = Number(product.discount_price) || 0;
  if (discountPrice > 0 && discountPrice < price) {
    return discountPrice;
  }
  return price;
};

export default function CartDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // 1. DIRECT STATE ACCESS (No selectors needed)
  const { items: cartItems, loading } = useAppSelector((state) => state.cart);
  const { token } = useAppSelector((state) => state.auth);

  // 2. MANUAL CALCULATIONS
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => {
    return (
      acc +
      getProductPrice(item.product) * item.quantity
    );
  }, 0);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCart());
    }
  }, [isOpen, dispatch]);

  const handleUpdateQuantity = async (
    cartItemId: string,
    currentQty: number,
    delta: number,
  ) => {
    const newQty = currentQty + delta;

    if (newQty > 0) {
      if (token) {
        try {
          await dispatch(
            updateQuantityAsync({ cartItemId, quantity: newQty }),
          ).unwrap();
        } catch (e) {
          dispatch(mockUpdateQuantity({ id: cartItemId, quantity: newQty }));
        }
      } else {
        dispatch(mockUpdateQuantity({ id: cartItemId, quantity: newQty }));
      }
    } else {
      handleRemove(cartItemId);
    }
  };

  const handleRemove = async (cartItemId: string) => {
    if (token) {
      try {
        await dispatch(removeFromCartAsync(cartItemId)).unwrap();
      } catch (e) {
        dispatch(mockRemoveFromCart(cartItemId));
      }
    } else {
      dispatch(mockRemoveFromCart(cartItemId));
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        className={`fixed top-0 h-full w-full max-w-[450px] bg-white z-[70] shadow-2xl transition-all duration-300 flex flex-col ${
          isOpen
            ? "right-0 opacity-100"
            : "-right-[500px] opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
          <h2 className="text-[13px] font-bold text-[#4a2c2a] uppercase tracking-widest">
            Your Cart ({totalCount})
          </h2>
          <button
            onClick={onClose}
            className="text-black p-1 hover:rotate-90 transition-transform"
          >
            <IoCloseOutline size={24} />
          </button>
        </div>

        {/* Scrollable Items Area */}
        <div className="flex-grow overflow-y-auto p-6 no-scrollbar space-y-8 relative z-10">
          {" "}
          {cartItems.length === 0 ? (
            <div className="text-center pt-20">
              <h1 className="text-xl font-serif text-[#4a2c2a] opacity-40 italic">
                Empty Basket
              </h1>
            </div>
          ) : (
            cartItems.map((item) => {
              const product = item.product;
            if (!product) {
  return (
    <div
      key={item.id}
      className="flex gap-4 pb-6 border-b border-gray-50 last:border-0"
    >
      <div className="w-24 h-24 bg-gray-100 animate-pulse rounded-sm" />

      <div className="flex flex-col flex-grow justify-center">
        <p className="text-sm text-gray-400">
          Loading product...
        </p>
      </div>
    </div>
  );
}

              return (
                <div
                  key={item.id}
                  className="flex gap-4 pb-6 border-b border-gray-50 last:border-0 relative z-10"
                >
                  {" "}
                  <div className="relative w-24 h-24 flex-shrink-0 bg-[#f9f9f9] rounded-sm">
                    <Image
                      src={getProductImagePath(product)}
                      alt={product.name}
                      fill
                      sizes="90vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col flex-grow">
                    <div className="flex justify-between items-start">
                      <h4 className="text-[11px] font-bold uppercase text-[#4a2c2a] leading-tight pr-4">
                        {product.name}
                      </h4>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-gray-300 hover:text-red-500"
                      >
                        <IoTrashOutline size={18} />
                      </button>
                    </div>

                    <p className="text-[11px] text-[#4a2c2a] mt-1 tracking-tighter">
                      <span className="text-[12px]">
                        £{getProductPrice(product)} /m²{" "}
                      </span>
                      • {product.size}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4">
                      <div className="flex items-center border border-gray-200">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity, -1)
                          }
                          className="p-1.5 text-[#4a2c2a] hover:bg-gray-50"
                        >
                          <IoRemoveOutline size={14} />
                        </button>
                        <span className="px-3 text-[#4a2c2a] text-[12px] font-bold min-w-[30px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity, 1)
                          }
                          className="p-1.5 text-[#4a2c2a] hover:bg-gray-50"
                        >
                          <IoAddOutline size={14} />
                        </button>
                      </div>
                      <p className="text-[13px] font-bold text-[#4a2c2a]">
                        £
                        {(
                          getProductPrice(product) *
                          item.quantity
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[11px] font-bold uppercase opacity-50 tracking-widest">
                Subtotal
              </span>
              <span className="text-[20px] font-bold text-[#4a2c2a]">
                £{totalPrice.toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => {
                onClose();
                router.push("/checkout");
              }}
              className="w-full bg-[#4a2c2a] text-white py-5 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
