"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCartAsync, mockAddToCart } from "@/store/slices/cartSlice";
import { RootState } from "@/store/store";
import { useCart } from "@/context/CartContext";

/* ─────────────────────────────────────────────
   Pure helper functions (same logic as TileGallery)
───────────────────────────────────────────── */
const getFinish = (fileName: string) => {
  const name = fileName.toUpperCase();
  if (name.includes("--GLOSS")) return "GLOSSY";
  if (name.includes("--MATT")) return "MATT";
  if (name.includes("--CARVING")) return "CARVING";
  if (name.includes("--HIGHGL")) return "HIGH GLOSS";
  if (name.includes("--PUNCHGL")) return "POSTER";
  if (name.includes("--LOVIN")) return "LOVELIN";
  if (name.includes("--TPH")) return "TYPHOON";
  return "OTHER";
};

const formatFileName = (name: string) =>
  name
    .split("--")[0]
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\bR[1-9]\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

const rightSideVariantsGroup = [
  ["alexa beige", "alexa bianco", "alexa brown", "alexa grey"],
  ["armani gris", "armani ivory"],
  ["arte fluto grey", "arte fluto white"],
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
  if (upper.includes("MATTING") || upper.includes("LEVEL"))
    return {
      price: 6,
      unit: "+vat/sqm",
      isAccessory: true,
      isAdhesive: false,
      isTrim: false,
    };
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
    upper.includes("HIGHGL") ||
    upper.includes("PUNCHGL")
  )
    return "Glossy Collection";
  if (upper.includes("MATT")) return "Matt Collection";
  if (upper.includes("CARVING")) return "Carving Collection";
  return "Premium Collection";
};

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

