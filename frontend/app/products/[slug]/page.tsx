"use client";

import React, { useState, useEffect, use, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCartAsync, mockAddToCart } from "@/store/slices/cartSlice";
import { RootState } from "@/store/store";
import { useCart } from "@/context/CartContext";
import TilePackCalculator from "@/components/products/TilePackCalculator";
import previewMap from "@/app/previewMap.json";
import api from "@/lib/axios";

/* ─────────────────────────────────────────────
   Pure helper functions (same logic as TileGallery)
───────────────────────────────────────────── */
const getFinish = (fileName: string) => {
  const name = fileName.toUpperCase();
  if (name.includes("--GLOSS")) return "GLOSSY";
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

const getMeasurement = (fileName: string) => {
  const upper = fileName.toUpperCase();
  if (upper.includes("16MM")) return "16 mm";
  if (upper.includes("20MM")) return "20 mm";
  return null;
};

const getVariantMatchName = (name: string) =>
  name
    .split("--")[0]
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\bR[1-9]\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

const getFileNameSuffix = (fileName: string) => {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
  const rotMatch = nameWithoutExt.match(/(R[1-9](?:_1)?|_1)$/i);
  return rotMatch ? rotMatch[0] : "";
};

const rightSideVariantsGroup = [
  ["alexa beige", "alexa bianco", "alexa brown", "alexa grey"],
  ["armani gris", "armani ivory"],
  ["arte fluo grey", "arte fluo white 1"],
  ["el blue bell dark", "el blue bell light", "el bricko light"],
  ["el smog gold 1", "el smog gris 1"],
  ["el statuario fantastico", "el staturio prime", "el statuario prime"],
  ["gdsi 1002", "gdsi 1019"],
  ["lux 09 hl1", "lux 09", "lux 09 hl"],
  ["meglow white"],
  [
    "morgan beige p1",
    "morgan bianco p1",
    "morgan brown p1",
    "morgan ivory p1",
    "marmor grey",
  ],
  ["stanza grey", "stanza silver"],
  ["vectro 11013 lt"],
  ["arabescato"],
];

const leftSideVariantsGroup = [
  ["artovel 018 dk", "artovel 018 hl"],
  ["earharo hl", "eartharo brwon f1", "earharo brown f1"],
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
  ["waves hl", "waves nero f1"],
];

const getProductDetails = (fileName: string) => {
  const upper = fileName.toUpperCase();
  if (upper.includes("TRIM"))
    return {
      price: 8,
      unit: "+vat/piece",
      isAccessory: true,
      isAdhesive: false,
      isTrim: true,
    };
  if (upper.includes("SPACER"))
    return {
      price: 6,
      unit: "+vat/bag",
      isAccessory: true,
      isAdhesive: false,
      isTrim: false,
    };
  if (upper.includes("WEDGE"))
    return {
      price: 6,
      unit: "+vat/bag",
      isAccessory: true,
      isAdhesive: false,
      isTrim: false,
    };
  if (upper.includes("ADHESIVE") || upper.includes("GLUE"))
    return {
      price: 12,
      unit: "+vat/bag",
      isAccessory: true,
      isAdhesive: true,
      isTrim: false,
    };
  if (upper.includes("MATTING") || upper.includes("LEVEL"))
    return {
      price: 6,
      unit: "+vat/sqm",
      isAccessory: true,
      isAdhesive: false,
      isTrim: false,
    };
  if (
    upper.includes("AURL GRIGIO") ||
    upper.includes("PAVE") ||
    upper.includes("SALT CONCRETO") ||
    upper.includes("SALTED CONCRETO") ||
    upper.includes("OUTDOOR")
  ) {
    return {
      price: 18,
      unit: "m²",
      isAccessory: false,
      isAdhesive: false,
      isTrim: false,
    };
  }
  return {
    price: 15,
    unit: "m²",
    isAccessory: false,
    isAdhesive: false,
    isTrim: false,
  };
};

const getValidusName = (fileName: string) => {
  const upper = fileName.toUpperCase();
  if (upper.includes("ALTUS")) return "Validus Altus";
  if (upper.includes("RELO")) return "Validus Relo";
  if (upper.includes("STRUCTA")) return "Validus Structa";
  if (upper.includes("SERO")) return "Validus Sero";
  if (upper.includes("PORO")) return "Validus Poro";
  if (upper.includes("FLEX")) return "Validus Flex";
  if (upper.includes("RAPID")) return "Validus Rapid";
  const base = fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]/g, " ")
    .split(" ")[0];
  return `Validus ${base}`;
};

