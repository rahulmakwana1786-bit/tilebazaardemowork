"use client";

import React, { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { addToCartAsync, mockAddToCart } from "@/store/slices/cartSlice";
import { useCart } from "@/context/CartContext";

interface PackRow {
  boxes: number;
  area: number;
  pieces: number;
}

// 1 box = 1.44m2
const PACK_PRESETS: PackRow[] = [
  { boxes: 7, area: 10.08, pieces: 14 },
  { boxes: 10, area: 14.40, pieces: 20 },
  { boxes: 13, area: 18.72, pieces: 26 },
  { boxes: 15, area: 21.60, pieces: 30 },
  { boxes: 18, area: 25.92, pieces: 36 },
];

interface TilePackCalculatorProps {
  productId: string;
  productName: string;
  pricePerM2: number;
  size: string;
  image: string;
  token: string | null;
  router: any;
}

export default function TilePackCalculator({
  productId,
  productName,
  pricePerM2,
  size,
  image,
  token,
  router,
}: TilePackCalculatorProps) {
  const dispatch = useAppDispatch();
  const { setCartOpen } = useCart();
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [customPieces, setCustomPieces] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // If the size is 600x600, there are 4 pieces per box (1.44 / 0.36 = 4)
  // If 300x600, there are 8 pieces per box (1.44 / 0.18 = 8)
  // If 600x1200, there are 2 pieces per box (1.44 / 0.72 = 2)
  const is600x600 = size.toLowerCase().includes("600x600");
  const is300x600 = size.toLowerCase().includes("300x600");
  const piecesPerBox = is600x600 ? 4 : (is300x600 ? 8 : 2);

  const handleQtyChange = (boxCount: number, delta: number) => {
    setCustomPieces(""); // clear custom pieces
    setQuantities((prev) => {
      const current = prev[boxCount] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [boxCount]: next };
    });
  };

  const handleCustomPiecesChange = (val: string) => {
    setQuantities({}); // clear presets
    setCustomPieces(val);
  };

  const totalBoxesToCart = Object.entries(quantities).reduce(
    (acc, [boxCount, qty]) => acc + Number(boxCount) * qty,
    0
  );

  const customPiecesInt = parseInt(customPieces) || 0;
  const customArea = customPiecesInt * (1.44 / piecesPerBox);
  const customPrice = customArea * pricePerM2;

  const hasItems = totalBoxesToCart > 0 || customPiecesInt > 0;

  const handleAddToCart = async () => {
    if (!hasItems) return;
    
    const qtyToSend = totalBoxesToCart > 0 ? totalBoxesToCart : customPiecesInt;
    const unitToSend = totalBoxesToCart > 0 ? "boxes" : "pieces";

    if (!token) {
      const continueWithoutLogin = typeof window !== "undefined" && localStorage.getItem("tb_continue_without_login") === "true";
      if (!continueWithoutLogin) {
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }
      dispatch(
        mockAddToCart({
          id: Math.random().toString(),
          user_id: "preview_user",
          product_id: productId,
          quantity: qtyToSend,
          unit: unitToSend,
          product: {
            id: productId,
            name: productName,
            price: pricePerM2,
            image: image,
            size: size,
            slug: productId,
          },
        })
      );
      setIsSuccess(true);
      setCartOpen(true);
      setQuantities({});
      setCustomPieces("");
      setTimeout(() => setIsSuccess(false), 2500);
      return;
    }

    try {
      setIsAdding(true);
      await dispatch(
        addToCartAsync({ product_id: productId, quantity: qtyToSend, unit: unitToSend })
      ).unwrap();
      setIsSuccess(true);
      setCartOpen(true);
      setQuantities({}); // Reset
      setCustomPieces("");
      setTimeout(() => setIsSuccess(false), 2500);
    } catch {
      // Fallback
      dispatch(
        mockAddToCart({
          id: Math.random().toString(),
          user_id: "preview_user",
          product_id: productId,
          quantity: qtyToSend,
          unit: unitToSend,
          product: {
            id: productId,
            name: productName,
            price: pricePerM2,
            image: image,
            size: size,
            slug: productId,
          },
        })
      );
      setIsSuccess(true);
      setCartOpen(true);
      setQuantities({});
      setCustomPieces("");
      setTimeout(() => setIsSuccess(false), 2500);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-[#faf9f8] p-6 md:p-8 border border-gray-100 mt-6 mb-8">
      <div className="mb-6">
        <h3 className="text-[14px] font-black uppercase tracking-widest text-[#4a2c2a] mb-2">
          Select Tile Pack
        </h3>
        <p className="text-[12px] text-gray-500 font-medium">
          Choose your coverage area or customize quantity
        </p>
      </div>

      <div className="md:hidden space-y-4">
        {PACK_PRESETS.map((row, idx) => {
          const qty = quantities[row.boxes] || 0;
          const rowPrice = row.area * pricePerM2;
          const actualPieces = row.boxes * piecesPerBox;

          return (
            <div key={idx} className="bg-white p-4 rounded-sm border border-gray-100 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-[14px] font-bold text-[#4a2c2a]">{row.area.toFixed(2)} m²</span>
                <span className="text-[11px] text-gray-500 font-medium">{actualPieces} pcs • £{rowPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQtyChange(row.boxes, -1)}
                  className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-sm text-gray-400 bg-white hover:border-gray-300 disabled:opacity-50 transition-colors"
                  disabled={qty <= 0}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                </button>
                <span className="w-4 text-center text-[12px] font-bold text-[#4a2c2a]">
                  {qty}
                </span>
                <button
                  onClick={() => handleQtyChange(row.boxes, 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-sm text-white bg-[#4a2c2a] hover:bg-[#3a1c1a] transition-colors shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </button>
              </div>
            </div>
          );
        })}
        {/* Mobile Custom Pieces Card */}
        <div className="bg-white p-4 rounded-sm border border-gray-100 flex flex-col gap-3 shadow-sm">
          <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Custom Quantity</span>
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[14px] font-bold text-[#4a2c2a]">{customArea.toFixed(2)} m²</span>
              <span className="text-[11px] text-gray-500 font-medium">£{customPrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                placeholder="Pieces"
                value={customPieces}
                onChange={(e) => handleCustomPiecesChange(e.target.value)}
                className="w-20 px-2 py-1.5 border border-gray-200 text-[12px] rounded focus:outline-none focus:border-[#4a2c2a] text-black bg-white"
              />
              <span className="text-[11px] text-gray-500 font-medium">pcs</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block border-t border-gray-100 mt-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Coverage Area</th>
              <th className="py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Tiles Required</th>
              <th className="py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Price</th>
              <th className="py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-right pr-2">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {PACK_PRESETS.map((row, idx) => {
              const qty = quantities[row.boxes] || 0;
              const rowPrice = row.area * pricePerM2;
              const actualPieces = row.boxes * piecesPerBox;

              return (
                <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-white transition-colors">
                  <td className="py-5 text-[12px] font-bold text-[#4a2c2a]">
                    {row.area.toFixed(2)} m²
                  </td>
                  <td className="py-5 text-[12px] text-gray-600">
                    {actualPieces} pcs
                  </td>
                  <td className="py-5 text-[12px] font-bold text-[#4a2c2a]">
                    £{rowPrice.toFixed(2)}
                  </td>
                  <td className="py-5 text-right flex justify-end">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleQtyChange(row.boxes, -1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-sm text-gray-400 bg-white hover:border-gray-300 disabled:opacity-50 transition-colors"
                        disabled={qty <= 0}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                      </button>
                      <span className="w-4 text-center text-[12px] font-bold text-[#4a2c2a]">
                        {qty}
                      </span>
                      <button
                        onClick={() => handleQtyChange(row.boxes, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-sm text-white bg-[#4a2c2a] hover:bg-[#3a1c1a] transition-colors shadow-sm"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {/* Custom Pieces Row */}
            <tr className="border-b border-gray-100 last:border-0 hover:bg-white transition-colors">
              <td className="py-5 text-[12px] font-bold text-[#4a2c2a]">
                {customArea.toFixed(2)} m²
              </td>
              <td className="py-5 text-[12px] text-gray-600">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter pieces"
                    value={customPieces}
                    onChange={(e) => handleCustomPiecesChange(e.target.value)}
                    className="w-28 px-2 py-1.5 border border-gray-200 text-[12px] rounded focus:outline-none focus:border-[#4a2c2a] text-black bg-white"
                  />
                  <span>pcs</span>
                </div>
              </td>
              <td className="py-5 text-[12px] font-bold text-[#4a2c2a]">
                £{customPrice.toFixed(2)}
              </td>
              <td className="py-5 text-right flex justify-end">
                <button
                  onClick={() => setCustomPieces("")}
                  disabled={!customPieces}
                  className="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-wider disabled:opacity-30"
                >
                  Clear
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <button
          onClick={handleAddToCart}
          disabled={!hasItems || isAdding}
          className={`w-full py-4 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 flex items-center justify-center gap-3 rounded-sm
            ${isSuccess
              ? "bg-green-600 text-white"
              : !hasItems 
                ? "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
                : "bg-[#4a2c2a] text-white hover:bg-[#3a1c1a] shadow-md"
            }`}
        >
          {isAdding ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isSuccess ? (
            "Added to Cart"
          ) : (
            "ADD TO CART"
          )}
        </button>
      </div>
    </div>
  );
}
