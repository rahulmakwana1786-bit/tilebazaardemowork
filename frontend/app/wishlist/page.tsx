"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProducts } from "@/store/slices/productSlice";
import { addToCartAsync, mockAddToCart } from "@/store/slices/cartSlice";
import { useCart } from "@/context/CartContext";
import { IoTrashOutline } from "react-icons/io5";
import { FiShoppingCart, FiChevronLeft } from "react-icons/fi";
import { Heart } from "lucide-react";
import { getAllTilePaths } from "@/app/actions";

const getProductDetails = (fileName: string) => {
  const upper = fileName.toUpperCase();
  if (upper.includes("TRIM")) return { price: 8, isAccessory: true };
  if (upper.includes("SPACER")) return { price: 6, isAccessory: true };
  if (upper.includes("WEDGE")) return { price: 6, isAccessory: true };
  if (upper.includes("ADHESIVE") || upper.includes("GLUE")) return { price: 12, isAccessory: true };
  if (upper.includes("MATTING") || upper.includes("LEVEL")) return { price: 6, isAccessory: true };
  return { price: 15, isAccessory: false };
};

const getCategory = (fileName: string) => {
  const upper = fileName.toUpperCase();
  if (upper.includes("TRIM") || upper.includes("SPACER") || upper.includes("WEDGE") || upper.includes("ADHESIVE") || upper.includes("GLUE") || upper.includes("MATTING") || upper.includes("LEVEL"))
    return "accessories";
  if (upper.includes("OUTDOOR")) return "Outdoor";
  if (upper.includes("DECOR") || upper.includes("POSTER")) return "Decorative";
  if (upper.includes("GLOSS") || upper.includes("HIGHGL") || upper.includes("PUNCHGL")) return "Glossy Collection";
  if (upper.includes("MATT")) return "Matt Collection";
  if (upper.includes("CARVING")) return "Carving Collection";
  return "Premium Collection";
};

const formatFileName = (name: string) => {
  return name
    .split("--")[0]
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\bR[1-9]\b/ig, "")
    .replace(/\s+/g, " ")
    .trim();
};

