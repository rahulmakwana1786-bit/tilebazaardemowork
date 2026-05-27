import React from "react";
import TileCalculator from "@/components/calculator/TileCalculator";

export const metadata = {
  title: "Tile Calculator | Premium Tile Quantity Estimator",
  description: "Calculate the exact number of tiles needed for your project with our advanced tile calculator. Account for wastage, patterns, and packaging seamlessly.",
};

export default function TileCalculatorPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFB] font-sans selection:bg-[#4a2c2a] selection:text-white">
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 relative overflow-hidden bg-white">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-[1300px] mx-auto px-6 md:px-10 relative z-10 text-center">
          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-[#4a2c2a] mb-6">
            Project Planning
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-[#4a2c2a] tracking-tight leading-[1.1] mb-6">
            Intelligent Tile <br className="hidden md:block" />
            <span className="italic font-light text-gray-500">Calculator</span>
          </h1>
          <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Eliminate the guesswork from your next architectural project. Enter your room dimensions and preferred layout to receive a precise, production-ready material estimate.
          </p>
        </div>
      </section>

      {/* Main Calculator App */}
      <section className="bg-gray-50/50 border-t border-gray-100">
        <TileCalculator />
      </section>

      {/* FAQ / How it works Section */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-[1000px] mx-auto px-6 md:px-10">
          <header className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-[#4a2c2a] mb-4">How It Works</h2>
            <p className="text-sm text-gray-500">Understanding the math behind your premium tile installation.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h4 className="text-lg font-serif text-[#4a2c2a]">Why add wastage?</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                During installation, tiles must be cut to fit edges, corners, and fixtures. Breakages can also occur. We recommend a standard 10% wastage for straight lays, and 15% for complex patterns like herringbone or diagonal to ensure you have enough material to complete the job seamlessly.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-serif text-[#4a2c2a]">Box Quantities</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Premium tiles are sold in full boxes to protect them during shipping. Our calculator automatically rounds up your total tile count to the nearest full box based on the specific dimensions of the tile you selected.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-serif text-[#4a2c2a]">Measuring Your Space</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Measure the maximum length and width of your room. If your room is L-shaped, break it down into two separate rectangular sections, calculate them individually, and add the total tile count together.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-serif text-[#4a2c2a]">Matching Batches</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Ordering slightly more than you need is crucial for luxury ceramics. Tiles are produced in distinct "batches" which may have microscopic shade variations. Running short and ordering later risks a mismatch in tonality.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
