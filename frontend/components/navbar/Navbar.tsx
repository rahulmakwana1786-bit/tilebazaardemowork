// "use client"
// import React from 'react';
// import Link from 'next/link';
// import Image from 'next/image';
// import CartDrawer from '../common/CartDrawer';
// import { useCart } from '@/context/CartContext';

// const Navbar = () => {
//     const { isCartOpen, setCartOpen, cartItems } = useCart();
//   return (
//     <>
//     <nav className="fixed top-0 w-full bg-white border-b border-gray-100 px-6 py-4 font-sans z-50">
//       {/* Logo Section */}
//       <div className="max-w-[1380px] mx-auto flex items-center justify-between">
//       <div className="shrink-0">
//         <Link href="/" className="text-3xl font-serif font-bold text-[#4a2c2a] tracking-tight">
//           <Image src="/logo.png" alt="Logo" width={80} height={80} />
//         </Link>
//       </div>

//       {/* Navigation Links */}
//       <div className="hidden md:flex items-center space-x-8 text-[13px] font-medium uppercase tracking-wider text-[#4a2c2a]">
//         <Link href="/" className="hover:opacity-70 transition-opacity">Home</Link>
//         <Link href="/products" className="hover:opacity-70 transition-opacity">Products</Link>
//         <Link href="/about" className="hover:opacity-70 transition-opacity">About Us</Link>
//       </div>

//       {/* Utility Icons */}
//       {/* <div className="flex items-center space-x-5 text-[#4a2c2a]"> */}
//         {/* User Icon */}
//         {/* <button className="p-1 hover:opacity-60 cursor-pointer">
//           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
//         </button> */}

//         {/* Wishlist Icon */}
//         {/* <button className="p-1 hover:opacity-60 cursor-pointer">
//           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
//         </button> */}

//         {/* Cart Icon with Badge */}
//         {/* <button onClick={() => setCartOpen(true)} className="p-1 relative hover:opacity-60 cursor-pointer">
//           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
//           {cartItems.length > 0 && (
//             <span className="absolute -top-1 -right-1 bg-[#4a2c2a] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
//               {cartItems.length}
//             </span>
//           )}
//         </button> */}

//         {/* Search Icon */}
//         {/* <button className="p-1 hover:opacity-60 cursor-pointer">
//           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
//         </button> */}
//       {/* </div> */}
//       </div>
//     </nav>
//     <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
//       </>
//   );
// };

// export default Navbar;

"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FiShoppingCart, FiUser, FiHeart } from "react-icons/fi";
import CartDrawer from "../common/CartDrawer";
import { useCart } from "@/context/CartContext";
import { useAppSelector } from "@/store/hooks";

const Navbar = () => {
  const pathname = usePathname();
  const { isCartOpen, setCartOpen } = useCart();
  const cartItems = useAppSelector((state) => state.cart.items);
  const { user } = useAppSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

const readWishlistCount = useCallback(() => {
  if (typeof window === "undefined") return;

  try {
    const stored = JSON.parse(
      localStorage.getItem("tb_wishlist") || "[]"
    ) as string[];

    // Prevent unnecessary state updates
    setWishlistCount((prev) => {
      return prev !== stored.length ? stored.length : prev;
    });
  } catch {
    setWishlistCount(0);
  }
}, []);

useEffect(() => {
  // Run after render
  const timeout = setTimeout(() => {
    readWishlistCount();
  }, 0);

  const handleStorage = (e: StorageEvent) => {
    if (e.key === "tb_wishlist") {
      readWishlistCount();
    }
  };

  const handleCustom = () => {
    readWishlistCount();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener("wishlist-updated", handleCustom);

  return () => {
    clearTimeout(timeout);

    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("wishlist-updated", handleCustom);
  };
}, [readWishlistCount]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Products", href: "/products" },
    { name: "Calculator", href: "/tile-calculator" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <nav className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white font-sans">
        <div className="w-full border-b border-gray-100 bg-white py-2">
          <div className="mx-auto flex max-w-[1440px] justify-center px-6">
            <p className="text-[11px] font-medium tracking-wide text-black md:text-[13px]">
              Free Delivery on Orders Over 500 sqm
            </p>
          </div>
        </div>

        <div className="mx-auto grid h-[82px] max-w-[1380px] grid-cols-[1fr_auto_1fr] items-center px-6 md:px-10">
          {/* Logo Section */}
          <div className="shrink-0 relative z-50">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo-2.png"
                alt="Logo"
                width={100}
                height={100}
                className="h-16 w-auto md:h-[74px]"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center justify-center gap-9 text-[12px] font-bold uppercase tracking-[0.32em] text-[#3e1f1c] md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`transition-all hover:opacity-60 ${isActive ? "text-black font-black drop-shadow-sm" : "opacity-80"}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Icons */}
          <div className="hidden items-center justify-end gap-7 text-[#4a2c2a] md:flex">
            <Link
              href={user ? "/profile" : "/login"}
              aria-label="Account"
              className="flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-60"
            >
              <FiUser size={20} strokeWidth={1.6} />
            </Link>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-60"
            >
              <FiHeart size={20} strokeWidth={1.6} />
              {wishlistCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#4a2c2a] text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              aria-label="Cart"
              onClick={() => setCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-60"
            >
              <FiShoppingCart size={21} strokeWidth={1.6} />
              {cartItems.length > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#4a2c2a] text-[9px] font-bold text-white">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Toggle & Cart */}
          <div className="relative z-50 ml-auto flex items-center gap-4 text-[#4a2c2a] md:hidden">
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative flex h-9 w-9 items-center justify-center transition-opacity hover:opacity-60"
            >
              <FiHeart size={20} strokeWidth={1.6} />
              {wishlistCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#4a2c2a] text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              aria-label="Cart"
              onClick={() => setCartOpen(true)}
              className="relative flex h-9 w-9 items-center justify-center transition-opacity hover:opacity-60"
            >
              <FiShoppingCart size={21} strokeWidth={1.6} />
              {cartItems.length > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#4a2c2a] text-[9px] font-bold text-white">
                  {cartItems.length}
                </span>
              )}
            </button>
            {/* Hamburger Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 transition-all hover:opacity-60 md:hidden"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <div
          className={`
  fixed right-0 top-0 z-40 h-screen w-[82vw] max-w-[360px] bg-white shadow-2xl md:hidden
  transition-transform duration-500 ease-in-out
  ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
`}
        >
          <div className="flex h-full flex-col items-end justify-center space-y-8 px-8 text-right font-serif text-[16px] uppercase tracking-[0.3em]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`transition-all hover:opacity-60 ${isActive ? "text-black font-black" : "text-[#4a2c2a]"}`}
                >
                  {link.name}
                </Link>
              );
            })}

            <Link
              href="/wishlist"
              onClick={() => setIsMenuOpen(false)}
              className="hover:opacity-60 transition-all font-bold text-[#4a2c2a]"
            >
              Wishlist
            </Link>

            <Link
              href={user ? "/profile" : "/login"}
              onClick={() => setIsMenuOpen(false)}
              className="hover:opacity-60 transition-all font-bold text-[#4a2c2a] border-t border-gray-100 pt-4 w-full block text-right"
            >
              {user ? "Account" : "Login / Register"}
            </Link>

            {/* Optional: Add a small decorative line at the bottom to match your style */}
            {/* <div className="w-8 h-[1px] bg-[#4a2c2a]/20 pt-2"></div> */}
          </div>
        </div>

        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Navbar;
