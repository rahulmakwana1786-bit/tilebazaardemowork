"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCartAsync, mockAddToCart } from "@/store/slices/cartSlice";
import { RootState } from "@/store/store";
import { useCart } from "@/context/CartContext";
import TilePackTable from "@/components/products/TilePackTable";

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
  if (upper.includes("VALIDUS")) {
    return getValidusName(name);
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
  ["gl 2513 decor", "gl 2513 lt"],
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
  if (upper.includes("MATTING") || upper.includes("DURA"))
    return {
      price: 6,
      unit: "+vat/sqm",
      isAccessory: true,
      isAdhesive: false,
      isTrim: false,
    };
  if (upper.includes("LEVEL"))
    return {
      price: 6,
      unit: "+vat/bag",
      isAccessory: true,
      isAdhesive: false,
      isTrim: false,
    };
  if (
    upper.includes("AURL GRIGIO") ||
    upper.includes("PAVE") ||
    upper.includes("SALT CONCRETO") ||
    upper.includes("SALTED CONCRETO")
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
  // slug is the URL-encoded relative tile path, e.g. "600x600%2FALEXA+BEIGE_R1--GLOSS.jpg"
  const imagePath = decodeURIComponent(resolvedParams.slug); // e.g. "600x600/ALEXA BEIGE_R1--GLOSS.jpg"
  const fileNameOnly = imagePath.split("/").pop() || imagePath;
  const dimension = imagePath.split("/")[0] || "N/A"; // folder = dimension, e.g. "600x600"
  
  console.log("DEBUG: received slug =", resolvedParams.slug);
  console.log("DEBUG: decoded imagePath =", imagePath);
  console.log("DEBUG: fileNameOnly =", fileNameOnly);
  console.log("DEBUG: dimension =", dimension);

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

  const finish = getFinish(fileNameOnly);
  const details = getProductDetails(fileNameOnly);
  const category = getCategory(fileNameOnly);
  const displayName = formatFileName(fileNameOnly);
  const isPoster = fileNameOnly.toUpperCase().includes("POSTER");

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
  const [showMoreDesc, setShowMoreDesc] = useState(false);
  const [showMoreAdhesiveFeats, setShowMoreAdhesiveFeats] = useState(false);
  const [allTiles, setAllTiles] = useState<string[]>([]);

  // Quantity State for accessories
  const [accessoryQty, setAccessoryQty] = useState(1);

  useEffect(() => {
    import("@/app/actions").then((module) => {
      module.getAllTilePaths().then((paths) => setAllTiles(paths));
    });
  }, []);

  const currentNameLower = getVariantMatchName(fileNameOnly).toLowerCase();
  const matchedRightGroup = rightSideVariantsGroup.find((g) =>
    g.includes(currentNameLower),
  );
  const matchedLeftGroup = leftSideVariantsGroup.find((g) =>
    g.includes(currentNameLower),
  );

  const variantPaths = React.useMemo(() => {
    const group = matchedRightGroup || matchedLeftGroup;
    if (!group || allTiles.length === 0) return [];

    const currentFileName = imagePath.split("/").pop() || imagePath;
    const currentSuffix = getFileNameSuffix(currentFileName).toLowerCase();

    const paths: string[] = [];
    for (const itemName of group) {
      const candidates = allTiles.filter(
        (t) =>
          getVariantMatchName(t.split("/").pop() || t).toLowerCase() === itemName
      );

      if (candidates.length > 0) {
        let best = candidates[0];
        if (currentSuffix) {
          const matched = candidates.find((c) => {
            const cName = c.split("/").pop() || c;
            const cSuffix = getFileNameSuffix(cName).toLowerCase();
            return cSuffix === currentSuffix;
          });
          if (matched) {
            best = matched;
          } else {
            const partial = currentSuffix.replace(/_1$/, "");
            if (partial) {
              const matchedPartial = candidates.find((c) => {
                const cName = c.split("/").pop() || c;
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
        quantity: details.isAccessory || isPoster ? accessoryQty : 1,
        unit: "boxes",
        sqm: undefined,
        boxes: undefined,
        tiles: undefined,
        weight: undefined,
        palletType: undefined,
        product: {
          id: fileNameOnly,
          name: displayName,
          price: details.price,
          image: `/tiles/${displayImagePath}`,
          size: dimension,
          slug: fileNameOnly,
        },
      }),
    );
  };

  const handleAddToCart = async () => {
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      setIsAdding(true);
      await dispatch(
        addToCartAsync({
          product_id: fileNameOnly,
          quantity: details.isAccessory || isPoster ? accessoryQty : 1,
          sqm: undefined,
          boxes: undefined,
          tiles: undefined,
          weight: undefined,
          palletType: undefined,
        }),
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

  const handleTilePackAddToCart = async (totalSqm: number, totalBoxes: number, totalWeight: number, totalTiles: number) => {
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      setIsAdding(true);
      await dispatch(
        addToCartAsync({
          product_id: fileNameOnly,
          quantity: totalBoxes,
          sqm: totalSqm,
          boxes: totalBoxes,
          tiles: totalTiles,
          weight: totalWeight,
          palletType: totalWeight > 1000 ? "FULL" : "HALF",
        }),
      ).unwrap();
      setIsSuccess(true);
      setCartOpen(true);
      setTimeout(() => setIsSuccess(false), 2500);
    } catch {
      setIsSuccess(true);
      setCartOpen(true);
      setTimeout(() => setIsSuccess(false), 2500);
    }
  };

  /* ── Wishlist — toggle and persist to localStorage ── */
  const handleWishlist = () => {
    setIsWishlisted((prev) => {
      const next = !prev;
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
      return next;
    });
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
          <div className="w-full lg:w-[55%] xl:w-[58%] sticky top-28">
            <div className="relative w-full aspect-square bg-[#f8f6f3] rounded-sm overflow-hidden shadow-sm flex items-center justify-center p-6 md:p-10 transition-all duration-300">
              {!imgError ? (
                <img
                  src={fileNameOnly.toUpperCase().includes('TRIM') ? '/images/accessories/trim/tile-trim.png' : `/tiles/${displayImagePath.split('/').map(s => encodeURIComponent(s)).join('/')}`}
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
            ) && !isAurlProduct && !isPaveProduct && !isSaltedProduct && (
              <div className="mt-4 flex gap-3">
                <div className="w-20 h-20 bg-[#f8f6f3] border-2 border-[#4a2c2a] rounded-sm overflow-hidden flex items-center justify-center p-1 flex-shrink-0">
                  <img
                    src={fileNameOnly.toUpperCase().includes('TRIM') ? '/images/accessories/trim/tile-trim.png' : `/tiles/${displayImagePath.split('/').map(s => encodeURIComponent(s)).join('/')}`}
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
                    const isActive = path === imagePath;
                    const vName = formatFileName(path.split("/").pop() || path);
                    return (
                      <Link
                        key={path}
                        href={`/products/${encodeURIComponent(path)}`}
                        className="group flex flex-col items-center"
                      >
                        <div
                          className={`relative w-36 h-24 md:w-40 md:h-28 bg-[#f8f6f3] border-[3px] ${isActive ? "border-black" : "border-transparent shadow-sm"} hover:border-black/40 transition-colors overflow-hidden`}
                        >
                          <img
                            src={`/tiles/${path}`}
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
                      className={`w-24 h-24 md:w-28 md:h-28 bg-[#f8f6f3] border-2 ${
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
                      className={`w-24 h-24 md:w-28 md:h-28 bg-[#f8f6f3] border-2 ${
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
                      className={`w-24 h-24 md:w-28 md:h-28 bg-[#f8f6f3] border-2 ${
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
                      className={`w-24 h-24 md:w-28 md:h-28 bg-[#f8f6f3] border-2 ${
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
                      className={`w-24 h-24 md:w-28 md:h-28 bg-[#f8f6f3] border-2 ${
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
                      className={`w-24 h-24 md:w-28 md:h-28 bg-[#f8f6f3] border-2 ${
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
                      className={`w-24 h-24 md:w-28 md:h-28 bg-[#f8f6f3] border-2 ${
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
                      className={`w-24 h-24 md:w-28 md:h-28 bg-[#f8f6f3] border-2 ${
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
                      className={`w-24 h-24 md:w-28 md:h-28 bg-[#f8f6f3] border-2 ${
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
                      className={`w-24 h-24 md:w-28 md:h-28 bg-[#f8f6f3] border-2 ${
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

            {matchedRightGroup && variantPaths.length > 0 && (
              <div className="mb-10 pb-10 border-b border-gray-100">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">
                  Available Variants
                </p>
                <div className="flex flex-wrap gap-4">
                  {variantPaths.map((path) => {
                    const isActive = path === imagePath;
                    const vName = formatFileName(path.split("/").pop() || path);
                    return (
                      <Link
                        key={path}
                        href={`/products/${encodeURIComponent(path)}`}
                        className="group flex flex-col items-center"
                      >
                        <div
                          className={`relative w-24 h-24 md:w-28 md:h-28 bg-[#f8f6f3] border-2 ${isActive ? "border-[#4a2c2a]" : "border-transparent"} hover:border-[#4a2c2a]/50 transition-colors rounded-sm overflow-hidden`}
                        >
                          <img
                            src={`/tiles/${path}`}
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
                    A coated effect Aluminium profile for the protection and
                    neat finishing of tiled corners and edges. Suitable for use
                    on walls and floors. Provides a decorative finish.
                  </p>
                  <div
                    className={`transition-all duration-300 overflow-hidden ${showMoreDesc ? "max-h-40 opacity-100 mb-5" : "max-h-0 opacity-0 mb-0"}`}
                  >
                    <ul className="list-disc list-inside text-base text-[#4a2c2a]/70 space-y-2 font-medium">
                      <li>Provides a decorative finish</li>
                      <li>Suitable for walls and floors</li>
                      <li>Aluminium profile — durable &amp; lightweight</li>
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

            {/* ── Pricing ── */}
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
            ) : (
              <div className="mb-8">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">
                  Price
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-[#4a2c2a]">
                    £{details.price.toFixed(2)}
                  </span>
                  {!details.isAccessory && (
                    <span className="text-xl line-through text-gray-300">
                      £{(details.price + 5).toFixed(2)}
                    </span>
                  )}
                  <span className="text-[11px] text-gray-400 font-medium">
                    / {details.unit}
                  </span>
                </div>
                {!details.isAccessory && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Save £{(5).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ── TilePackTable (only if regular tile) ── */}
            {!details.isAccessory && !isPoster && (
              <TilePackTable
                pricePerSqm={details.price}
                tileSize={dimension}
                onAddToCart={handleTilePackAddToCart}
              />
            )}

            {/* ── Add to Cart + Buy Now (only for accessories & posters) ── */}
            {(details.isAccessory || isPoster) && (
              <div className="flex flex-col gap-3 mb-8">
                {/* Accessory Quantity Selector */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold text-[#4a2c2a] uppercase tracking-wider">Quantity:</span>
                  <div className="flex items-center border border-[#4a2c2a]/20 rounded-sm">
                    <button onClick={() => setAccessoryQty(Math.max(1, accessoryQty - 1))} className="px-4 py-2 hover:bg-[#4a2c2a]/5 transition-colors text-[#4a2c2a]">-</button>
                    <span className="px-4 py-2 font-bold text-[#4a2c2a]">{accessoryQty}</span>
                    <button onClick={() => setAccessoryQty(accessoryQty + 1)} className="px-4 py-2 hover:bg-[#4a2c2a]/5 transition-colors text-[#4a2c2a]">+</button>
                  </div>
                </div>
                
                {/* Add to Cart + Buy Now — side by side */}
                <div className="flex gap-3">
                  {/* Add to Cart */}
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
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>

                  {/* Buy Now */}
                  <button
                    onClick={() => {
                      handleAddToCart().then(() => {
                        router.push("/checkout");
                      });
                    }}
                    disabled={isAdding}
                    className="flex-1 py-4 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 flex items-center justify-center gap-3 bg-[#4a2c2a] text-white hover:bg-[#a0750a] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Buy Now
                  </button>
                </div>
              </div>
            )}

            {/* Wishlist + Share (Available for all) */}
            <div className="flex gap-3 mb-8">
                <button
                  onClick={handleWishlist}
                  className={`flex-1 py-3.5 border text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300
                    ${isWishlisted
                      ? "border-[#4a2c2a] bg-[#4a2c2a] text-white"
                      : "border-gray-300 text-gray-600 hover:border-[#4a2c2a] hover:text-[#4a2c2a]"
                    }`}
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill={isWishlisted ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                  {isWishlisted ? "Wishlisted" : "Wishlist"}
                </button>

                <button
                  onClick={handleShare}
                  className="flex-1 py-3.5 border border-gray-300 text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:border-[#4a2c2a] hover:text-[#4a2c2a] transition-all duration-300"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  {shareMsg || "Share"}
                </button>
              </div>
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
    <div className="w-full bg-[#f8f6f3] rounded-sm overflow-hidden shadow-sm flex items-center justify-center p-4">
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
    <div className="w-full bg-[#f8f6f3] rounded-sm overflow-hidden shadow-sm flex items-center justify-center p-4">
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
    <div className="w-full bg-[#f8f6f3] rounded-sm overflow-hidden shadow-sm flex items-center justify-center p-4">
      <img
        src={"/tiles/" + "600x600/Salted concreto crema 600x900 x 20mm (1).jpeg".split('/').map(s => encodeURIComponent(s)).join('/')}
        alt="Salted Concreto Horizontal Preview"
        className="w-full h-auto object-contain max-h-[500px]"
      />
    </div>
  </div>
)}
</div>
);
}
