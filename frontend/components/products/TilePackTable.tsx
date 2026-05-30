"use client";

import React, { useState } from "react";
import { IoAddOutline, IoRemoveOutline } from "react-icons/io5";

interface TilePackTableProps {
  pricePerSqm: number;
  tileSize: string;
  onAddToCart: (totalSqm: number, totalBoxes: number, totalWeight: number, totalTiles: number) => void;
}

export default function TilePackTable({ pricePerSqm, tileSize, onAddToCart }: TilePackTableProps) {
  // Determine standard box tiers based on user requirement
  const boxTiers = [7, 10, 13, 15, 18];
  
  // 1 box is always 1.44m2
  const sqmPerBox = 1.44;
  const tilesPerBox = tileSize.includes("1200") ? 2 : 4;
  const weightPerBox = 29; // 29kg per box based on existing logic

  // State to track quantity selected for each tier (index-based)
  const [quantities, setQuantities] = useState<number[]>(new Array(boxTiers.length).fill(0));

  const handleIncrement = (index: number) => {
    const next = [...quantities];
    next[index] += 1;
    setQuantities(next);
  };

  const handleDecrement = (index: number) => {
    const next = [...quantities];
    if (next[index] > 0) {
      next[index] -= 1;
      setQuantities(next);
    }
  };

  const handleAddToCart = () => {
    let totalBoxes = 0;
    
    quantities.forEach((qty, index) => {
      totalBoxes += qty * boxTiers[index];
    });

    if (totalBoxes > 0) {
      const totalSqm = totalBoxes * sqmPerBox;
      const totalTiles = totalBoxes * tilesPerBox;
      const totalWeight = totalBoxes * weightPerBox;
      
      onAddToCart(totalSqm, totalBoxes, totalWeight, totalTiles);
      
      // Reset after adding
      setQuantities(new Array(boxTiers.length).fill(0));
    }
  };

  const isCartActive = quantities.some((q) => q > 0);

  return (
    <div className="bg-[#f8f6f3] text-[#4a2c2a] rounded-sm p-6 mb-8 border border-[#4a2c2a]/10 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-serif tracking-wide text-[#4a2c2a] mb-1">Select Tile Pack</h3>
        <p className="text-xs text-gray-500">Choose your coverage area for faster checkout</p>
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#4a2c2a]/20 text-[#4a2c2a]/70 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-2">Coverage Area</th>
              <th className="py-3 px-2">Tiles Required</th>
              <th className="py-3 px-2">Price</th>
              <th className="py-3 px-2 text-center">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {boxTiers.map((boxes, index) => {
              const sqm = boxes * sqmPerBox;
              const tiles = boxes * tilesPerBox;
              const price = sqm * pricePerSqm;
              
              return (
                <tr key={index} className="border-b border-[#4a2c2a]/10 hover:bg-[#4a2c2a]/5 transition-colors">
                  <td className="py-4 px-2 font-bold text-[13px]">{sqm.toFixed(2)} m²</td>
                  <td className="py-4 px-2 text-gray-600">{tiles} pcs</td>
                  <td className="py-4 px-2 font-bold text-[13px]">£{price.toFixed(2)}</td>
                  <td className="py-4 px-2">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleDecrement(index)}
                        className="w-8 h-8 flex items-center justify-center bg-white border border-[#4a2c2a]/20 hover:border-[#4a2c2a] text-[#4a2c2a] transition-colors rounded-sm"
                      >
                        <IoRemoveOutline size={16} />
                      </button>
                      <span className="w-6 text-center font-bold">{quantities[index]}</span>
                      <button
                        onClick={() => handleIncrement(index)}
                        className="w-8 h-8 flex items-center justify-center bg-[#4a2c2a] text-white hover:bg-[#3a2220] transition-colors rounded-sm shadow-sm"
                      >
                        <IoAddOutline size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={!isCartActive}
        className={`w-full py-4 uppercase tracking-[0.2em] text-[11px] font-bold rounded-sm transition-all duration-300 shadow-sm ${
          isCartActive 
          ? "bg-[#4a2c2a] text-white hover:bg-[#3a2220] hover:shadow-md hover:-translate-y-[1px]" 
          : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        Add To Cart
      </button>
    </div>
  );
}
