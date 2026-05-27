"use client";
import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  IoOptionsOutline,
  IoChevronDownOutline,
  IoCloseOutline,
} from "react-icons/io5";

const FINISH_OPTIONS = ["GLOSS", "MATT", "CARVING", "HIGHGL", "PUNCHGL"];

export default function FilterInterface({
  activeFinish,
  activeSort,
}: {
  activeFinish?: string;
  activeSort?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("sort", e.target.value);
    } else {
      params.delete("sort");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const toggleFilter = (val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (activeFinish === val) params.delete("finish");
    else params.set("finish", val);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      {/* Top Action Bar */}
      <div className="flex justify-between items-center text-[11px] mb-8 border-b border-gray-100 pb-4 uppercase tracking-[0.2em] font-bold text-[#4a2c2a]">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 hover:opacity-60 transition-opacity"
        >
          Show Filters <IoOptionsOutline size={16} />
        </button>
        <div className="flex items-center gap-2">
          <span className="opacity-40">Sort By:</span>
          <select
            value={activeSort || ""}
            onChange={handleSortChange}
            className="bg-transparent border-none outline-none cursor-pointer"
          >
            <option value="">Default</option>
            <option value="name-asc">Alphabetical (A-Z)</option>
            <option value="name-desc">Alphabetical (Z-A)</option>
            <option value="price-low">Price (Low to High)</option>
            <option value="price-high">Price (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Pill Tags */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar mb-10 pb-2">
        {FINISH_OPTIONS.map((f) => (
          <button
            key={f}
            onClick={() => toggleFilter(f)}
            className={`px-7 py-2.5 rounded-full border text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
              activeFinish === f
                ? "bg-[#4a2c2a] text-white border-[#4a2c2a]"
                : "bg-[#f4f1f0] text-[#4a2c2a] border-transparent hover:border-gray-200"
            }`}
          >
            {f === "PUNCHGL" ? "POSTER" : `${f} TILES`}
          </button>
        ))}
      </div>

      {/* Sidebar Drawer */}
      <div
        className={`fixed inset-0 bg-black/40 z-[100] transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`fixed top-0 left-0 h-full w-full max-w-[420px] bg-white z-[101] shadow-2xl transition-transform duration-500 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-serif text-[#4a2c2a]">Filters</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:rotate-90 transition-transform"
          >
            <IoCloseOutline size={30} />
          </button>
        </div>

        <div className="flex-grow p-8 space-y-10 overflow-y-auto">
          <div className="space-y-4">
            <h4 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#4a2c2a] flex justify-between items-center">
              Finish <IoChevronDownOutline />
            </h4>
            <div className="grid grid-cols-1 gap-4 pt-2">
              {FINISH_OPTIONS.map((f) => (
                <label
                  key={f}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={activeFinish === f}
                    onChange={() => toggleFilter(f)}
                    className="w-5 h-5 border-gray-300 rounded-none accent-[#4a2c2a] cursor-pointer"
                  />
                  <span className="text-[14px] uppercase tracking-tight text-[#4a2c2a] opacity-70 group-hover:opacity-100">
                    {f === "PUNCHGL" ? "POSTER" : f.replace("GL", " GLOSS")}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full bg-[#4a2c2a] text-white py-5 text-[12px] font-bold uppercase tracking-[0.3em] hover:bg-[#3d2422] transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
