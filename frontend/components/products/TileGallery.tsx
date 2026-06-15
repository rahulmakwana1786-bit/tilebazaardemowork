"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import AddToCartButton from "@/components/common/AddToCartButton";
import { useSearchParams, usePathname } from "next/navigation";
import previewMap from "@/app/previewMap.json";

interface TileGalleryProps {
  initialImages?: string[];
  initialPreviews?: string[];
}

const getFinish = (fileName: string) => {
  const name = fileName.toUpperCase();
  if (name.includes("--GLOSSY") || name.includes("--GLOSS")) return "GLOSSY";
  if (name.includes("--MATT") && !name.includes("--MATTING")) return "MATT";
  if (name.includes("PAVE") || name.includes("SALTED CONCRETO")) return "MATT";
  if (name.includes("--CARVING")) return "CARVING";
  if (name.includes("--HIGHGL")) return "HIGH GLOSS";
  if (name.includes("--PUNCHGL")) return "POSTER";
  if (name.includes("--LOVIN")) return "LOVELIN";
  if (name.includes("--TPH")) return "TYPHOON";
  return "OTHER";
};

const formatFileName = (name: string) => {
  let clean = name.split("--")[0].replace(/\.[^/.]+$/, "").replace(/-/g, " ").trim();
  const upper = clean.toUpperCase();
  if (upper === "TILE TRIM") {
    return "10mm Straight Edge Aluminium Basalt Effect Tile Trim - 2.5m";
  }
  if (upper.includes("AURL GRIGIO")) {
    return "AURL GRIGIO ARCO";
  }
  if (upper.includes("PAVE")) {
    return "PAVE’ PARIS G";
  }
  if (upper.includes("SALT CONCRETO") || upper.includes("SALTED CONCRETO")) {
    return "Salted concreto crema";
  }
  return clean;
};

const getProductDetails = (fileName: string) => {
  const upper = fileName.toUpperCase();
  if (upper.includes("TRIM")) return { price: 8, unit: "+vat/piece", isAccessory: true };
  if (upper.includes("SPACER")) return { price: 6, unit: "+vat/bag", isAccessory: true };
  if (upper.includes("WEDGE")) return { price: 6, unit: "+vat/bag", isAccessory: true };
  if (upper.includes("ADHESIVE") || upper.includes("GLUE")) return { price: 12, unit: "+vat/bag", isAccessory: true };
  if (upper.includes("MATTING")) return { price: 6, unit: "+vat/sqm", isAccessory: true };
  // New Arrivals & Outdoor tiles are priced at £18
  if (upper.includes("AURL GRIGIO") || upper.includes("PAVE") || upper.includes("SALT CONCRETO") || upper.includes("SALTED CONCRETO") || upper.includes("OUTDOOR")) return { price: 18, unit: "m²", isAccessory: false };
  // All other tiles default to £15
  return { price: 15, unit: "m²", isAccessory: false };
};

