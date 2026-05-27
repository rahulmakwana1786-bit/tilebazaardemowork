"use client";

import React, { useState, useMemo, useEffect } from "react";
import MeasurementInput, { Unit } from "./MeasurementInput";
import TileSizeSelector, { PRESET_SIZES } from "./TileSizeSelector";
import PatternSelector, { Pattern } from "./PatternSelector";
import ResultCard from "./ResultCard";

// Helper to convert any unit to meters
const toMeters = (val: number, unit: Unit) => {
  switch (unit) {
    case "Feet": return val * 0.3048;
    case "Inch": return val * 0.0254;
    case "CM": return val * 0.01;
    case "Meter": return val;
    default: return val;
  }
};

export default function TileCalculator() {
  // Measurement State
  const [lengthStr, setLengthStr] = useState("");
  const [widthStr, setWidthStr] = useState("");
  const [unit, setUnit] = useState<Unit>("Feet");

  // Tile Size State (mm)
  const [selectedPreset, setSelectedPreset] = useState("600x1200");
  const [tileLengthStr, setTileLengthStr] = useState("1200");
  const [tileWidthStr, setTileWidthStr] = useState("600");

  // Layout & Wastage State
  const [pattern, setPattern] = useState<Pattern>("Straight");
  const [wastagePercent, setWastagePercent] = useState(10);

  // Handlers
  const handlePresetChange = (preset: string, length: number, width: number) => {
    setSelectedPreset(preset);
    if (preset !== "Custom") {
      setTileLengthStr(length.toString());
      setTileWidthStr(width.toString());
    }
  };

  const handlePatternChange = (p: Pattern, recommendedWastage: number) => {
    setPattern(p);
    setWastagePercent(recommendedWastage);
  };

  // Calculations
  const calculations = useMemo(() => {
    const rLength = parseFloat(lengthStr) || 0;
    const rWidth = parseFloat(widthStr) || 0;
    const tLength = parseFloat(tileLengthStr) || 0;
    const tWidth = parseFloat(tileWidthStr) || 0;

    const isValid = rLength > 0 && rWidth > 0 && tLength > 0 && tWidth > 0;

    if (!isValid) {
      return { isValid: false, roomAreaSqm: 0, roomAreaSqft: 0, baseTiles: 0, wastageTiles: 0, totalTiles: 0, totalBoxes: 0, tilesPerBox: 2, coverageSqm: 0 };
    }

    // Convert room dimensions to meters
    const lengthM = toMeters(rLength, unit);
    const widthM = toMeters(rWidth, unit);
    const roomAreaSqm = lengthM * widthM;
    const roomAreaSqft = roomAreaSqm * 10.7639;

    // Convert tile dimensions from mm to meters
    const tLengthM = tLength / 1000;
    const tWidthM = tWidth / 1000;
    const tileAreaSqm = tLengthM * tWidthM;

    // Base tiles needed (exact math)
    const exactTiles = roomAreaSqm / tileAreaSqm;
    const baseTiles = Math.ceil(exactTiles);
    
    // Wastage
    const exactWastage = exactTiles * (wastagePercent / 100);
    const wastageTiles = Math.ceil(exactWastage);

    const totalTiles = baseTiles + wastageTiles;

    // Determine smart default for tiles per box based on size
    let tilesPerBox = 2; // Default for large formats
    if (tLength <= 600 && tWidth <= 600) tilesPerBox = 4;
    else if (tLength <= 800 && tWidth <= 800) tilesPerBox = 3;
      
    const totalBoxes = Math.ceil(totalTiles / tilesPerBox);
    const coverageSqm = totalBoxes * tilesPerBox * tileAreaSqm;

    return {
      isValid,
      roomAreaSqm,
      roomAreaSqft,
      baseTiles,
      wastageTiles,
      totalTiles,
      totalBoxes,
      tilesPerBox,
      coverageSqm
    };
  }, [lengthStr, widthStr, unit, tileLengthStr, tileWidthStr, wastagePercent]);

  return (
    <div className="flex flex-col lg:flex-row gap-10 items-start max-w-[1300px] mx-auto px-6 md:px-10 py-12">
      {/* Left Column - Inputs */}
      <div className="w-full lg:w-2/3">
        <MeasurementInput 
          length={lengthStr}
          width={widthStr}
          unit={unit}
          onLengthChange={setLengthStr}
          onWidthChange={setWidthStr}
          onUnitChange={setUnit}
        />

        <TileSizeSelector 
          selectedPreset={selectedPreset}
          customLength={tileLengthStr}
          customWidth={tileWidthStr}
          onPresetChange={handlePresetChange}
          onCustomLengthChange={setTileLengthStr}
          onCustomWidthChange={setTileWidthStr}
        />

        <PatternSelector 
          pattern={pattern}
          wastagePercent={wastagePercent}
          onPatternChange={handlePatternChange}
          onWastageChange={setWastagePercent}
        />
      </div>

      {/* Right Column - Results Sticky Panel */}
      <div className="w-full lg:w-1/3">
        <ResultCard {...calculations} />
      </div>
    </div>
  );
}
