"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export const PRESET_SIZES = [
  { label: "600x600", length: 600, width: 600, unit: "mm" },
  { label: "600x1200", length: 1200, width: 600, unit: "mm" },
  { label: "1200x1200", length: 1200, width: 1200, unit: "mm" },
];

interface TileSizeSelectorProps {
  selectedPreset: string;
  customLength: string;
  customWidth: string;
  onPresetChange: (preset: string, length: number, width: number) => void;
  onCustomLengthChange: (val: string) => void;
  onCustomWidthChange: (val: string) => void;
}

export default function TileSizeSelector({
  selectedPreset,
  customLength,
  customWidth,
  onPresetChange,
  onCustomLengthChange,
  onCustomWidthChange,
}: TileSizeSelectorProps) {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 md:p-8 shadow-sm border border-gray-100/50 mb-6">
      <h3 className="text-lg font-serif text-[#4a2c2a] mb-6 flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-rose-800 text-sm font-bold">2</span>
        Tile Size
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {PRESET_SIZES.map((size) => (
          <button
            key={size.label}
            onClick={() => onPresetChange(size.label, size.length, size.width)}
            className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
              selectedPreset === size.label
                ? "border-[#4a2c2a] bg-[#4a2c2a]/5 text-[#4a2c2a]"
                : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
            }`}
          >
            <span className="text-sm font-bold tracking-tight">{size.label}</span>
            {size.label !== "Custom" && <span className="text-[10px] uppercase font-bold opacity-60">mm</span>}
            
            {selectedPreset === size.label && (
              <motion.div
                layoutId="tilesize-active"
                className="absolute inset-0 border-2 border-[#4a2c2a] rounded-xl z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                style={{ originX: 0, originY: 0 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Custom Size Inputs */}
      {selectedPreset === "Custom" && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden"
        >
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Tile Length (mm)</label>
            <input
              type="number"
              min="0"
              value={customLength}
              onChange={(e) => onCustomLengthChange(e.target.value)}
              placeholder="e.g. 800"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3.5 text-[#4a2c2a] text-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#4a2c2a]/20 focus:border-[#4a2c2a] transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Tile Width (mm)</label>
            <input
              type="number"
              min="0"
              value={customWidth}
              onChange={(e) => onCustomWidthChange(e.target.value)}
              placeholder="e.g. 800"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3.5 text-[#4a2c2a] text-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#4a2c2a]/20 focus:border-[#4a2c2a] transition-all"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