/* ─────────────────────────────────────────────
   Page Component
───────────────────────────────────────────── */
export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  // slug is the URL-encoded relative tile path, e.g. "600x600%2FALEXA+BEIGE_R1--MATT-1.jpg"
  const imagePath = decodeURIComponent(resolvedParams.slug); // e.g. "600x600/ALEXA BEIGE_R1--MATT-1.jpg"
  const fileNameOnly = imagePath.split("/").pop() || imagePath;
  const dimension = imagePath.split("/")[0] || "N/A"; // folder = dimension, e.g. "600x600"

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
  const [allTiles, setAllTiles] = useState<string[]>([]);

  useEffect(() => {
    import("@/app/actions").then((module) => {
      module.getAllTilePaths().then((paths) => setAllTiles(paths));
    });
  }, []);

  const currentNameLower = displayName.toLowerCase();
  const matchedRightGroup = rightSideVariantsGroup.find((g) =>
    g.includes(currentNameLower),
  );
  const matchedLeftGroup = leftSideVariantsGroup.find((g) =>
    g.includes(currentNameLower),
  );

  const variantPaths = React.useMemo(() => {
    const group = matchedRightGroup || matchedLeftGroup;
    if (!group || allTiles.length === 0) return [];

    const paths: string[] = [];
    for (const itemName of group) {
      const found = allTiles.find(
        (t) =>
          formatFileName(t.split("/").pop() || t).toLowerCase() === itemName,
      );
      if (found) {
        paths.push(found);
      }
    }
    return paths;
  }, [matchedRightGroup, matchedLeftGroup, allTiles]);

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
        unit: "boxes",
        product: {
          id: fileNameOnly,
          name: displayName,
          price: details.price,
          image: `/tiles/${imagePath}`,
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
        addToCartAsync({ product_id: fileNameOnly, quantity: 1 }),
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
            <div className="relative w-full aspect-square bg-[#f8f6f3] rounded-sm overflow-hidden shadow-sm">
              {!imgError ? (
                <Image
                  src={`/tiles/${imagePath}`}
                  alt={displayName}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-contain p-10 mix-blend-multiply"
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
              variantPaths.length > 0 &&
              !isPoster
            ) && (
              <div className="mt-4 flex gap-3">
                <div className="w-20 h-20 bg-[#f8f6f3] border-2 border-[#4a2c2a] rounded-sm overflow-hidden relative flex-shrink-0">
                  <Image
                    src={`/tiles/${imagePath}`}
                    alt="thumb"
                    fill
                    className="object-contain p-2 mix-blend-multiply"
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
            {matchedLeftGroup && variantPaths.length > 0 && !isPoster && (
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
                          <Image
                            src={`/tiles/${path}`}
                            alt={vName}
                            fill
                            className="object-cover mix-blend-multiply p-1"
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
            {matchedRightGroup && variantPaths.length > 0 && !isPoster && (
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
                          <Image
                            src={`/tiles/${path}`}
                            alt={vName}
                            fill
                            className="object-cover p-2 mix-blend-multiply"
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

            {/* ── Action Buttons ── */}
            <div className="flex flex-col gap-4 mb-6">
              {/* Add to Cart */}
              {isPoster ? (
                <button
                  disabled
                  className="w-full py-5 bg-gray-100 text-gray-400 text-[11px] font-black uppercase tracking-[0.25em] rounded-sm cursor-not-allowed"
                >
                  Inquire for Price
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className={`w-full py-5 text-[11px] font-black uppercase tracking-[0.25em] rounded-sm border-2 transition-all duration-300 flex items-center justify-center gap-3
                    ${
                      isSuccess
                        ? "bg-green-600 border-green-600 text-white shadow-green-200"
                        : "bg-white border-[#4a2c2a] text-[#4a2c2a] hover:bg-[#4a2c2a] hover:text-white active:scale-[0.99]"
                    } disabled:opacity-70`}
                >
                  {isAdding ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                      Adding...
                    </>
                  ) : isSuccess ? (
                    <>
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>
              )}

              {/* Wishlist */}
              <button
                onClick={handleWishlist}
                className={`w-full py-5 text-[11px] font-black uppercase tracking-[0.25em] rounded-sm border-2 transition-all duration-300 flex items-center justify-center gap-3
                  ${
                    isWishlisted
                      ? "bg-rose-50 border-rose-400 text-rose-600"
                      : "bg-white border-[#4a2c2a] text-[#4a2c2a] hover:bg-[#4a2c2a] hover:text-white"
                  }`}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill={isWishlisted ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
                {isWishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
              </button>
            </div>

            {/* ── Share Button ── */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#4a2c2a] transition-colors px-4 py-2.5 border border-gray-100 rounded-full hover:border-[#4a2c2a]"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
                </svg>
                Share
              </button>
              {shareMsg && (
                <span className="text-[10px] font-bold text-green-600 tracking-wide animate-pulse">
                  {shareMsg}
                </span>
              )}
            </div>

            {/* ── Delivery Info ── */}
            <div className="mt-10 pt-8 border-t border-gray-100 space-y-5">
              <div className="flex items-center gap-4 text-[#4a2c2a]">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="1" y="3" width="15" height="13" rx="1" />
                  <path d="M16 8h4l3 5v3h-7V8zM5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM19.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                <span className="text-sm font-semibold">
                  Free delivery on orders over £500
                </span>
              </div>
              <div className="flex items-center gap-4 text-[#4a2c2a]">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold">
                  Premium quality guaranteed
                </span>
              </div>
              <div className="flex items-center gap-4 text-[#4a2c2a]">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="text-sm font-semibold">Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Adhesive Full-Width Features & Prep Section ── */}
      {details.isAdhesive && (
        <div className="max-w-[1440px] mx-auto px-6 md:px-14 py-16 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Left side: Feature Bullets */}
            <div className="pt-1">
              <ul className="space-y-5">
                {[
                  "Grout after 12 hours",
                  "Walk on after 24 hours",
                  "Highly deformable",
                  "Resistant to vertical slip",
                  "Low Dust",
                  "Long open time",
                  "High yield",
                  "Suitable for use on heated screeds",
                  "For internal and external use",
                  "The addition of Validus Adde improves flexibility to a C2 classification deformability (see mixing chart for correct mixing proportions.)",
                ].map((feat, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 text-xl font-medium text-[#4a2c2a]"
                  >
                    <span className="mt-2.5 w-2.5 h-2.5 rounded-full bg-[#4a2c2a] flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
            {/* Right side: Product Preparation */}
            <div>
              <h4 className="text-2xl font-bold text-[#4a2c2a] mb-6">
                Product Preparation
              </h4>
              <p className="text-xl text-[#4a2c2a] font-medium leading-relaxed mb-8">
                Mix the quantity that you can comfortably use within the
                product’s pot life (30 minutes. As a guide, at 23°C and 50% RH).
                Never add water to buy back lost fluidity doing so will impair
                the final bond strength. This product must be in its final
                position before the mix has started to set. Mix{" "}
                {getValidusName(fileNameOnly)} with clean water, until you
                achieve adhesive of a smooth and lump-free homogeneous
                consistency.
              </p>
              <ul className="space-y-5">
                {[
                  "Walls and floors",
                  "Interior and exterior",
                  "Can be used on non-porous porcelain tiles, and most natural stone (except moisture-sensitive stone) and glass mosaics",
                  "Concrete and Cement screeds *",
                  "Cement based & Gypsum-based boards *",
                  "Swimming Pools",
                  "Terraces or Balconies",
                  "Cement and polymer based flexible waterproofing membranes",
                  "Heavy duty or trafficked areas",
                  "On top of old wall & floor tiles",
                  "* Surfaces must be primed using Validus",
                ].map((feat, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 text-xl font-medium text-[#4a2c2a]"
                  >
                    <span className="mt-2.5 w-2.5 h-2.5 rounded-full bg-[#4a2c2a] flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── Adhesive Info Tabs ── */}
      {details.isAdhesive && <AdhesiveTabs />}

      {/* ── Back to Collection ── */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-14 pb-16">
        <div className="border-t border-gray-100 pt-10 flex items-center justify-between">
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
      </div>
    </div>
  );
}