export default function WishlistPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const { setCartOpen } = useCart();

  const [wishlistSlugs, setWishlistSlugs] = useState<string[]>([]);
  const [allTiles, setAllTiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("tb_wishlist") || "[]") as string[];
      setWishlistSlugs(stored);
    } catch {
      // ignore
    }
    getAllTilePaths().then((paths) => {
      setAllTiles(paths);
      setLoading(false);
    });
  }, []);

  // Remove from wishlist
  const handleRemove = (slug: string) => {
    const updated = wishlistSlugs.filter((s) => s !== slug);
    localStorage.setItem("tb_wishlist", JSON.stringify(updated));
    setWishlistSlugs(updated);
  };

  const performMockAdd = (fileNameOnly: string, details: any) => {
    dispatch(
      mockAddToCart({
        id: Math.random().toString(),
        user_id: "preview_user",
        product_id: fileNameOnly,
        quantity: 1,
        unit: "boxes",
        product: {
          id: fileNameOnly,
          name: formatFileName(fileNameOnly),
          price: details.price,
          image: fileNameOnly,
          size: "600x600",
          slug: fileNameOnly,
        },
      }),
    );
  };

  // Add item to cart
  const handleAddToCart = async (product: any) => {
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      setAddingId(product.slug);
      await dispatch(
        addToCartAsync({ product_id: product.slug, quantity: 1 })
      ).unwrap();
      setCartOpen(true);
    } catch (err) {
      performMockAdd(product.slug, getProductDetails(product.slug));
      setCartOpen(true);
    } finally {
      setAddingId(null);
    }
  };

  // Resolve wishlisted products using allTiles
  const wishlistedProducts = React.useMemo(() => {
    if (allTiles.length === 0) return [];
    return wishlistSlugs.map((slug) => {
      // Find matching path
      const fullPath = allTiles.find((t) => (t.split("/").pop() || t) === slug);
      if (!fullPath) return null;
      
      const fileNameOnly = slug;
      const details = getProductDetails(fileNameOnly);
      
      return {
        id: fileNameOnly,
        name: formatFileName(fileNameOnly),
        slug: fileNameOnly,
        image: `/tiles/${fullPath}`,
        price: details.price,
        discount_price: 0,
        category: getCategory(fileNameOnly),
        size: fullPath.split("/")[0] || "N/A",
      };
    }).filter(Boolean) as any[];
  }, [wishlistSlugs, allTiles]);

  return (
    <div className="bg-white min-h-screen font-sans">
      <section className="mt-24 md:mt-32 pb-24">
        <main className="max-w-[1380px] mx-auto px-6 md:px-10 py-6 text-[#4a2c2a]">
          {/* Back button */}
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#4a2c2a] hover:opacity-60 mb-12 transition-all"
          >
            <FiChevronLeft size={16} />
            Back to Products
          </Link>

          {/* Page Header */}
          <header className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <div className="inline-flex items-center justify-center p-4 bg-rose-50 rounded-full text-rose-500 mb-6 animate-pulse">
              <Heart size={32} fill="currentColor" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif mb-4 text-[#4a2c2a]">My Wishlist</h1>
            <div className="w-20 h-[1.5px] bg-[#4a2c2a] mx-auto mb-6 opacity-40"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">
              Your curated premium selection
            </p>
          </header>

          {loading ? (
            <div className="py-32 flex justify-center items-center">
              <div className="animate-spin h-10 w-10 border-b-2 border-[#4a2c2a] rounded-full"></div>
            </div>
          ) : wishlistedProducts.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 max-w-md mx-auto">
              <h2 className="text-xl font-serif italic text-gray-400 mb-4">
                Your wishlist is empty
              </h2>
              <p className="text-[12px] text-gray-400 mb-8 leading-relaxed">
                Explore our collection of world-class tiles and luxury accessories to add your favorite items here.
              </p>
              <Link
                href="/products"
                className="inline-block bg-[#4a2c2a] text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 shadow-xl transition-all"
              >
                Discover Collection
              </Link>
            </div>
          ) : (
            /* Products Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14">
              {wishlistedProducts.map((product) => {
                const imagePath = product.image;
                const isPoster = product.slug.toUpperCase().includes("POSTER");
                const price = product.price;

                return (
                  <div key={product.id} className="group flex flex-col relative">
                    {/* Remove Wishlist Button in Corner */}
                    <button
                      onClick={() => handleRemove(product.slug)}
                      className="absolute top-4 right-4 z-30 bg-white/80 backdrop-blur-md p-2.5 rounded-full text-gray-400 hover:text-red-500 shadow-md hover:scale-105 active:scale-95 transition-all"
                      title="Remove from wishlist"
                    >
                      <IoTrashOutline size={16} />
                    </button>

                    {/* Image Card Container */}
                    <Link
                      href={`/products/${encodeURIComponent(product.slug)}`}
                      className="relative w-full aspect-[5/4] bg-[#fbfbfb] flex items-center justify-center p-6 mb-5 overflow-hidden group/image cursor-pointer border border-gray-50 hover:border-gray-100 transition-colors"
                    >
                      <Image
                        src={imagePath}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-contain p-8 mix-blend-multiply transition-transform duration-700 group-hover/image:scale-105"
                      />

                      {/* View Details Overlay */}
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                        <span className="bg-white text-[#4a2c2a] px-6 py-3 text-[10px] font-bold uppercase tracking-widest shadow-xl transform translate-y-4 group-hover/image:translate-y-0 transition-all duration-300">
                          View Details
                        </span>
                      </div>
                    </Link>

                    {/* Meta info */}
                    <div className="flex flex-col flex-grow text-left px-2">
                      <Link href={`/products/${encodeURIComponent(product.slug)}`} className="hover:text-[#4a2c2a]/70 transition-colors">
                        <h3 className="text-[12px] font-bold uppercase mb-2">
                          {formatFileName(product.name)}
                        </h3>
                      </Link>

                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                        {product.category || "Tile"} • {product.size}
                      </p>

                      <div className="flex items-end gap-2 mb-6">
                        {isPoster ? (
                          <span className="text-[16px] font-bold text-[#4a2c2a]">POA</span>
                        ) : (
                          <>
                            <span className="text-[16px] font-semibold text-[#4a2c2a]">
                              £{price.toFixed(2)}{" "}
                              <span className="text-[11px] font-normal text-gray-400">
                                / {product.category === "accessories" ? "piece" : "m²"}
                              </span>
                            </span>
                            {product.discount_price && product.discount_price > price && (
                              <span className="text-[12px] line-through text-gray-300 mb-[2px]">
                                £{product.discount_price.toFixed(2)}
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="mt-auto">
                        {isPoster ? (
                          <button
                            disabled={true}
                            className="w-full bg-gray-100 text-gray-400 py-3.5 text-[10px] font-bold uppercase tracking-widest cursor-not-allowed"
                          >
                            Inquire for Price
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={addingId === product.slug}
                            className="w-full bg-[#4a2c2a] text-white py-3.5 text-[10px] font-bold uppercase tracking-widest hover:bg-[#4a2c2a]/95 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                          >
                            <FiShoppingCart size={13} />
                            {addingId === product.slug ? "Adding..." : "Add to Cart"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </section>
    </div>
  );
}