const getPreviewUrl = (
  imagePath: string,
  size: string,
  previewPaths: string[]
): string | null => {
  if (!previewPaths || previewPaths.length === 0) return null;

  // Normalize helper
  const normalize = (name: string) => {
    const nameWithoutQuery = name.split("?")[0];
    let norm = nameWithoutQuery
      .toLowerCase()
      .replace(/\.(jpg|jpeg|png|webp|avif)/g, "") // remove all extensions
      .replace(/\.[^/.]+$/, "")                  // remove any remaining extension
      .split("--")[0]                            // remove suffix like --GLOSS
      .replace(/[^a-z0-9]/g, "");                // remove all non-alphanumeric characters
    
    // Handle spelling inconsistencies
    norm = norm.replace(/brwon/g, "brown");
    norm = norm.replace(/earharo/g, "eartharo");
    return norm;
  };

  const targetSize = size.toLowerCase().replace(/\s/g, ""); // e.g. "600x600" or "600x1200"

  const urlWithoutQuery = imagePath.split("?")[0];
  const fileNameOnly = urlWithoutQuery.split("/").pop() || urlWithoutQuery;

  let normalizedFile = normalize(fileNameOnly);
  
  if (imagePath.includes("?")) {
    try {
      const queryStr = imagePath.split("?")[1];
      const params = new URLSearchParams(queryStr);
      const nameParam = params.get("name");
      if (nameParam) {
        normalizedFile = normalize(nameParam);
      }
    } catch (e) {
      console.error("Error parsing name param in getPreviewUrl:", e);
    }
  }

  if (normalizedFile === "lux09r1") {
    normalizedFile = "lux09hl1";
  }
  if (normalizedFile.includes("salted") && (normalizedFile.includes("concreto") || normalizedFile.includes("concrete"))) {
    normalizedFile = "saltedconcretecrema";
  }
  if (normalizedFile === "artefluowhite1" && targetSize === "600x600") {
    normalizedFile = "artefluowhiter1";
  }
  if (normalizedFile.startsWith("phantom")) {
    normalizedFile = "phantomdecor";
  }

  // Filter preview paths to only include paths matching the target size folder
  const sizeFilteredPaths = previewPaths.filter((p) => {
    const normP = p.replace(/\\/g, "/");
    return normP.startsWith(`${targetSize}/`);
  });

  if (sizeFilteredPaths.length === 0) return null;

  // Split into single_tiles and combo_tiles preview arrays for the current size
  const singleTiles: string[] = [];
  const comboTiles: string[] = [];

  for (const pathStr of sizeFilteredPaths) {
    const parts = pathStr.replace(/\\/g, "/").split("/");
    const folder = parts[1]; // e.g. "single_tiles" or "combo_tiles"
    const file = parts[2];   // e.g. "alexa_beige_r1_preview.png"
    if (file) {
      if (folder === "single_tiles") {
        singleTiles.push(file);
      } else if (folder === "combo_tiles") {
        comboTiles.push(file);
      }
    }
  }

  // 1. Check single_tiles
  for (const preview of singleTiles) {
    let normPreview = normalize(preview);
    if (normPreview.endsWith("preview")) {
      normPreview = normPreview.slice(0, -7);
    }
    
    // Custom logic for matching aurl grigio in single_tiles
    if (normalizedFile.includes("aurl") && normalizedFile.includes("grigio")) {
      if (normPreview.includes("aurl") && normPreview.includes("grigio")) {
        return `/previews/${targetSize}/single_tiles/${preview}`;
      }
    }
    
    // Custom logic for matching pave paris in single_tiles
    if (normalizedFile.includes("pave") && normalizedFile.includes("paris")) {
      if (normPreview.includes("pave") && normPreview.includes("paris")) {
        return `/previews/${targetSize}/single_tiles/${preview}`;
      }
    }
    
    if (normalizedFile === normPreview || normalizedFile.startsWith(normPreview) || normPreview.startsWith(normalizedFile)) {
      return `/previews/${targetSize}/single_tiles/${preview}`;
    }
  }

  // 2. Check leftSideVariantsGroup for combo_tiles
  const leftSideVariantsGroup = [
    ["artovel 018 dk", "artovel 018 hl"],
    ["el glitter aqua"],
    ["gl 2509 decor", "gl 2509 lt"],
    ["gl 2511 decor", "gl 2511 lt"],
    ["gl 2513 decore", "gl 2513 lt"],
    ["gl 2514 decore", "gl 2514 lt"],
    ["emparador brown"],
    ["irish red mp 1", "levanto black 3 mo 1"],
    ["luxurious blue"],
    ["phantom decor", "phantom onyx white"],
    ["prizma 08 hl", "prizma 08 lt"],
    ["prizma 26 hl", "prizma 26 lt"],
    ["prizma 27 hl", "prizma 27 lt"],
    ["vectro 1502 hl 2 punch", "vectro 1502 lt"],
    ["vectro 11003 dk", "vectro 11003 hl"],
    ["vectro 11051 hl", "vectro 11051 lt"],
    ["vectro 11080 hl 1", "vectro 11080 hl 2", "vectro 11080 lt"],
    ["vectro 11083 a", "vectro 11083 b", "vectro 11083 c"],
    ["vectro 11110 hl", "vectro 11110 lt"],
    ["waves hl", "waves nero f1"]
  ];

  const getVariantMatchName = (name: string) =>
    name
      .split("--")[0]
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\bR[1-9]\b/gi, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const currentVariantMatch = getVariantMatchName(fileNameOnly);
  
  const matchedGroup = leftSideVariantsGroup.find((group) =>
    group.some((item) => item.toLowerCase() === currentVariantMatch)
  );

  if (matchedGroup) {
    // Try current variant match first
    for (const preview of comboTiles) {
      const normPreview = normalize(preview);
      for (const item of matchedGroup) {
        const normItem = normalize(item);
        if (normPreview === normItem || normPreview.startsWith(normItem) || normItem.startsWith(normPreview)) {
          if (currentVariantMatch === item.toLowerCase()) {
            if (normPreview === normalize(currentVariantMatch)) {
              return `/previews/${targetSize}/combo_tiles/${preview}`;
            }
          }
        }
      }
    }
    // Fall back to any group match
    for (const preview of comboTiles) {
      const normPreview = normalize(preview);
      for (const item of matchedGroup) {
        const normItem = normalize(item);
        if (normPreview === normItem || normPreview.startsWith(normItem) || normItem.startsWith(normPreview)) {
          return `/previews/${targetSize}/combo_tiles/${preview}`;
        }
      }
    }
  }

  // 3. Direct match combo_tiles
  for (const preview of comboTiles) {
    const normPreview = normalize(preview);
    if (normalizedFile === normPreview || normalizedFile.startsWith(normPreview) || normPreview.startsWith(normalizedFile)) {
      return `/previews/${targetSize}/combo_tiles/${preview}`;
    }
  }

  return null;
};