const getCategory = (fileName: string) => {
  const upper = fileName.toUpperCase();
  if (
    upper.includes("AURL GRIGIO") ||
    upper.includes("PAVE") ||
    upper.includes("SALT CONCRETO") ||
    upper.includes("SALTED CONCRETO")
  )
    return "Outdoor tiles";
  if (upper.includes("PUNCHGL")) return "POSTER";
  if (
    upper.includes("TRIM") ||
    upper.includes("SPACER") ||
    upper.includes("WEDGE") ||
    upper.includes("ADHESIVE") ||
    upper.includes("GLUE") ||
    upper.includes("MATTING") ||
    upper.includes("LEVEL")
  )
    return "Accessories";
  if (upper.includes("OUTDOOR")) return "Outdoor";
  if (upper.includes("DECOR") || upper.includes("POSTER")) return "Decorative";
  if (
    upper.includes("GLOSS") ||
    upper.includes("HIGHGL")
  )
    return "Glossy Collection";
  if (upper.includes("MATT") || upper.includes("PAVE") || upper.includes("SALTED CONCRETO")) return "Matt Collection";
  if (upper.includes("CARVING")) return "Carving Collection";
  return "Premium Collection";
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

const getPathDimension = (pathStr: string): string => {
  const pathWithoutQuery = pathStr.split("?")[0];
  if (pathStr.includes("?size=")) {
    return pathStr.split("?size=")[1].split("&")[0];
  }
  if (!pathStr.startsWith("http")) {
    const parts = pathWithoutQuery.split("/");
    const sizeFolder = parts.find(p => p.toLowerCase().includes("x") && /\d+x\d+/i.test(p));
    if (sizeFolder) {
      return sizeFolder;
    }
    const sizeFolderPart = parts[0];
    if (sizeFolderPart.includes("x")) {
      return sizeFolderPart;
    }
  }
  return "N/A";
};

/* ─────────────────────────────────────────────
   Page Component
───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   Adhesive Info Tabs Component
───────────────────────────────────────────── */
function AdhesiveTabs() {
  const [active, setActive] = React.useState<string | null>("substrate");
  const tabs = [
    { id: "substrate", label: "Substrate Preparation" },
    { id: "instruction", label: "Instruction for Use" },
    { id: "technical", label: "Technical Information" },
  ];
  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-14 mb-16">
      <div className="flex flex-wrap md:flex-nowrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(active === tab.id ? null : tab.id)}
            className={`px-6 py-4 md:px-10 md:py-6 text-sm md:text-lg font-black uppercase tracking-widest transition-colors duration-200 ${
              active === tab.id
                ? "bg-[#4a2c2a] text-white"
                : "text-[#4a2c2a] hover:bg-[#4a2c2a]/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "substrate" && (
        <div className="bg-[#4a2c2a] text-white px-12 py-12">
          <p className="text-xl leading-relaxed max-w-5xl mb-6">
            Before starting, all substrates must be clean, dry and strong enough
            to support the weight of the tiles, tile adhesive and grout. Remove
            all dust, dirt, oil, grease and other contaminants that may affect
            adhesion.
          </p>
          <p className="text-xl leading-relaxed max-w-5xl mb-6">
            Absorbent substrates and Gypsum- or calcium-sulphate-based
            substrates should be primed with Validus Para prior to use. See
            Validus Para datasheet for correct application according to specific
            substrates.
          </p>
          <p className="text-xl leading-relaxed max-w-5xl mb-6">
            Adhesive is best applied in a uniform layer, using a notched trowel
            to comb to a consistent depth, as is appropriate for the type of and
            size of tiles to be fixed. It can be applied to a maximum bed
            thickness of 20mm.
          </p>
          <p className="text-xl leading-relaxed max-w-5xl mb-6">
            Ensuring the adhesive is still fresh, bed tiles into the adhesive,
            ensuring full coverage of adhesive between tile and substrate. Where
            risk is present, protect the surface from frost until the adhesive
            is fully set.
          </p>
          <p className="text-xl leading-relaxed max-w-5xl">
            Clean surplus adhesive from the tiles and joints as soon as
            possible; set adhesive will become increasingly difficult to remove.
            Clean tools after use with water. Product for professional use only.
          </p>
        </div>
      )}
      {active === "instruction" && (
        <div className="bg-[#4a2c2a] text-white px-12 py-12">
          <p className="text-xl leading-relaxed max-w-5xl mb-6">
            This product must be in its final position before the mix has
            started to set. Mix with clean water until you achieve a smooth and
            lump-free homogeneous consistency.
          </p>
          <p className="text-xl leading-relaxed max-w-5xl">
            Allow the product to stand for about 2 minutes, then remix. The
            adhesive is now ready for use and must be used within 30 minutes.
          </p>
        </div>
      )}
      {active === "technical" && (
        <div className="bg-[#4a2c2a] text-white px-12 py-12">
          <div className="grid md:grid-cols-2 gap-10 max-w-5xl">
            <div>
              <p className="text-xl font-bold mb-2">Grouting:</p>
              <p className="text-xl leading-relaxed opacity-90">
                In ideal conditions, grouting can begin after 12 hours. Foot
                traffic accepted after 24 hours.
              </p>
            </div>
            <div>
              <p className="text-xl font-bold mb-2">Coverage:</p>
              <p className="text-xl leading-relaxed opacity-90">
                Approximately 4–5 m² at 10 mm bed.
              </p>
            </div>
            <div>
              <p className="text-xl font-bold mb-2">Storage:</p>
              <p className="text-xl leading-relaxed opacity-90">
                Store in unopened, sealed packaging in a cool, dry place.
              </p>
            </div>
            <div>
              <p className="text-xl font-bold mb-2">Shelf Life:</p>
              <p className="text-xl leading-relaxed opacity-90">
                Approximately 12 months from the date printed on packaging.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const decodedSlug = decodeURIComponent(resolvedParams.slug);
  const isLegacy = decodedSlug.includes(".") || decodedSlug.includes("/") || decodedSlug.includes("\\");

  const [allTiles, setAllTiles] = useState<string[]>([]);
  const [previewPaths, setPreviewPaths] = useState<string[]>([]);

  useEffect(() => {
    import("@/app/actions").then((module) => {
      module.getActiveTilePaths().then((paths) => setAllTiles(paths));
      module.getAllPreviewPaths().then((paths) => setPreviewPaths(paths));
    });
  }, []);

  const [productData, setProductData] = useState<any>(null);
  const [loadingProduct, setLoadingProduct] = useState(!isLegacy);
  const [imagePath, setImagePath] = useState(isLegacy ? decodedSlug : "");

  // Fetch product from DB if not legacy
  useEffect(() => {
    if (!isLegacy) {
      setLoadingProduct(true);
      api.get(`/api/products/slug/${decodedSlug}`)
        .then((res) => {
          setProductData(res.data);
          setLoadingProduct(false);
        })
        .catch((err) => {
          if (err.message !== "Network Error") {
            console.warn("Could not fetch product by slug from database:", err.message || err);
          }
          setLoadingProduct(false);
        });
    }
  }, [decodedSlug, isLegacy]);

  // Fallback lookup in allTiles when backend product not found or server fails
  useEffect(() => {
    if (!isLegacy && !productData && !loadingProduct && allTiles.length > 0) {
      // 1. Try exact slug match
      let matched = allTiles.find(t => {
        if (t.includes("?")) {
          const q = t.split("?")[1];
          const up = new URLSearchParams(q);
          return up.get("slug") === decodedSlug;
        }
        return false;
      });

      // 2. Try parsing slug to match name and size
      if (!matched) {
        const lowerSlug = decodedSlug.toLowerCase();
        let parsedSize = "";
        if (lowerSlug.includes("600x1200")) parsedSize = "600x1200";
        else if (lowerSlug.includes("600x600")) parsedSize = "600x600";

        const cleanedSlug = lowerSlug
          .replace("600x1200", "")
          .replace("600x600", "")
          .replace("glossy", "")
          .replace("matt", "")
          .replace(/[-_\s]/g, "");

        matched = allTiles.find(t => {
          const tPath = t.split("?")[0];
          const tFile = tPath.split("/").pop() || tPath;
          const tSizeFolder = tPath.split("/")[0] || "";

          const q = t.split("?")[1] || "";
          const up = new URLSearchParams(q);

          const rawName = up.get("name") || tFile.split("--")[0].replace(/\.[^/.]+$/, "");
          const tNameNormalized = rawName.toLowerCase().replace(/[^a-z0-9]/g, "").trim();

          const rawSize = up.get("size") || tSizeFolder;
          const tSizeNormalized = rawSize.toLowerCase().replace(/[^a-z0-9]/g, "").trim();

          const nameMatches = tNameNormalized.includes(cleanedSlug) || cleanedSlug.includes(tNameNormalized);
          const sizeMatches = parsedSize ? tSizeNormalized === parsedSize : true;

          return nameMatches && sizeMatches;
        });
      }

      if (matched) {
        const q = matched.split("?")[1];
        const up = new URLSearchParams(q);
        const mockProduct = {
          name: up.get("name") || "",
          price: parseFloat(up.get("price") || "12"),
          discount_price: up.has("discountPrice") ? parseFloat(up.get("discountPrice")!) : undefined,
          category: up.get("category") || "Accessories",
          finish: up.get("finish") || "Grey",
          size: up.get("size") || "20kg",
          image: matched.split("?")[0]
        };
        setProductData(mockProduct);
      }
    }
  }, [decodedSlug, isLegacy, productData, loadingProduct, allTiles]);

  // Resolve imagePath dynamically when productData and allTiles are loaded
  useEffect(() => {
    if (!isLegacy && productData) {
      if (allTiles.length > 0) {
        const targetSlug = (productData.slug || "").toLowerCase().trim();
        const targetName = (productData.name || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
        const targetSize = (productData.size || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();

        // 1. Try slug match
        let foundTile = allTiles.find(t => {
          if (!t.includes("?")) return false;
          const q = t.split("?")[1];
          const up = new URLSearchParams(q);
          const s = (up.get("slug") || "").toLowerCase().trim();
          return s && s === targetSlug;
        });

        // 2. Try name and size match
        if (!foundTile && targetName) {
          foundTile = allTiles.find(t => {
            const tPath = t.split("?")[0];
            const tFile = tPath.split("/").pop() || tPath;
            const tSizeFolder = tPath.split("/")[0] || "";

            const q = t.split("?")[1] || "";
            const up = new URLSearchParams(q);

            const rawName = up.get("name") || tFile.split("--")[0].replace(/\.[^/.]+$/, "");
            const tNameNormalized = rawName.toLowerCase().replace(/[^a-z0-9]/g, "").trim();

            const rawSize = up.get("size") || tSizeFolder;
            const tSizeNormalized = rawSize.toLowerCase().replace(/[^a-z0-9]/g, "").trim();

            return tNameNormalized === targetName && tSizeNormalized === targetSize;
          });
        }

        // 3. Try filename and size match
        if (!foundTile && productData.image) {
          const dbImgFilename = (productData.image.split("/").pop() || "").split("?")[0].toLowerCase().trim();

          foundTile = allTiles.find(t => {
            const tPath = t.split("?")[0];
            const tFile = (tPath.split("/").pop() || "").toLowerCase().trim();
            const tSizeFolder = tPath.split("/")[0] || "";

            const matchesFilename = tFile === dbImgFilename || tPath.toLowerCase() === dbImgFilename;
            if (!matchesFilename) return false;

            if (targetSize) {
              const q = t.split("?")[1] || "";
              const up = new URLSearchParams(q);
              const tSize = (up.get("size") || tSizeFolder)
                .toLowerCase().replace(/[^a-z0-9]/g, "").trim();
              return tSize === targetSize;
            }
            return true;
          });
        }

        // 4. Last resort: match just productData.image filename
        if (!foundTile) {
          foundTile = allTiles.find(t => {
            const tPath = t.split("?")[0];
            const tFile = tPath.split("/").pop() || tPath;
            return tFile === productData.image || tPath === productData.image;
          });
        }

        if (foundTile) {
          setImagePath(foundTile);
        } else {
          setImagePath(productData.image || "");
        }
      } else {
        setImagePath(productData.image || "");
      }
    }
  }, [productData, allTiles, isLegacy]);

  const imagePathWithoutQuery = imagePath.split("?")[0];
  const fileNameOnly = imagePathWithoutQuery.split("/").pop() || imagePathWithoutQuery;
  
  let dimension = getPathDimension(imagePath).toUpperCase();

  const getVariantLink = (pathStr: string) => {
    if (pathStr.includes("?")) {
      const q = pathStr.split("?")[1];
      const params = new URLSearchParams(q);
      const slug = params.get("slug");
      if (slug) {
        return `/products/${slug}`;
      }
    }
    return `/products/${encodeURIComponent(pathStr)}`;
  };

  const [selectedAurlImage, setSelectedAurlImage] = useState<string | null>(null);
  const [selectedPaveImage, setSelectedPaveImage] = useState<string | null>(null);

  const isAurlProduct = fileNameOnly.toUpperCase().includes("AURL GRIGIO ARCO");
  const isPaveProduct = fileNameOnly.toUpperCase().includes("PAVE");
  const isSaltedProduct = fileNameOnly.toUpperCase().includes("SALTED CONCRETO");

  const displayImagePath = isAurlProduct
    ? (selectedAurlImage || "600x600/AURL GRIGIO ARCO (605x605) 16mm--MATT.jpeg")
    : isPaveProduct
    ? (selectedPaveImage || "600x600/PAVE’ PARIS G (605x605) 16mm.jpeg")
    : imagePath;

  let finish = getFinish(fileNameOnly);
  const details = getProductDetails(fileNameOnly);
  let category = getCategory(fileNameOnly);
  let displayName = formatFileName(fileNameOnly);
  const isPoster = fileNameOnly.toUpperCase().includes("POSTER");
  
  let displayOriginalPrice = details.price + 5;
  if (imagePath.includes("?")) {
     const params = new URLSearchParams(imagePath.split("?")[1]);
     if (params.has("name")) displayName = params.get("name")!;
     if (params.has("price")) {
       const parsedPrice = parseFloat(params.get("price")!);
       displayOriginalPrice = parsedPrice;
       details.price = parsedPrice; // fallback if no discount
     }
     if (params.has("discountPrice")) {
       details.price = parseFloat(params.get("discountPrice")!);
     }
     if (params.has("category")) {
       category = params.get("category")!;
     }
  }

  if (!isLegacy && productData) {
    displayName = productData.name;
    category = productData.category || category;
    if (productData.price !== undefined && productData.price !== null) {
      details.price = productData.price;
      displayOriginalPrice = productData.price + 5;
    }
    if (productData.discount_price !== undefined && productData.discount_price !== null) {
      details.price = productData.discount_price;
    }
    if (productData.size) {
      dimension = productData.size.toUpperCase();
    }
  }
  if (productData && productData.finish) {
    finish = productData.finish;
  }

  const isComingSoon = imagePath.includes("comingsoon/") || category === "Coming Soon";

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state: RootState) => state.auth);
  const { setCartOpen } = useCart();

  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  // Wishlist — initialise from localStorage so state persists across visits
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [displayImagePath]);

  const [showMoreDesc, setShowMoreDesc] = useState(false);
  const [showMoreAdhesiveFeats, setShowMoreAdhesiveFeats] = useState(false);


  const previewUrl = getPreviewUrl(imagePath, dimension, previewPaths);

  const currentNameLower = getVariantMatchName(fileNameOnly).toLowerCase();
  const matchedRightGroup = rightSideVariantsGroup.find((g) =>
    g.includes(currentNameLower),
  );
  const matchedLeftGroup = leftSideVariantsGroup.find((g) =>
    g.includes(currentNameLower),
  );

  const currentKey = useMemo(() => {
    const getVariantKey = (fname: string): string | null => {
      const clean = fname.split("--")[0].replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim().toLowerCase();
      const words = clean.split(/\s+/);
      
      const numIdx = words.findIndex(w => /\d+/.test(w));
      if (numIdx !== -1 && numIdx + 1 < words.length) {
        const numberPart = words[numIdx].match(/\d+/)?.[0];
        const nextWord = words[numIdx + 1];
        if (numberPart && nextWord) {
          return `${numberPart}_${nextWord}`;
        }
      }
      return null;
    };
    return getVariantKey(fileNameOnly);
  }, [fileNameOnly]);

  const matchedDynamicGroup = useMemo(() => {
    if (matchedRightGroup || matchedLeftGroup || !currentKey || allTiles.length === 0) return null;

    const currentDimension = getPathDimension(imagePath);
    const getVariantKey = (fname: string): string | null => {
      const clean = fname.split("--")[0].replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim().toLowerCase();
      const words = clean.split(/\s+/);
      
      const numIdx = words.findIndex(w => /\d+/.test(w));
      if (numIdx !== -1 && numIdx + 1 < words.length) {
        const numberPart = words[numIdx].match(/\d+/)?.[0];
        const nextWord = words[numIdx + 1];
        if (numberPart && nextWord) {
          return `${numberPart}_${nextWord}`;
        }
      }
      return null;
    };

    // Find all other tiles in the same size folder that match the key
    const matched = allTiles.filter(t => {
      const tDimension = getPathDimension(t);
      if (tDimension !== currentDimension) return false;

      const tFileName = t.split("?")[0].split("/").pop() || t;
      return getVariantKey(tFileName) === currentKey;
    });

    return matched.length > 1 ? matched.sort() : null;
  }, [matchedRightGroup, matchedLeftGroup, currentKey, allTiles, imagePath]);

  const variantPaths = React.useMemo(() => {
    if (matchedDynamicGroup) {
      return matchedDynamicGroup;
    }

    const group = matchedRightGroup || matchedLeftGroup;
    if (!group || allTiles.length === 0) return [];

    const currentFileName = imagePath.split("/").pop() || imagePath;
    const currentSuffix = getFileNameSuffix(currentFileName).toLowerCase();
    const currentDimension = getPathDimension(imagePath);

    const paths: string[] = [];
    for (const itemName of group) {
      // Filter candidates to ensure they belong to the same dimension folder
      const candidates = allTiles.filter((t) => {
        const tDimension = getPathDimension(t);
        
        const tNameWithoutQuery = t.split("?")[0];
        const tName = tNameWithoutQuery.split("/").pop() || tNameWithoutQuery;
        
        return tDimension === currentDimension && getVariantMatchName(tName).toLowerCase() === itemName;
      });

      if (candidates.length > 0) {
        let best = candidates[0];
        if (currentSuffix) {
          const matched = candidates.find((c) => {
            const cNameWithoutQuery = c.split("?")[0];
            const cName = cNameWithoutQuery.split("/").pop() || cNameWithoutQuery;
            const cSuffix = getFileNameSuffix(cName).toLowerCase();
            return cSuffix === currentSuffix;
          });
          if (matched) {
            best = matched;
          } else {
            const partial = currentSuffix.replace(/_1$/, "");
            if (partial) {
              const matchedPartial = candidates.find((c) => {
                const cNameWithoutQuery = c.split("?")[0];
                const cName = cNameWithoutQuery.split("/").pop() || cNameWithoutQuery;
                const cSuffix = getFileNameSuffix(cName).toLowerCase();
                return cSuffix.includes(partial);
              });
              if (matchedPartial) {
                best = matchedPartial;
              }
            }
          }
        }
        paths.push(best);
      }
    }
    return paths;
  }, [matchedRightGroup, matchedLeftGroup, allTiles, imagePath]);

  // Hydrate wishlist from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("tb_wishlist") || "[]",
      ) as string[];
      setIsWishlisted(stored.includes(fileNameOnly));
    } catch {
      // ignore parse errors
    }
  }, [fileNameOnly]);

  /* ── Scroll to top on mount ── */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* ── Cart ── */
  const performMockAdd = () => {
    dispatch(
      mockAddToCart({
        id: Math.random().toString(),
        user_id: "preview_user",
        product_id: fileNameOnly,
        quantity: 1,
        unit: "pieces",
        product: {
          id: fileNameOnly,
          name: displayName,
          price: details.price,
          image: imagePath.startsWith("http") ? imagePathWithoutQuery : `/tiles/${imagePathWithoutQuery}`,
          size: dimension || "600x1200",
          category: category,
          slug: fileNameOnly
        },
      }),
    );
  };

  const handleAddToCart = async () => {
    if (!token) {
      const continueWithoutLogin = typeof window !== "undefined" && localStorage.getItem("tb_continue_without_login") === "true";
      if (!continueWithoutLogin) {
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }
      performMockAdd();
      setIsSuccess(true);
      setCartOpen(true);
      setTimeout(() => setIsSuccess(false), 2500);
      return;
    }
    try {
      setIsAdding(true);
      await dispatch(
        addToCartAsync({ product_id: fileNameOnly, quantity: 1, unit: "pieces" }),
      ).unwrap();
      setIsSuccess(true);
      setCartOpen(true);
      setTimeout(() => setIsSuccess(false), 2500);
    } catch {
      performMockAdd();
      setIsSuccess(true);
      setCartOpen(true);
      setTimeout(() => setIsSuccess(false), 2500);
    } finally {
      setIsAdding(false);
    }
  };

  /* ── Wishlist — toggle and persist to localStorage ── */
  const handleWishlist = () => {
    const next = !isWishlisted;
    setIsWishlisted(next);
    try {
      const stored = JSON.parse(
        localStorage.getItem("tb_wishlist") || "[]",
      ) as string[];
      const updated = next
        ? [...new Set([...stored, fileNameOnly])]
        : stored.filter((id) => id !== fileNameOnly);
      localStorage.setItem("tb_wishlist", JSON.stringify(updated));
      // Notify navbar to update wishlist badge count
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch {
      // ignore storage errors
    }
  };

  /* ── Share ── */
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: displayName, url });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShareMsg("Link copied!");
      setTimeout(() => setShareMsg(""), 2500);
    }
  };

  if (loadingProduct) {
    return (
      <div className="py-40 flex justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-[#4a2c2a] rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-20 md:pt-24">
      {/* ── Breadcrumb ── */}
      <nav className="max-w-[1440px] mx-auto px-6 md:px-14 py-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <Link href="/" className="hover:text-[#4a2c2a] transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href="/products"
          className="hover:text-[#4a2c2a] transition-colors"
        >
          Products
        </Link>
        <span>/</span>
        <span className="text-[#4a2c2a] truncate max-w-[200px]">
          {displayName}
        </span>
      </nav>

      {/* ── Main Layout ── */}
      <main className="max-w-[1440px] mx-auto px-6 md:px-14 pb-24">
        <div className="flex flex-col lg:flex-row gap-10 xl:gap-20 items-start">
          {/* ════════════════════════════════
              LEFT — Large Product Image
          ════════════════════════════════ */}
          <div className="w-full lg:w-[55%] xl:w-[58%] lg:sticky lg:top-28">
            <div className="relative w-full aspect-square bg-transparent rounded-sm overflow-hidden flex items-center justify-center p-6 md:p-10 transition-all duration-300">
              {!displayImagePath ? (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm animate-pulse">
                  Loading image...
                </div>
              ) : !imgError ? (
                <img
                  src={displayImagePath.startsWith("http") ? displayImagePath.split("?")[0] : displayImagePath.startsWith("comingsoon/") ? `/${displayImagePath.split("?")[0].split('/').map(s => encodeURIComponent(s)).join('/')}` : `/tiles/${displayImagePath.split("?")[0].split('/').map(s => encodeURIComponent(s)).join('/')}`}
                  alt={displayName}
                  className="w-full h-full object-contain "
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                  Image not found
                </div>
              )}

              {/* Finish badge */}
              {finish && finish !== "OTHER" && (
                <div className="absolute top-5 left-5 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-[#4a2c2a] shadow-md">
                  {finish}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {!(
              (matchedRightGroup || matchedLeftGroup) &&
              variantPaths.length > 0
            ) && !isAurlProduct && !isPaveProduct && !isSaltedProduct && displayImagePath && (
              <div className="mt-4 flex gap-3">
                <div className="w-20 h-20 bg-transparent border-2 border-[#4a2c2a] rounded-sm overflow-hidden flex items-center justify-center p-1 flex-shrink-0">
                  <img
                    src={displayImagePath.startsWith("http") ? displayImagePath.split("?")[0] : displayImagePath.startsWith("comingsoon/") ? `/${displayImagePath.split("?")[0]}` : `/tiles/${displayImagePath.split("?")[0]}`}
                    alt="thumb"
                    className="w-full h-full object-contain "
                  />
                </div>
              </div>
            )}

            {/* Ask our experts — all accessories */}
            {details.isAccessory && (
              <div className="mt-6 bg-[#f5f5f5] border border-gray-200 rounded-sm p-5">
                <p className="text-[13px] font-bold text-[#1a1a1a] mb-1">
                  Ask our experts
                </p>
                <p className="text-[12px] text-gray-500 mb-4">
                  We are open Monday – Friday, 7am–5pm.
                </p>
                <div className="flex gap-3">
                  <a
                    href="tel:+441234567890"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-400 rounded-sm text-[11px] font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.1 1.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
                    </svg>
                    Call us
                  </a>
                  <a
                    href="mailto:info@tilebazaar.co.uk"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-400 rounded-sm text-[11px] font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    Send us an email
                  </a>
                </div>
              </div>
            )}

            {/* LEFT SIDE VARIANTS */}
            {matchedLeftGroup && variantPaths.length > 0 && (
              <div className="mt-14 mb-4">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#5e7e95] mb-6 text-left">
                  Available Variants
                </p>
                <div className="flex flex-wrap justify-start gap-5">
                  {variantPaths.map((path) => {
                    const isActive = decodeURIComponent(path).split("?")[0] === decodeURIComponent(imagePath).split("?")[0];
                    const vNameWithoutQuery = path.split("?")[0];
                    const vName = formatFileName(vNameWithoutQuery.split("/").pop() || vNameWithoutQuery);
                    return (
                      <Link
                        key={path}
                        href={getVariantLink(path)}
                        className="group flex flex-col items-center"
                      >
                        <div
                          className={`relative w-36 h-24 md:w-40 md:h-28 bg-transparent border-[3px] ${isActive ? "border-black" : "border-transparent"} hover:border-black/40 transition-colors overflow-hidden`}
                        >
                          <img
                            src={path.startsWith("http") ? path.split("?")[0] : path.startsWith("comingsoon/") ? `/${path.split("?")[0]}` : `/tiles/${path.split("?")[0]}`}
                            alt={vName}
                            
                            className="w-full h-full object-cover  p-1"
                          />
                        </div>
                        <span className="text-[9px] mt-3 font-bold uppercase tracking-widest text-gray-600 text-center max-w-[144px] md:max-w-[160px] truncate">
                          {vName}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}


          </div>

          {/* ════════════════════════════════
              RIGHT — Product Details
          ════════════════════════════════ */}
          <div className="w-full lg:w-[45%] xl:w-[42%] pt-2">
            {/* Category tag */}
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400 mb-4">
              {category}
            </p>

            {/* Product Name */}
            <h1 className="text-3xl md:text-4xl font-serif text-[#4a2c2a] leading-tight mb-6">
              {displayName}
            </h1>

            {/* Divider */}
            <div className="w-16 h-[1.5px] bg-[#4a2c2a] opacity-30 mb-8" />

            {/* RIGHT SIDE VARIANTS */}
            {isAurlProduct && (
              <div className="mb-10 pb-10 border-b border-gray-100">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#4a2c2a] mb-6">
                  Available Views
                </p>
                <div className="flex flex-wrap gap-4">
                  {/* Option 1: Grid Layout */}
                  <button
                    onClick={() => setSelectedAurlImage("600x600/grid_aurl_600x600--MATT.jpg")}
                    className="group flex flex-col items-center cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`w-24 h-24 md:w-28 md:h-28 bg-transparent border-2 ${
                        displayImagePath === "600x600/grid_aurl_600x600--MATT.jpg"
                          ? "border-[#4a2c2a]"
                          : "border-transparent"
                      } hover:border-[#4a2c2a]/50 transition-colors rounded-sm overflow-hidden flex items-center justify-center p-2`}
                    >
                      <img
                        src="/tiles/600x600/grid_aurl_600x600--MATT.jpg"
                        alt="Grid Layout"
                        className="w-full h-full object-contain "
                      />
                    </div>
                    <span className="text-[9px] mt-2 font-bold uppercase tracking-widest text-[#4a2c2a] text-center max-w-[96px] md:max-w-[112px] truncate">
                      Grid Layout
                    </span>
                  </button>

                  {/* Option 2: Single Tile */}
                  <button
                    onClick={() => setSelectedAurlImage("600x600/AURL GRIGIO ARCO (605x605) 16mm--MATT.jpeg")}
                    className="group flex flex-col items-center cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`w-24 h-24 md:w-28 md:h-28 bg-transparent border-2 ${
                        displayImagePath === "600x600/AURL GRIGIO ARCO (605x605) 16mm--MATT.jpeg"
                          ? "border-[#4a2c2a]"
                          : "border-transparent"
                      } hover:border-[#4a2c2a]/50 transition-colors rounded-sm overflow-hidden flex items-center justify-center p-2`}
                    >
                      <img
                        src="/tiles/600x600/AURL GRIGIO ARCO (605x605) 16mm--MATT.jpeg"
                        alt="Single Tile"
                        className="w-full h-full object-contain "
                      />
                    </div>
                    <span className="text-[9px] mt-2 font-bold uppercase tracking-widest text-[#4a2c2a] text-center max-w-[96px] md:max-w-[112px] truncate">
                      Single Tile
                    </span>
                  </button>

                  {/* Option 3: View 1 */}
                  <button
                    onClick={() => setSelectedAurlImage("600x600/AURL GRIGIO ARCO (605x605) 16mm (1).jpeg")}
                    className="group flex flex-col items-center cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`w-24 h-24 md:w-28 md:h-28 bg-transparent border-2 ${
                        displayImagePath === "600x600/AURL GRIGIO ARCO (605x605) 16mm (1).jpeg"
                          ? "border-[#4a2c2a]"
                          : "border-transparent"
                      } hover:border-[#4a2c2a]/50 transition-colors rounded-sm overflow-hidden flex items-center justify-center p-2`}
                    >
                      <img
                        src="/tiles/600x600/AURL GRIGIO ARCO (605x605) 16mm (1).jpeg"
                        alt="View 1"
                        className="w-full h-full object-contain "
                      />
                    </div>
                    <span className="text-[9px] mt-2 font-bold uppercase tracking-widest text-[#4a2c2a] text-center max-w-[96px] md:max-w-[112px] truncate">
                      View 1
                    </span>
                  </button>

                  {/* Option 4: View 2 */}
                  <button
                    onClick={() => setSelectedAurlImage("600x600/AURL GRIGIO ARCO (605x605) 16mm (2).jpeg")}
                    className="group flex flex-col items-center cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`w-24 h-24 md:w-28 md:h-28 bg-transparent border-2 ${
                        displayImagePath === "600x600/AURL GRIGIO ARCO (605x605) 16mm (2).jpeg"
                          ? "border-[#4a2c2a]"
                          : "border-transparent"
                      } hover:border-[#4a2c2a]/50 transition-colors rounded-sm overflow-hidden flex items-center justify-center p-2`}
                    >
                      <img
                        src="/tiles/600x600/AURL GRIGIO ARCO (605x605) 16mm (2).jpeg"
                        alt="View 2"
                        className="w-full h-full object-contain "
                      />
                    </div>
                    <span className="text-[9px] mt-2 font-bold uppercase tracking-widest text-[#4a2c2a] text-center max-w-[96px] md:max-w-[112px] truncate">
                      View 2
                    </span>
                  </button>

                  {/* Option 5: View 3 */}
                  <button
                    onClick={() => setSelectedAurlImage("600x600/AURL GRIGIO ARCO (605x605) 16mm (3).jpeg")}
                    className="group flex flex-col items-center cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`w-24 h-24 md:w-28 md:h-28 bg-transparent border-2 ${
                        displayImagePath === "600x600/AURL GRIGIO ARCO (605x605) 16mm (3).jpeg"
                          ? "border-[#4a2c2a]"
                          : "border-transparent"
                      } hover:border-[#4a2c2a]/50 transition-colors rounded-sm overflow-hidden flex items-center justify-center p-2`}
                    >
                      <img
                        src="/tiles/600x600/AURL GRIGIO ARCO (605x605) 16mm (3).jpeg"
                        alt="View 3"
                        className="w-full h-full object-contain "
                      />
                    </div>
                    <span className="text-[9px] mt-2 font-bold uppercase tracking-widest text-[#4a2c2a] text-center max-w-[96px] md:max-w-[112px] truncate">
                      View 3
                    </span>
                  </button>
                </div>
              </div>
            )}

            {isPaveProduct && (
              <div className="mb-10 pb-10 border-b border-gray-100">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#4a2c2a] mb-6">
                  Available Views
                </p>
                <div className="flex flex-wrap gap-4">
                  {/* Option 1: Grid Layout */}
                  <button
                    onClick={() => setSelectedPaveImage("600x600/grid_pave_600x600--MATT.jpg")}
                    className="group flex flex-col items-center cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`w-24 h-24 md:w-28 md:h-28 bg-transparent border-2 ${
                        displayImagePath === "600x600/grid_pave_600x600--MATT.jpg"
                          ? "border-[#4a2c2a]"
                          : "border-transparent"
                      } hover:border-[#4a2c2a]/50 transition-colors rounded-sm overflow-hidden flex items-center justify-center p-2`}
                    >
                      <img
                        src="/tiles/600x600/grid_pave_600x600--MATT.jpg"
                        alt="Grid Layout"
                        className="w-full h-full object-contain "
                      />
                    </div>
                    <span className="text-[9px] mt-2 font-bold uppercase tracking-widest text-[#4a2c2a] text-center max-w-[96px] md:max-w-[112px] truncate">
                      Grid Layout
                    </span>
                  </button>

                  {/* Option 2: Single Tile */}
                  <button
                    onClick={() => setSelectedPaveImage("600x600/PAVE’ PARIS G (605x605) 16mm.jpeg")}
                    className="group flex flex-col items-center cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`w-24 h-24 md:w-28 md:h-28 bg-transparent border-2 ${
                        displayImagePath === "600x600/PAVE’ PARIS G (605x605) 16mm.jpeg"
                          ? "border-[#4a2c2a]"
                          : "border-transparent"
                      } hover:border-[#4a2c2a]/50 transition-colors rounded-sm overflow-hidden flex items-center justify-center p-2`}
                    >
                      <img
                        src="/tiles/600x600/PAVE’ PARIS G (605x605) 16mm.jpeg"
                        alt="Single Tile"
                        className="w-full h-full object-contain "
                      />
                    </div>
                    <span className="text-[9px] mt-2 font-bold uppercase tracking-widest text-[#4a2c2a] text-center max-w-[96px] md:max-w-[112px] truncate">
                      Single Tile
                    </span>
                  </button>

                  {/* Option 3: View 2 */}
                  <button
                    onClick={() => setSelectedPaveImage("600x600/PAVE’ PARIS G (605x605) 16mm (2).jpeg")}
                    className="group flex flex-col items-center cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`w-24 h-24 md:w-28 md:h-28 bg-transparent border-2 ${
                        displayImagePath === "600x600/PAVE’ PARIS G (605x605) 16mm (2).jpeg"
                          ? "border-[#4a2c2a]"
                          : "border-transparent"
                      } hover:border-[#4a2c2a]/50 transition-colors rounded-sm overflow-hidden flex items-center justify-center p-2`}
                    >
                      <img
                        src="/tiles/600x600/PAVE’ PARIS G (605x605) 16mm (2).jpeg"
                        alt="View 2"
                        className="w-full h-full object-contain "
                      />
                    </div>
                    <span className="text-[9px] mt-2 font-bold uppercase tracking-widest text-[#4a2c2a] text-center max-w-[96px] md:max-w-[112px] truncate">
                      View 2
                    </span>
                  </button>

                  {/* Option 4: View 3 */}
                  <button
                    onClick={() => setSelectedPaveImage("600x600/PAVE’ PARIS G (605x605) 16mm (3).jpeg")}
                    className="group flex flex-col items-center cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`w-24 h-24 md:w-28 md:h-28 bg-transparent border-2 ${
                        displayImagePath === "600x600/PAVE’ PARIS G (605x605) 16mm (3).jpeg"
                          ? "border-[#4a2c2a]"
                          : "border-transparent"
                      } hover:border-[#4a2c2a]/50 transition-colors rounded-sm overflow-hidden flex items-center justify-center p-2`}
                    >
                      <img
                        src="/tiles/600x600/PAVE’ PARIS G (605x605) 16mm (3).jpeg"
                        alt="View 3"
                        className="w-full h-full object-contain "
                      />
                    </div>
                    <span className="text-[9px] mt-2 font-bold uppercase tracking-widest text-[#4a2c2a] text-center max-w-[96px] md:max-w-[112px] truncate">
                      View 3
                    </span>
                  </button>

                  {/* Option 5: View 4 */}
                  <button
                    onClick={() => setSelectedPaveImage("600x600/PAVE’ PARIS G (605x605) 16mm (4).jpeg")}
                    className="group flex flex-col items-center cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`w-24 h-24 md:w-28 md:h-28 bg-transparent border-2 ${
                        displayImagePath === "600x600/PAVE’ PARIS G (605x605) 16mm (4).jpeg"
                          ? "border-[#4a2c2a]"
                          : "border-transparent"
                      } hover:border-[#4a2c2a]/50 transition-colors rounded-sm overflow-hidden flex items-center justify-center p-2`}
                    >
                      <img
                        src="/tiles/600x600/PAVE’ PARIS G (605x605) 16mm (4).jpeg"
                        alt="View 4"
                        className="w-full h-full object-contain "
                      />
                    </div>
                    <span className="text-[9px] mt-2 font-bold uppercase tracking-widest text-[#4a2c2a] text-center max-w-[96px] md:max-w-[112px] truncate">
                      View 4
                    </span>
                  </button>
                </div>
              </div>
            )}

            {(matchedRightGroup || matchedDynamicGroup) && variantPaths.length > 0 && (
              <div className="mb-10 pb-10 border-b border-gray-100">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">
                  Available Variants
                </p>
                <div className="flex flex-wrap gap-4">
                  {variantPaths.map((path) => {
                    const isActive = decodeURIComponent(path).split("?")[0] === decodeURIComponent(imagePath).split("?")[0];
                    const vNameWithoutQuery = path.split("?")[0];
                    const vName = formatFileName(vNameWithoutQuery.split("/").pop() || vNameWithoutQuery);
                    return (
                      <Link
                        key={path}
                        href={getVariantLink(path)}
                        className="group flex flex-col items-center"
                      >
                        <div
                          className={`relative w-24 h-24 md:w-28 md:h-28 bg-transparent border-2 ${isActive ? "border-[#4a2c2a]" : "border-transparent"} hover:border-[#4a2c2a]/50 transition-colors rounded-sm overflow-hidden`}
                        >
                          <img
                            src={path.startsWith("http") ? path.split("?")[0] : path.startsWith("comingsoon/") ? `/${path.split("?")[0]}` : `/tiles/${path.split("?")[0]}`}
                            alt={vName}
                            
                            className="w-full h-full object-cover p-2 "
                          />
                        </div>
                        <span className="text-[9px] mt-2 font-bold uppercase tracking-widest text-[#4a2c2a] text-center max-w-[96px] md:max-w-[112px] truncate">
                          {vName}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}



            {details.isAdhesive ? (
              /* ── Adhesive (Validus) Description Layout ── */
              <>
                <h2 className="text-2xl font-bold text-[#4a2c2a] mb-4">
                  Tile Adhesive
                </h2>
                <p className="text-base text-gray-700 leading-relaxed mb-6">
                  Highly flexible, multi-purpose adhesive, applicable in
                  thickness up to 20 mm, can be used as flow bed adhesive.
                </p>

                {/* Relocated Feature Bullets with Show More Toggle */}
                <div className="mb-6 border-b border-gray-100 pb-6">
                  {/* First 2 points always visible */}
                  <ul className="space-y-3 mb-3">
                    {[
                      "Grout after 12 hours",
                      "Light foot traffic after 12 hours"
                    ].map((feat, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-base font-semibold text-[#4a2c2a]"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#4a2c2a] flex-shrink-0 animate-pulse" />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  {/* Rest of the points inside expanding container */}
                  <div
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${
                      showMoreAdhesiveFeats ? "max-h-[500px] opacity-100 mb-4" : "max-h-0 opacity-0 pointer-events-none"
                    }`}
                  >
                    <ul className="space-y-3">
                      {[
                        "Highly flexible & thixotropic",
                        "Suitable for use with porcelain, ceramic and natural stone tiles",
                        "Ideal for interior and exterior applications",
                        "Ideal for use with large format slabs",
                        "15 mm bed thickness",
                        "Suitable for use with underfloor heating",
                        "C2 TE S1",
                        "20kg"
                      ].map((feat, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-3 text-base font-semibold text-[#4a2c2a]"
                        >
                          <span className="w-2 h-2 rounded-full bg-[#4a2c2a] flex-shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => setShowMoreAdhesiveFeats(!showMoreAdhesiveFeats)}
                    className="text-sm font-bold text-[#4a2c2a] underline underline-offset-4 hover:opacity-70 transition-opacity tracking-wide focus:outline-none flex items-center gap-1.5"
                  >
                    {showMoreAdhesiveFeats ? "Show less" : "Show more"}
                    <svg
                      className={`w-3.5 h-3.5 transform transition-transform duration-300 ${
                        showMoreAdhesiveFeats ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </div>

                {/* Fast Shipping / Secure payment badges */}
                <div className="flex items-center gap-8 mb-8 pb-8 border-b border-gray-200">
                  <div className="flex items-center gap-3 text-base font-semibold text-[#4a2c2a]">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="1" y="3" width="15" height="13" rx="1" />
                      <path d="M16 8h4l3 5v3h-7V8zM5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM19.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    Fast Shipping
                  </div>
                  <div className="flex items-center gap-3 text-base font-semibold text-[#4a2c2a]">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Secure payment
                  </div>
                </div>
                {/* Availability */}
                <div className="mb-6">
                  <p className="text-base font-bold text-gray-800 mb-2">
                    Availability
                  </p>
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-green-600"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z" />
                    </svg>
                    <span className="text-base text-green-600 font-semibold">
                      In stock, and ready to ship
                    </span>
                  </div>
                  <div className="mt-3 w-full h-1.5 bg-green-500 rounded-full" />
                </div>
                {/* Size */}
                <div className="mb-6">
                  <p className="text-base font-bold text-gray-800 mb-1">
                    Size: <span className="text-[#4a2c2a]">20kg</span>
                  </p>
                </div>
              </>
            ) : details.isTrim ? (
              /* ── Tile Trim Description Layout ── */
              <>
                {/* Fast Shipping / Secure payment badges */}
                <div className="flex items-center gap-8 mb-8 pb-8 border-b border-gray-200">
                  <div className="flex items-center gap-3 text-base font-semibold text-[#4a2c2a]">
                    <svg
                      className="w-6 h-6 text-[#4a2c2a]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="1" y="3" width="15" height="13" rx="1" />
                      <path d="M16 8h4l3 5v3h-7V8zM5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM19.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    Fast Shipping
                  </div>
                  <div className="flex items-center gap-3 text-base font-semibold text-[#4a2c2a]">
                    <svg
                      className="w-6 h-6 text-[#4a2c2a]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Secure payment
                  </div>
                </div>

                {/* Product Description */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-[#4a2c2a] mb-4 tracking-tight">
                    Product Description
                  </h3>
                  <p className="text-base text-gray-700 leading-relaxed mb-4">
                   Length: 2.5m
                  </p>
                  <div
                    className={`transition-all duration-300 overflow-hidden ${showMoreDesc ? "max-h-40 opacity-100 mb-5" : "max-h-0 opacity-0 mb-0"}`}
                  >
                    <ul className="list-disc list-inside text-base text-[#4a2c2a]/70 space-y-2 font-medium">
                      <li>Provides a decorative finish</li>
                      <li>Suitable for use where tile is bordered by carpet and expansion joints</li>
                      <li>Length: 2.5m</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => setShowMoreDesc(!showMoreDesc)}
                    className="text-sm font-bold text-[#4a2c2a] underline underline-offset-4 hover:opacity-70 transition-opacity tracking-wide"
                  >
                    {showMoreDesc ? "Show less" : "Show more"}
                  </button>
                </div>

                {/* Availability */}
                <div className="mb-6">
                  <p className="text-base font-bold text-gray-800 mb-2 tracking-wide">
                    Availability
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-green-600">
                      <svg
                        className="w-5 h-5 inline"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z" />
                      </svg>
                    </span>
                    <span className="text-base text-green-600 font-semibold">
                      In stock, and ready to ship
                    </span>
                  </div>
                  <div className="mt-3 w-full h-1.5 bg-green-500 rounded-full" />
                </div>

                {/* Unit of Measure */}
                <div className="mb-6">
                  <p className="text-base font-bold text-gray-800 mb-3 tracking-wide">
                    Unit of Measure:{" "}
                    <span className="text-[#4a2c2a]">EACH</span>
                  </p>
                  <select className="w-full border-2 border-gray-300 rounded-sm px-4 py-3 text-base text-gray-700 bg-white focus:outline-none focus:border-[#4a2c2a] font-medium transition-colors">
                    <option>EACH</option>
                  </select>
                </div>
              </>
            ) : (
              /* ── Original Specs Grid (non-accessories) ── */
              <>
                <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-10">
                  {finish && finish !== "OTHER" && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">
                        Surface Finish
                      </p>
                      <p className="text-[13px] font-semibold text-[#4a2c2a]">
                        {finish}
                      </p>
                    </div>
                  )}
                  {dimension && dimension !== "accessories" && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">
                        Dimensions
                      </p>
                      <p className="text-[13px] font-semibold text-[#4a2c2a]">
                        {dimension.replace("x", " × ")} mm
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">
                      Category
                    </p>
                    <p className="text-[13px] font-semibold text-[#4a2c2a]">
                      {category}
                    </p>
                  </div>
                  {getMeasurement(fileNameOnly) && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">
                        {(isAurlProduct || isPaveProduct || isSaltedProduct) ? "Thickness" : "Measurement"}
                      </p>
                      <p className="text-[13px] font-semibold text-[#4a2c2a]">
                        {getMeasurement(fileNameOnly)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="w-full h-[1px] bg-gray-100 mb-8" />
              </>
            )}

            {/* ── Pricing & Cart Section ── */}
            {details.isAccessory || isPoster || !(dimension.toLowerCase().includes("600x600") || dimension.toLowerCase().includes("600x1200") || dimension.toLowerCase().includes("300x600")) ? (
              <>
                {/* ── Old Pricing ── */}
                {isPoster ? (
                  <div className="mb-8">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">
                      Price
                    </p>
                    <p className="text-3xl font-bold text-[#4a2c2a]">POA</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Please enquire for pricing
                    </p>
                  </div>
                ) : isComingSoon ? (
                  <div className="mb-8">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">
                      Price
                    </p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-xl font-bold text-gray-400 uppercase tracking-wider">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">
                      Price
                    </p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-bold text-[#4a2c2a]">
                        £{details.price.toFixed(2)}
                      </span>
                      {displayOriginalPrice > details.price && (
                        <span className="text-xl line-through text-gray-300">
                          £{displayOriginalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Add to Cart / Buy Now ── */}
                <div className="flex flex-col gap-3 mb-8">
                  {isComingSoon ? (
                    <button
                      disabled
                      className="w-full py-4 text-[11px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-3 bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  ) : isPoster ? (
                    <Link
                      href="/contact"
                      className="w-full py-4 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 flex items-center justify-center gap-3 bg-[#222] text-white hover:bg-black shadow-lg"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      Inquire for Price
                    </Link>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className={`flex-1 py-4 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 flex items-center justify-center gap-3
                          ${isSuccess
                            ? "bg-green-600 text-white"
                            : "bg-[#4a2c2a] text-white hover:bg-[#3a1c1a] active:scale-[0.98]"
                          } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        {isAdding ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Adding...
                          </>
                        ) : isSuccess ? (
                          "Added to Cart"
                        ) : (
                          "Add to Cart"
                        )}
                      </button>
                    </div>
                  )}

                  {/* Wishlist + Share */}
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={handleWishlist}
                      className={`flex-1 py-3.5 border text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300
                        ${isWishlisted
                          ? "border-[#4a2c2a] bg-[#4a2c2a] text-white"
                          : "border-gray-300 text-gray-600 hover:border-[#4a2c2a] hover:text-[#4a2c2a]"
                        }`}
                    >
                      {isWishlisted ? "Wishlisted" : "Wishlist"}
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 py-3.5 border border-gray-300 text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:border-[#4a2c2a] hover:text-[#4a2c2a] transition-all duration-300"
                    >
                      {shareMsg || "Share"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">
                    Price
                  </p>
                  <div className="flex items-baseline gap-3">
                    {isComingSoon ? (
                      <span className="text-xl font-bold text-gray-400 uppercase tracking-wider">
                        Coming Soon
                      </span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-[#4a2c2a]">
                          £{details.price.toFixed(2)}
                        </span>
                        {displayOriginalPrice > details.price && (
                          <span className="text-xl line-through text-gray-300">
                            £{displayOriginalPrice.toFixed(2)}
                          </span>
                        )}
                        <span className="text-[11px] text-gray-400 font-medium">
                          / m²
                        </span>
                      </>
                    )}
                  </div>
                  {!isComingSoon && displayOriginalPrice > details.price && (
                    <div className="mt-2 inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full">
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Save £{(displayOriginalPrice - details.price).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {isComingSoon ? (
                  <div className="mb-8">
                    <button
                      disabled
                      className="w-full py-4 text-[11px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-3 bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  </div>
                ) : (
                  <TilePackCalculator
                    productId={fileNameOnly}
                    productName={displayName}
                    pricePerM2={details.price}
                    size={dimension}
                    image={displayImagePath.startsWith("http") ? displayImagePath.split("?")[0] : displayImagePath.startsWith("comingsoon/") ? `/${displayImagePath.split("?")[0]}` : `/tiles/${displayImagePath.split("?")[0]}`}
                    token={token}
                    router={router}
                  />
                )}

                <div className="flex gap-3 mb-8">
                  <button
                    onClick={handleWishlist}
                    className={`flex-1 py-3.5 border text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300
                      ${isWishlisted
                        ? "border-[#4a2c2a] bg-[#4a2c2a] text-white"
                        : "border-gray-300 text-gray-600 hover:border-[#4a2c2a] hover:text-[#4a2c2a]"
                      }`}
                  >
                    {isWishlisted ? "Wishlisted" : "Wishlist"}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 py-3.5 border border-gray-300 text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:border-[#4a2c2a] hover:text-[#4a2c2a] transition-all duration-300"
                  >
                    {shareMsg || "Share"}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
            </main>

{/* Bottom Navigation */}
<div className="max-w-[1440px] mx-auto px-6 md:px-14 border-t border-gray-100 pt-10 flex items-center justify-between">
  <Link
    href="/products"
    className="inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-[#4a2c2a] hover:gap-5 transition-all duration-300"
  >
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
    Back to Collection
  </Link>

  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
    Premium · Architectural · Surfaces
  </p>
</div>

{/* Horizontal preview image for AURL product */}
{isAurlProduct && (
  <div className="max-w-[1440px] mx-auto px-6 md:px-14 pb-16 pt-10">
    <div className="w-full bg-transparent rounded-sm overflow-hidden flex items-center justify-center p-4">
      <img
        src={"/tiles/" + "600x600/AURL GRIGIO ARCO (605x605) 16mm (5)--MATT.jpeg".split('/').map(s => encodeURIComponent(s)).join('/')}
        alt="AURL GRIGIO ARCO Horizontal Preview"
        className="w-full h-auto object-contain max-h-[500px]"
      />
    </div>
  </div>
)}

{/* Horizontal preview image for Pave product */}
{isPaveProduct && (
  <div className="max-w-[1440px] mx-auto px-6 md:px-14 pb-16 pt-10">
    <div className="w-full bg-transparent rounded-sm overflow-hidden flex items-center justify-center p-4">
      <img
        src={"/tiles/" + "600x600/PAVE' PARIS G (605x605) 16mm (1).jpeg".split('/').map(s => encodeURIComponent(s)).join('/')}
        alt="PAVE PARIS Horizontal Preview"
        className="w-full h-auto object-contain max-h-[500px]"
      />
    </div>
  </div>
)}

{/* Horizontal preview image for Salted Concreto product */}
{isSaltedProduct && (
  <div className="max-w-[1440px] mx-auto px-6 md:px-14 pb-16 pt-10">
    <div className="w-full bg-transparent rounded-sm overflow-hidden flex items-center justify-center p-4">
      <img
        src={"/tiles/" + "600x600/Salted concreto crema 600x900 x 20mm (1).jpeg".split('/').map(s => encodeURIComponent(s)).join('/')}
        alt="Salted Concreto Horizontal Preview"
        className="w-full h-auto object-contain max-h-[500px]"
      />
    </div>
  </div>
)}

{/* Dynamic Preview Image */}
{previewUrl && !isAurlProduct && !isPaveProduct && !isSaltedProduct && (
  <div className="max-w-[1440px] mx-auto px-6 md:px-14 pb-16 pt-10 border-t border-gray-100">
    <h3 className="text-2xl font-serif text-[#4a2c2a] mb-8 text-center">Room Preview</h3>
    <div className="w-full bg-[#fbfbfb] rounded-sm overflow-hidden flex items-center justify-center p-4">
      <img
        src={previewUrl}
        alt={`${displayName} Room Preview`}
        className="w-full h-auto object-contain max-h-[600px]"
      />
    </div>
  </div>
)}
</div>
);
}
