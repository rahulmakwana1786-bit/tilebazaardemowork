"use client";

import React from "react";
import { ArrowRight, Package, Grid2X2 } from "lucide-react";

interface ResultCardProps {
  roomAreaSqm: number;
  roomAreaSqft: number;
  baseTiles: number;
  wastageTiles: number;
  totalTiles: number;
  totalBoxes: number;
  tilesPerBox: number;
  coverageSqm: number;
  isValid: boolean;
}

export default function ResultCard({
  roomAreaSqm,
  roomAreaSqft,
  baseTiles,
  wastageTiles,
  totalTiles,
  totalBoxes,
  tilesPerBox,
  coverageSqm,
  isValid,
}: ResultCardProps) {
  
  if (!isValid) {
    return (
      <div className="bg-[#4a2c2a] rounded-xl p-8 shadow-xl text-white sticky top-28 h-auto flex flex-col justify-center items-center text-center min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6">
          <Grid2X2 className="text-white/40" size={32} />
        </div>
        <h3 className="text-2xl font-serif mb-3">Ready to Calculate</h3>
        <p className="text-sm text-white/60 leading-relaxed max-w-[250px]">
          Enter your room dimensions and select a tile size to see your estimated requirements.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#4a2c2a] rounded-xl p-8 shadow-xl text-white sticky top-28">
      <h3 className="text-xl font-serif mb-8 border-b border-white/10 pb-4">Estimate Summary</h3>
      
      {/* Area */}
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Total Project Area</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">{roomAreaSqm.toFixed(2)}</span>
          <span className="text-sm text-white/70">m²</span>
        </div>
        <p className="text-xs text-white/50 mt-1">({roomAreaSqft.toFixed(2)} sq.ft)</p>
      </div>

      {/* Tiles Breakdown */}
      <div className="space-y-4 mb-8 bg-white/5 p-5 rounded-lg border border-white/10">
        <div className="flex justify-between items-center">
          <span className="text-sm text-white/70">Required Tiles</span>
          <span className="font-bold">{baseTiles} pieces</span>
        </div>
        <div className="flex justify-between items-center text-rose-200">
          <span className="text-sm">Extra (Wastage)</span>
          <span className="font-bold">+{wastageTiles} pieces</span>
        </div>
        <div className="w-full h-[1px] bg-white/20 my-2" />
        <div className="flex justify-between items-center text-lg">
          <span className="font-serif">Total Tiles</span>
          <span className="font-bold">{totalTiles}</span>
        </div>
      </div>

      {/* Boxes */}
      <div className="mb-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Packaging Requirement</p>
        <div className="flex items-center gap-4 bg-gradient-to-r from-[#5a3c3a] to-[#4a2c2a] p-4 rounded-lg border border-[#6a4c4a]">
          <Package size={32} className="text-rose-200" />
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{totalBoxes}</span>
              <span className="text-sm text-white/70">Boxes</span>
            </div>
            <p className="text-[10px] text-white/50 uppercase tracking-wider mt-1">{tilesPerBox} tiles per box</p>
          </div>
        </div>
        <p className="text-xs text-white/60 mt-4 text-center">
          Coverage: <strong className="text-white">{coverageSqm.toFixed(2)} m²</strong>
        </p>
      </div>

      <button className="w-full bg-white text-[#4a2c2a] py-4 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-2">
        Shop Collection <ArrowRight size={16} />
      </button>
      
      <p className="text-[10px] text-white/40 text-center mt-4">
        Estimates are approximate. We recommend double-checking with your installer.
      </p>
    </div>
  );
}