export default function TileGallery({ initialImages = [], initialPreviews = [] }: TileGalleryProps) {
  const [previewPaths, setPreviewPaths] = useState<string[]>(initialPreviews);
  const [imgVersion, setImgVersion] = useState("");

  useEffect(() => {
    setImgVersion(Date.now().toString());
  }, []);

  useEffect(() => {
    if (initialPreviews.length === 0) {
      import("@/app/actions").then((module) => {
        module.getAllPreviewPaths().then((paths) => setPreviewPaths(paths));
      });
    }
  }, [initialPreviews]);

  const searchParams = useSearchParams();
  const pathname = usePathname();

  const finishFilter = searchParams.get("finish");
  const sizeFilter = searchParams.get("size");
  const placementFilter = searchParams.get("placement");

  const accessoriesList = [
    { id: "trim", name: "Tile Trims" },
    { id: "spacer", name: "Spacers" },
    { id: "wedge", name: "Wedges" },
    { id: "adhesive", name: "Adhesive Bags" },
    { id:"matting",name:"dura Elite matting"}
  ];

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    setVisibleCount(12);
  }, [finishFilter, sizeFilter, placementFilter]);

  useEffect(() => {
    const handleScroll = () => setShowTopBtn(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const decodedInitialImages = useMemo(() => {
    return initialImages.map((img) => {
      if (img.includes("%3F") || img.includes("%2F")) {
        try {
          return decodeURIComponent(img);
        } catch {
          // ignore
        }
      }
      return img;
    });
  }, [initialImages]);

  const deduplicatedImages = useMemo(() => {
    // First, filter out the variant/grid images that shouldn't be in the gallery at all
    const baseImages = decodedInitialImages.filter((img) => {
      const fileName = img.split("/").pop() || img;
      const upperName = fileName.toUpperCase();
      const finish = getFinish(fileName);
      const isAccessory = /TRIM|SPACER|WEDGE|ADHESIVE|GLUE|MATTING|LEVEL/.test(upperName);

      // Remove tile images that do not have a recognized finish
      if (!isAccessory && finish === "OTHER") {
        return false;
      }

      // Only show the main AURL image in the products listing, and hide variant/grid images
      if (upperName.startsWith("AURL") && (upperName.includes("(1)") || upperName.includes("(2)") || upperName.includes("(3)") || upperName.includes("(5)"))) {
        return false;
      }
      if (upperName.startsWith("GRID_AURL")) {
        return false;
      }

      // Only show the main PAVE PARIS image in the products listing, and hide variant/grid images
      if (upperName.includes("PAVE") && (upperName.includes("(1)") || upperName.includes("(2)") || upperName.includes("(3)") || upperName.includes("(4)"))) {
        return false;
      }
      if (upperName.includes("GRID_PAVE")) {
        return false;
      }

      // Hide horizontal preview for SALTED CONCRETO in listing
      if (upperName.includes("SALTED CONCRETO") && upperName.includes("(1)")) {
        return false;
      }
      
      return true;
    });

    const grouped = new Map<string, string[]>();
    baseImages.forEach(img => {
      const fileName = img.split("?")[0].split("/").pop() || img;
      let baseName = formatFileName(fileName).toLowerCase();
      if (img.includes("?")) {
        const params = new URLSearchParams(img.split("?")[1]);
        if (params.has("name")) {
          baseName = params.get("name")!.toLowerCase();
        }
      }
      
      let size = "OTHER";
      if (img.includes("?size=")) {
        size = img.split("?size=")[1].split("&")[0];
      } else if (img.split("/").length > 1 && !img.startsWith("http")) {
        const parts = img.split("?")[0].split("/");
        const sizeFolder = parts.find(p => p.toLowerCase().includes("x") && /\d+x\d+/i.test(p));
        if (sizeFolder) {
          size = sizeFolder;
        } else if (parts[0] !== "comingsoon" && parts[0].includes("x")) {
          size = parts[0];
        }
      }
      
      const key = `${baseName}_${size}`;
      
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(img);
    });

    const result: string[] = [];
    grouped.forEach((images) => {
      if (images.length > 1) {
        const nonMatt = images.filter(img => {
          const fileName = img.split("/").pop() || img;
          return getFinish(fileName) !== "MATT";
        });
        
        if (nonMatt.length > 0) {
          // If a non-MATT version exists, discard the MATT versions from the gallery
          result.push(...nonMatt);
        } else {
          result.push(...images);
        }
      } else {
        result.push(images[0]);
      }
    });
    return result;
  }, [decodedInitialImages]);

  const { uniqueSizes, uniqueFinishes, uniqueComingSoonSizes } = useMemo(() => {
    const sizes = new Set<string>();
    const finishes = new Set<string>();
    const csSizes = new Set<string>();
    
    deduplicatedImages.forEach((img) => {
      const isComingSoon = img.includes("comingsoon/");
      
      let size = "OTHER";
      if (img.includes("?size=")) {
        size = img.split("?size=")[1].split("&")[0];
      } else if (img.split("/").length > 1 && !img.startsWith("http")) {
        const parts = img.split("?")[0].split("/");
        const sizeFolder = parts.find(p => p.toLowerCase().includes("x") && /\d+x\d+/i.test(p));
        if (sizeFolder) {
          size = sizeFolder;
        } else if (parts[0] !== "comingsoon" && parts[0].includes("x")) {
          size = parts[0];
        }
      }
      size = size.toLowerCase();
      
      if (size !== "other") {
        if (isComingSoon) {
          csSizes.add(size);
        } else {
          sizes.add(size);
        }
      }
      
      if (!isComingSoon) {
        const fileName = img.split("?")[0].split("/").pop() || img;
        const finish = getFinish(fileName);
        if (finish !== "OTHER") finishes.add(finish);
      }
    });
    return {
      uniqueSizes: Array.from(sizes).sort(),
      uniqueFinishes: Array.from(finishes).sort(),
      uniqueComingSoonSizes: Array.from(csSizes).sort(),
    };
  }, [deduplicatedImages]);

  const filteredTiles = useMemo(() => {
    return deduplicatedImages.filter((img) => {
      const fileName = img.split("?")[0].split("/").pop() || img;
      const finish = getFinish(fileName);
      const isComingSoon = img.includes("comingsoon/");
      
      let size = "OTHER";
      if (img.includes("?size=")) {
        size = img.split("?size=")[1].split("&")[0];
      } else if (img.split("/").length > 1 && !img.startsWith("http")) {
        const parts = img.split("?")[0].split("/");
        const sizeFolder = parts.find(p => p.toLowerCase().includes("x") && /\d+x\d+/i.test(p));
        if (sizeFolder) {
          size = sizeFolder;
        } else if (parts[0] !== "comingsoon" && parts[0].includes("x")) {
          size = parts[0];
        }
      }
      size = size.toLowerCase();
      
      const upperName = fileName.toUpperCase();
      if (sizeFilter === "accessories") {
        let matchesAccessory = true;
        if (finishFilter) {
          if (finishFilter === "trim")
            matchesAccessory = upperName.includes("TRIM");
          else if (finishFilter === "spacer")
            matchesAccessory = upperName.includes("SPACER");
          else if (finishFilter === "wedge")
            matchesAccessory = upperName.includes("WEDGE");
          else if (finishFilter === "adhesive")
            matchesAccessory =
              upperName.includes("ADHESIVE") || upperName.includes("GLUE");
          else if (finishFilter === "matting")
            matchesAccessory = upperName.includes("MATTING");
          else matchesAccessory = false;
        } else {
          matchesAccessory =
            upperName.includes("TRIM") ||
            upperName.includes("SPACER") ||
            upperName.includes("WEDGE") ||
            upperName.includes("ADHESIVE") ||
            upperName.includes("GLUE") ||
            upperName.includes("MATTING");
        }
        return matchesAccessory;
      } else {
        const isAccessory =
          upperName.includes("TRIM") ||
          upperName.includes("SPACER") ||
          upperName.includes("WEDGE") ||
          upperName.includes("ADHESIVE") ||
          upperName.includes("GLUE") ||
          upperName.includes("MATTING");
        if (isAccessory) return false;

        // Handle Coming Soon products isolation
        if (isComingSoon) {
          if (finishFilter !== "COMING SOON") {
            return false;
          }
        } else {
          if (finishFilter === "COMING SOON") {
            return false;
          }
        }

        // Fetch category from Supabase-mapped image query params
        let category = "";
        if (img.includes("?")) {
          const params = new URLSearchParams(img.split("?")[1]);
          if (params.has("category")) {
            category = params.get("category")!;
          }
        }

        const isOutdoor = category.toLowerCase() === "outdoor tiles";
        const matchesPlacement =
          !placementFilter ||
          (placementFilter === "outdoor" && isOutdoor) ||
          (placementFilter === "indoor" && !isOutdoor);

        const matchesFinish =
          !finishFilter ||
          (finishFilter === "COMING SOON"
            ? true
            : finishFilter === "NEW ARRIVALS"
              ? upperName.startsWith("EXP") || upperName.startsWith("TC") || upperName.startsWith("AURL") || upperName.includes("PAVE") || upperName.includes("SALTED CONCRETO")
              : finish === finishFilter);
        const matchesSize = !sizeFilter || size === sizeFilter;
        return matchesPlacement && matchesFinish && matchesSize;
      }
    });
  }, [finishFilter, sizeFilter, placementFilter, deduplicatedImages]);

  // Helper to create URLs for filters
  const createFilterUrl = (type: "size" | "finish" | "placement", value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(type, value);
    } else {
      params.delete(type);
    }

    if (type === "size") {
      const currentSizeIsAcc = sizeFilter === "accessories";
      const newSizeIsAcc = value === "accessories";
      if (currentSizeIsAcc !== newSizeIsAcc) {
        params.delete("finish");
        params.delete("placement");
      }
    }

    if (type === "finish") {
      const currentIsComingSoon = finishFilter === "COMING SOON";
      const newIsComingSoon = value === "COMING SOON";
      if (currentIsComingSoon !== newIsComingSoon) {
        params.delete("size");
        params.delete("placement");
      }
    }

    return `${pathname}?${params.toString()}`;
  };

  const filterContent = (
    <div className="space-y-12">
      {/* Placement Filter */}
      {sizeFilter !== "accessories" && finishFilter !== "COMING SOON" && (
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">
            Placement
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={createFilterUrl("placement", null)}
              scroll={false}
              onClick={() => setIsMobileFilterOpen(false)}
              className={`px-7 py-3 text-[10px] font-bold uppercase tracking-widest border rounded-full transition-all duration-300 inline-block ${
                placementFilter === null
                  ? "bg-[#4a2c2a] text-white border-[#4a2c2a] shadow-lg"
                  : "bg-white text-[#5e7e95] border-gray-100 hover:border-gray-200"
              }`}
            >
              All Tiles
            </Link>

            <Link
              href={createFilterUrl("placement", "indoor")}
              scroll={false}
              onClick={() => setIsMobileFilterOpen(false)}
              className={`px-7 py-3 text-[10px] font-bold uppercase tracking-widest border rounded-full transition-all duration-300 inline-block ${
                placementFilter === "indoor"
                  ? "bg-[#4a2c2a] text-white border-[#4a2c2a] shadow-lg"
                  : "bg-white text-[#5e7e95] border-gray-100 hover:border-gray-200"
              }`}
            >
              Indoor Tiles
            </Link>

            <Link
              href={createFilterUrl("placement", "outdoor")}
              scroll={false}
              onClick={() => setIsMobileFilterOpen(false)}
              className={`px-7 py-3 text-[10px] font-bold uppercase tracking-widest border rounded-full transition-all duration-300 inline-block ${
                placementFilter === "outdoor"
                  ? "bg-[#4a2c2a] text-white border-[#4a2c2a] shadow-lg"
                  : "bg-white text-[#5e7e95] border-gray-100 hover:border-gray-200"
              }`}
            >
              Outdoor Tiles
            </Link>
          </div>
        </div>
      )}

      {/* Dimensions Filter */}
      {sizeFilter !== "accessories" && finishFilter !== "COMING SOON" && (
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">
            Dimensions
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={createFilterUrl("size", null)}
              scroll={false}
              onClick={() => setIsMobileFilterOpen(false)}
              className={`px-7 py-3 text-[10px] font-bold uppercase tracking-widest border rounded-full transition-all duration-300 inline-block ${
                sizeFilter === null
                  ? "bg-[#4a2c2a] text-white border-[#4a2c2a] shadow-lg"
                  : "bg-white text-[#5e7e95] border-gray-100 hover:border-gray-200"
              }`}
            >
              All Sizes
            </Link>

            {uniqueSizes.map((size) => (
              <Link
                key={size}
                href={createFilterUrl("size", size)}
                scroll={false}
                onClick={() => setIsMobileFilterOpen(false)}
                className={`px-7 py-3 text-[10px] font-bold uppercase tracking-widest border rounded-full transition-all duration-300 inline-block ${
                  sizeFilter === size
                    ? "bg-[#4a2c2a] text-white border-[#4a2c2a] shadow-lg"
                    : "bg-white text-[#5e7e95] border-gray-100 hover:border-gray-200"
                }`}
              >
                {size}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Coming Soon Sizes Filter */}
      {finishFilter === "COMING SOON" && (
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">
            Coming Soon Sizes
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={createFilterUrl("size", null)}
              scroll={false}
              onClick={() => setIsMobileFilterOpen(false)}
              className={`px-7 py-3 text-[10px] font-bold uppercase tracking-widest border rounded-full transition-all duration-300 inline-block ${
                sizeFilter === null
                  ? "bg-[#4a2c2a] text-white border-[#4a2c2a] shadow-lg"
                  : "bg-white text-[#5e7e95] border-gray-100 hover:border-gray-200"
              }`}
            >
              All Sizes
            </Link>

            {uniqueComingSoonSizes.map((size) => (
              <Link
                key={size}
                href={createFilterUrl("size", size)}
                scroll={false}
                onClick={() => setIsMobileFilterOpen(false)}
                className={`px-7 py-3 text-[10px] font-bold uppercase tracking-widest border rounded-full transition-all duration-300 inline-block ${
                  sizeFilter === size
                    ? "bg-[#4a2c2a] text-white border-[#4a2c2a] shadow-lg"
                    : "bg-white text-[#5e7e95] border-gray-100 hover:border-gray-200"
                }`}
              >
                {size}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Conditional Sub-Filter */}
      {sizeFilter === "accessories" ? (
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">
            Accessory Type
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={createFilterUrl("finish", null)}
              scroll={false}
              onClick={() => setIsMobileFilterOpen(false)}
              className={`px-7 border rounded-full transition-all duration-300 inline-flex flex-col items-center justify-center min-h-[48px] hover:scale-105 ${
                finishFilter === null
                  ? "bg-[#4a2c2a] text-white border-[#4a2c2a] shadow-lg scale-105"
                  : "bg-white text-[#5e7e95] border-gray-100 hover:border-gray-200"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest">
                All Types
              </span>
            </Link>

            {accessoriesList.map((acc) => (
              <Link
                key={acc.id}
                href={createFilterUrl("finish", acc.id)}
                scroll={false}
                onClick={() => setIsMobileFilterOpen(false)}
                className={`px-7 border rounded-full transition-all duration-300 inline-flex flex-col items-center justify-center min-w-[140px] min-h-[48px] hover:scale-105 ${
                  finishFilter === acc.id
                    ? "bg-[#4a2c2a] text-white border-[#4a2c2a] shadow-lg scale-105"
                    : "bg-white text-[#5e7e95] border-gray-100 hover:border-gray-200"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest mb-[2px]">
                  {acc.name}
                </span>
                <span
                  className={`text-[9px] font-medium tracking-wider ${finishFilter === acc.id ? "text-white/70" : "text-gray-400"}`}
                >
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">
            Surface Finish
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={createFilterUrl("finish", null)}
              scroll={false}
              onClick={() => setIsMobileFilterOpen(false)}
              className={`px-7 py-3 text-[10px] font-bold uppercase tracking-widest border rounded-full transition-all duration-300 inline-block ${
                finishFilter === null
                  ? "bg-[#4a2c2a] text-white border-[#4a2c2a] shadow-lg"
                  : "bg-white text-[#5e7e95] border-gray-100 hover:border-gray-200"
              }`}
            >
              All Finishes
            </Link>

            <Link
              href={createFilterUrl("finish", "NEW ARRIVALS")}
              scroll={false}
              onClick={() => setIsMobileFilterOpen(false)}
              className={`px-7 py-3 text-[10px] font-bold uppercase tracking-widest border rounded-full transition-all duration-300 inline-block ${
                finishFilter === "NEW ARRIVALS"
                  ? "bg-[#4a2c2a] text-white border-[#4a2c2a] shadow-lg"
                  : "bg-white text-[#5e7e95] border-gray-100 hover:border-gray-200"
              }`}
            >
              New Arrivals
            </Link>

            <Link
              href={createFilterUrl("finish", "COMING SOON")}
              scroll={false}
              onClick={() => setIsMobileFilterOpen(false)}
              className={`px-7 py-3 text-[10px] font-bold uppercase tracking-widest border rounded-full transition-all duration-300 inline-block ${
                finishFilter === "COMING SOON"
                  ? "bg-[#4a2c2a] text-white border-[#4a2c2a] shadow-lg"
                  : "bg-white text-[#5e7e95] border-gray-100 hover:border-gray-200"
              }`}
            >
              Coming Soon
            </Link>
            {uniqueFinishes.map((finish) => (
              <Link
                key={finish}
                href={createFilterUrl("finish", finish)}
                scroll={false}
                onClick={() => setIsMobileFilterOpen(false)}
                className={`px-7 py-3 text-[10px] font-bold uppercase tracking-widest border rounded-full transition-all duration-300 inline-block ${
                  finishFilter === finish
                    ? "bg-[#4a2c2a] text-white border-[#4a2c2a] shadow-lg"
                    : "bg-white text-[#5e7e95] border-gray-100 hover:border-gray-200"
                }`}
              >
                {finish}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative pb-24 px-4 md:px-10">
      {/* Desktop Filters */}
      <div className="hidden lg:block mb-24 border-b border-gray-50 pb-16">
        {filterContent}
      </div>

      {/* Mobile Trigger */}
      <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="bg-[#4a2c2a] text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-transform active:scale-95"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path d="M4 21v-7m0-4V3m8 18v-11m0-4V3m8 18v-3m0-4V3M1 14h6m2-11h6m2 11h6" />
          </svg>
          Refine Results
        </button>
      </div>

      {/* Product Grid (Matching Screenshot & requested design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14">
        {filteredTiles.slice(0, visibleCount).map((imageName) => {
          const imageNameWithoutQuery = imageName.split("?")[0];
          const fileNameOnly = imageNameWithoutQuery.split("/").pop() || imageNameWithoutQuery;
          const finish = getFinish(fileNameOnly);
          const details = getProductDetails(fileNameOnly);
          const isPoster = fileNameOnly.toUpperCase().includes("POSTER");
          
          let displayName = formatFileName(fileNameOnly);
          let displayPrice = details.price;
          let displayOriginalPrice = details.price + 5;
          let category = "";
          let productSlug = "";
          
          if (imageName.includes("?")) {
             const params = new URLSearchParams(imageName.split("?")[1]);
             if (params.has("name")) displayName = params.get("name")!;
             if (params.has("price")) {
               const parsedPrice = parseFloat(params.get("price")!);
               displayOriginalPrice = parsedPrice;
               displayPrice = parsedPrice;
             }
             if (params.has("discountPrice")) {
               displayPrice = parseFloat(params.get("discountPrice")!);
             }
             if (params.has("category")) {
               category = params.get("category")!;
             }
             if (params.has("slug")) {
               productSlug = params.get("slug")!;
             }
          }

          const detailPageUrl = productSlug ? `/products/${productSlug}` : `/products/${encodeURIComponent(imageName)}`;

          // Determine dimensions
          let dimension = "N/A";
          if (imageName.includes("?size=")) {
            dimension = imageName.split("?size=")[1].split("&")[0];
          } else if (!imageName.startsWith("http")) {
            const parts = imageNameWithoutQuery.split("/");
            const sizeFolder = parts.find(p => p.toLowerCase().includes("x") && /\d+x\d+/i.test(p));
            if (sizeFolder) {
              dimension = sizeFolder;
            } else if (parts[0] !== "comingsoon" && parts[0].includes("x")) {
              dimension = parts[0].split("?")[0] || "N/A";
            }
          }
          dimension = dimension.toUpperCase();

          // Generate preview image
          const previewUrl = getPreviewUrl(imageName, dimension, previewPaths);

          return (
            <div key={imageName} className="group flex flex-col">
              {/* Boxed Aspect Ratio like the original design */}
              <Link href={detailPageUrl} className="relative w-full aspect-[5/4] bg-[#fbfbfb] flex items-center justify-center p-6 mb-5 overflow-hidden group/image cursor-pointer">
                {/* Main Tile Image */}
                <img
                  src={imageName.startsWith("http") ? imageNameWithoutQuery : imageNameWithoutQuery.startsWith("comingsoon/") ? `/${imageNameWithoutQuery.split('/').map(s => encodeURIComponent(s)).join('/')}${imgVersion ? `?v=${imgVersion}` : ""}` : `/tiles/${imageNameWithoutQuery.split('/').map(s => encodeURIComponent(s)).join('/')}${imgVersion ? `?v=${imgVersion}` : ""}`}
                  alt={fileNameOnly}
                  className={`w-full h-full object-contain mix-blend-multiply transition-opacity duration-300 ${previewUrl ? 'group-hover/image:opacity-0' : 'group-hover/image:scale-105'}`}
                />

                {/* Hover Preview Image */}
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt={`${displayName} Preview`}
                    className="object-cover absolute inset-0 w-full h-full opacity-0 group-hover/image:opacity-100 transition-opacity duration-500 z-10"
                  />
                )}

                {/* View Details Overlay on Hover */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20 pointer-events-none">
                  <span className="bg-white text-[#4a2c2a] px-6 py-3 text-[10px] font-bold uppercase tracking-widest shadow-xl transform translate-y-4 group-hover/image:translate-y-0 transition-all duration-300">
                    View Details
                  </span>
                </div>

                {/* Finish Badge */}
                {finish && finish !== "OTHER" && !details.isAccessory && (
                  <div className="absolute top-4 left-4 bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-[#4a2c2a] shadow-sm z-30">
                    {finish}
                  </div>
                )}
              </Link>

              <div className="flex flex-col flex-grow text-left px-2">
                <Link href={detailPageUrl} className="hover:text-[#4a2c2a]/70 transition-colors">
                  <h3 className="text-[12px] font-bold uppercase mb-3 text-left">
                    {displayName}
                  </h3>
                </Link>

                <div className="flex items-end gap-2 mb-5">
                  {imageNameWithoutQuery.startsWith("comingsoon/") ? (
                    <span className="text-[14px] font-bold text-gray-400 uppercase tracking-wider">Coming Soon</span>
                  ) : isPoster ? (
                    <span className="text-[16px] font-bold text-[#4a2c2a]">POA</span>
                  ) : (
                    <>
                      <span className="text-[16px] font-medium text-[#4a2c2a]">
                        £{displayPrice.toFixed(2)}{" "}
                        <span className="text-[11px] font-normal text-gray-400">
                          / {details.unit}
                        </span>
                      </span>
                      {!details.isAccessory && displayOriginalPrice > displayPrice && (
                        <span className="text-[12px] line-through text-gray-300 mb-[2px]">
                          £{displayOriginalPrice.toFixed(2)}
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-auto">
                  {imageNameWithoutQuery.startsWith("comingsoon/") ? (
                    <button
                      disabled
                      className="w-full flex justify-center bg-gray-50 text-gray-400 py-3 text-[10px] font-bold uppercase tracking-widest cursor-not-allowed border border-gray-100"
                    >
                      Coming Soon
                    </button>
                  ) : isPoster ? (
                    <Link
                      href="/contact"
                      className="w-full flex justify-center bg-[#222] text-white hover:bg-black py-3 text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                      Inquire for Price
                    </Link>
                  ) : (
                      <AddToCartButton
                        product={{
                          id: fileNameOnly,
                          name: displayName,
                          image: imageName.startsWith("http") ? imageNameWithoutQuery : imageNameWithoutQuery.startsWith("comingsoon/") ? `/${imageNameWithoutQuery}` : `/tiles/${imageNameWithoutQuery}`,
                          price: displayPrice,
                          category: category
                        }}
                      />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {filteredTiles.length > visibleCount && (
        <div className="flex justify-center mt-16 md:mt-24">
          <button
            onClick={() => setVisibleCount(filteredTiles.length)}
            className="bg-[#4a2c2a] text-white px-10 py-5 text-[11px] font-bold uppercase tracking-[0.25em] shadow-xl hover:bg-[#4a2c2a]/90 active:scale-95 transition-all duration-300"
          >
            Load More
          </button>
        </div>
      )}

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-white z-[100] transition-transform duration-500 ease-in-out flex flex-col ${isMobileFilterOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* Mobile Header */}
        <div className="flex justify-between items-center p-8 pb-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-3xl font-serif text-[#4a2c2a]">
            Collection Filters
          </h2>
          <button
            onClick={() => setIsMobileFilterOpen(false)}
            className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-full"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4a2c2a"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Filters Content */}
        <div className="flex-grow overflow-y-auto p-8 pb-12">
          {filterContent}
        </div>

        {/* Sticky Mobile Footer */}
        <div className="p-8 border-t border-gray-100 flex-shrink-0 bg-white shadow-lg">
          <button
            onClick={() => setIsMobileFilterOpen(false)}
            className="w-full"
          >
            <div className="bg-[#4a2c2a] text-white py-5 rounded-sm text-[11px] font-bold uppercase tracking-widest text-center shadow-xl">
              View {filteredTiles.length} Masterpieces
            </div>
          </button>
        </div>
      </div>

      {/* Scroll to top */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-[50] w-14 h-14 bg-white border border-gray-100 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 ${showTopBtn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4a2c2a"
          strokeWidth="2.5"
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>

      {filteredTiles.length === 0 && (
        <div className="text-center py-40">
          <p className="text-2xl font-serif text-gray-200 italic">
            No pieces found matching these criteria.
          </p>
        </div>
      )}
    </div>
  );
}
