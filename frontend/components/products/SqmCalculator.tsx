"use client";

import React, { useState, useEffect } from "react";

interface SqmCalculatorProps {
  pricePerSqm: number;
  tileSize: string;
  onUpdate: (data: {
    sqm: number;
    boxes: number;
    tiles: number;
    weight: number;
    palletType: string;
    subtotal: number;
  }) => void;
}

const calculatePallets = (weight: number) => {
  if (weight <= 25) return "PARCEL";
  if (weight <= 250) return "QUARTER";
  if (weight <= 500) return "HALF";
  if (weight <= 750) return "FULL LIGHT";
  if (weight <= 1000) return "FULL";

  const fullPallets = Math.floor(weight / 1000);
  const remainder = weight % 1000;

  let remainderType = "";
  if (remainder > 0) {
    if (remainder <= 25) remainderType = "PARCEL";
    else if (remainder <= 250) remainderType = "QUARTER";
    else if (remainder <= 500) remainderType = "HALF";
    else if (remainder <= 750) remainderType = "FULL LIGHT";
    else remainderType = "FULL";
  }

  return `${fullPallets} FULL${remainderType ? ` & 1 ${remainderType}` : ""}`;
};

export default function SqmCalculator({ pricePerSqm, tileSize, onUpdate }: SqmCalculatorProps) {
  const [sqm, setSqm] = useState<number>(100);

  const tilesPerBox = tileSize.includes("1200") ? 2 : 4;

  const boxes = Math.ceil(sqm / 1.44);
  const totalTiles = boxes * tilesPerBox;
  const weight = boxes * 29;
  const palletType = calculatePallets(weight);
  const subtotal = sqm * pricePerSqm;

  useEffect(() => {
    onUpdate({ sqm, boxes, tiles: totalTiles, weight, palletType, subtotal });
  }, [sqm, boxes, totalTiles, weight, palletType, subtotal, onUpdate]);

  const handleSqmChange = (val: number) => {
    if (val < 0) val = 0;
    setSqm(val);
  };

  const progressPercentage = Math.min((sqm / 500) * 100, 100);

  return (
    <div className="bg-[#f8f6f3] text-[#4a2c2a] rounded-sm p-6 mb-8 border border-[#4a2c2a]/10">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-lg font-serif tracking-wide text-[#4a2c2a] mb-1">Coverage Area</h3>
          <p className="text-xs text-gray-500">Enter your required SQM</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => handleSqmChange(sqm - 1)}
          className="w-12 h-12 flex items-center justify-center bg-white border border-[#4a2c2a]/30 text-[#4a2c2a] hover:bg-[#4a2c2a] hover:text-white transition-colors rounded-sm text-xl font-bold"
        >
          -
        </button>
        <div className="flex-1 relative">
          <input
            type="number"
            value={sqm}
            onChange={(e) => handleSqmChange(Number(e.target.value))}
            className="w-full bg-white border border-[#4a2c2a]/30 text-center text-xl font-bold py-3 text-[#4a2c2a] focus:outline-none focus:border-[#4a2c2a] transition-colors rounded-sm"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black uppercase tracking-widest text-[#4a2c2a]/50">
            SQM
          </span>
        </div>
        <button
          onClick={() => handleSqmChange(sqm + 1)}
          className="w-12 h-12 flex items-center justify-center bg-white border border-[#4a2c2a]/30 text-[#4a2c2a] hover:bg-[#4a2c2a] hover:text-white transition-colors rounded-sm text-xl font-bold"
        >
          +
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[1, 5, 10, 20, 50, 100].map((val) => (
          <button
            key={val}
            onClick={() => handleSqmChange(val)}
            className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white border border-[#4a2c2a]/20 text-[#4a2c2a]/70 hover:text-white hover:bg-[#4a2c2a] transition-all rounded-full"
          >
            {val} SQM
          </button>
        ))}
      </div>
    </div>
  );
}
