"use client";

import React from "react";
import { motion } from "framer-motion";
import { LayoutGrid, TrendingUp, Grid3x3 } from "lucide-react";

export type Pattern = "Straight" | "Diagonal" | "Herringbone";

interface PatternSelectorProps {
  pattern: Pattern;
  wastagePercent: number;
  onPatternChange: (p: Pattern, recommendedWastage: number) => void;
  onWastageChange: (w: number) => void;
}

const PATTERNS: { name: Pattern; wastage: number; icon: React.ReactNode }[] = [
  { name: "Straight", wastage: 10, icon: <LayoutGrid size={24} /> },
  { name: "Diagonal", wastage: 15, icon: <TrendingUp size={24} /> },
  { name: "Herringbone", wastage: 15, icon: <Grid3x3 size={24} /> },
];

export default function PatternSelector({
  pattern,
  wastagePercent,
  onPatternChange,
  onWastageChange,
}: PatternSelectorProps) {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 md:p-8 shadow-sm border border-gray-100/50 mb-6">
      <h3 className="text-lg font-serif text-[#4a2c2a] mb-6 flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-rose-800 text-sm font-bold">3</span>
        Layout & Wastage
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {PATTERNS.map((p) => (
          <button
            key={p.name}
            onClick={() => onPatternChange(p.name, p.wastage)}
            className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all gap-3 ${
              pattern === p.name
                ? "border-[#4a2c2a] bg-[#4a2c2a]/5 text-[#4a2c2a]"
                : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
            }`}
          >
            <div className={`${pattern === p.name ? "text-[#4a2c2a]" : "text-gray-400"}`}>
              {p.icon}
            </div>
            <div className="text-center">
              <span className="block text-sm font-bold tracking-tight">{p.name}</span>
              <span className="text-[10px] uppercase font-bold opacity-60">Rec. {p.wastage}% waste</span>
            </div>

            {pattern === p.name && (
              <motion.div
                layoutId="pattern-active"
                className="absolute inset-0 border-2 border-[#4a2c2a] rounded-xl z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                style={{ originX: 0, originY: 0 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Manual Wastage Override */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
          Adjust Wastage %
        </label>
        <div className="flex flex-wrap gap-3">
          {[5, 10, 15, 20].map((w) => (
            <button
              key={w}
              onClick={() => onWastageChange(w)}
              className={`relative px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                wastagePercent === w
                  ? "text-white shadow-md"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {wastagePercent === w && (
                <motion.div
                  layoutId="wastage-active"
                  className="absolute inset-0 bg-gray-800 rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {w}%
            </button>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 font-medium mt-3">
          * {wastagePercent}% is added to your total area to account for cuts, breakages, and pattern matching.
        </p>
      </div>
    </div>
  );
}
