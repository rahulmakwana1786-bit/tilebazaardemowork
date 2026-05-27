"use client";

import React from "react";
import { motion } from "framer-motion";

export type Unit = "Feet" | "Meter" | "Inch" | "CM";

interface MeasurementInputProps {
  length: string;
  width: string;
  unit: Unit;
  onLengthChange: (val: string) => void;
  onWidthChange: (val: string) => void;
  onUnitChange: (val: Unit) => void;
}

const UNITS: Unit[] = ["Feet", "Meter", "Inch", "CM"];

export default function MeasurementInput({
  length,
  width,
  unit,
  onLengthChange,
  onWidthChange,
  onUnitChange,
}: MeasurementInputProps) {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 md:p-8 shadow-sm border border-gray-100/50 mb-6">
      <h3 className="text-lg font-serif text-[#4a2c2a] mb-6 flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-rose-800 text-sm font-bold">1</span>
        Room Dimensions
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Length Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Length</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={length}
              onChange={(e) => onLengthChange(e.target.value)}
              placeholder="e.g. 10"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3.5 text-[#4a2c2a] text-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#4a2c2a]/20 focus:border-[#4a2c2a] transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
              {unit}
            </span>
          </div>
        </div>

        {/* Width Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Width</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={width}
              onChange={(e) => onWidthChange(e.target.value)}
              placeholder="e.g. 12"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3.5 text-[#4a2c2a] text-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#4a2c2a]/20 focus:border-[#4a2c2a] transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
              {unit}
            </span>
          </div>
        </div>
      </div>

      {/* Unit Selector */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Measurement Unit</label>
        <div className="flex flex-wrap gap-3">
          {UNITS.map((u) => (
            <button
              key={u}
              onClick={() => onUnitChange(u)}
              className={`relative px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                unit === u
                  ? "text-white shadow-md"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {unit === u && (
                <motion.div
                  layoutId="unit-active"
                  className="absolute inset-0 bg-[#4a2c2a] rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {u}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
