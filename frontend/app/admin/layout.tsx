// // frontend/app/admin/layout.tsx
// "use client";
// import React, { useEffect } from "react";
// import { useAppSelector } from "@/store/hooks";
// import { useRouter } from "next/navigation";

// export default function AdminLayout({ children }: { children: React.ReactNode }) {
//   const { user, token, loading } = useAppSelector((state) => state.auth);
//   const router = useRouter();

//   useEffect(() => {
//     // If we're done loading and there's no admin user, kick them out
//     if (!loading && (!token || user?.role !== "admin")) {
//       router.push("/login");
//     }
//   }, [user, token, loading, router]);

//   // If loading or not an admin, show nothing to prevent "flashing" admin content
//   if (loading || !user || user.role !== "admin") {
//     return (
//       <div className="h-screen flex items-center justify-center bg-white text-[10px] uppercase tracking-widest">
//         Verifying Access...
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-gray-50 text-[#4a2c2a]">
//       {/* Your Sidebar and Header code here */}
//       <main className="flex-1 overflow-y-auto p-8">
//         {children}
//       </main>
//     </div>
//   );
// }


"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { logout } from "@/store/slices/authSlice";
import api from "@/lib/axios";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Mail,
  LogOut,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { fetchDashboardStats, fetchAllCustomers, fetchProjectInquiries, clearAdminData } from "@/store/slices/adminSlice";
import { fetchAdminProducts, clearProductData } from "@/store/slices/productSlice";
import { fetchAllOrders, clearOrders } from "@/store/slices/orderSlice";

const navLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Inquiries", href: "/admin/inquiries", icon: Mail },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Admins", href: "/admin/admins", icon: Shield },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token, loading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);
  const handleSignOut = async () => {
    if (user?.email) {
      try {
        await api.post("/api/auth/logout", { email: user.email });
      } catch (err) {
        console.error("Failed to track logout:", err);
      }
    }
    // 1. Clear Redux state across all admin-related modules
    dispatch(logout());
    dispatch(clearAdminData());
    dispatch(clearProductData());
    dispatch(clearOrders());
    
    // 2. Remove token from storage
    localStorage.removeItem("token"); 
    toast.success("SESSION CLOSED", {
      style: {
        borderRadius: '0px',
        background: '#4a2c2a',
        color: '#fff',
        fontSize: '10px',
        letterSpacing: '0.2em'
      }
    });
    // 3. Push to login
    router.push("/login");
  };
  useEffect(() => {
    // This only runs on the client side after the first render
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);
  useEffect(() => {
    // Only attempt to redirect if:
    // 1. The component is hydrated (running in browser)
    // 2. Redux isn't currently fetching a fresh profile (loading: false)
    if (isHydrated && !loading) {
      if (!token || user?.role !== "admin") {
        router.push("/login");
      } else {
        // PRE-FETCH DATA: Load all admin data in the background on mount
        // to make switching between pages instant.
        dispatch(fetchDashboardStats());
        dispatch(fetchAdminProducts());
        dispatch(fetchAllOrders());
        dispatch(fetchAllCustomers());
        dispatch(fetchProjectInquiries());
      }
    }
  }, [user, token, loading, isHydrated, router, dispatch]);

  if (!isHydrated || loading || !user || user.role !== "admin") {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-[#4a2c2a] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F9F9F9] text-[#4a2c2a]">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#4a2c2a] text-white flex flex-col shadow-2xl">
        <div className="p-8">
          <h2 className="text-xl font-serif tracking-tight">TileBazaar</h2>
          <p className="text-[8px] uppercase tracking-[0.3em] opacity-40 mt-1">Systems Admin</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-all ${
                  isActive 
                    ? "bg-white text-[#4a2c2a] rounded-sm shadow-lg" 
                    : "opacity-50 hover:opacity-100 hover:bg-white/5"
                }`}
              >
                <Icon size={16} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/10 space-y-4">
          <Link href="/" className="flex items-center gap-2 text-[9px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
            <ArrowLeft size={14} /> View Storefront
          </Link>
          <button 
    onClick={handleSignOut} // Attach handler here
    className="flex items-center gap-2 text-[9px] uppercase tracking-widest cursor-pointer text-red-400 hover:text-red-300 transition-colors w-full"
  >
    <LogOut size={14} /> Sign Out
  </button>
        </div>
      </aside>

      {/* MAIN VIEW */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Location</span>
            <span className="text-xs font-medium">Main Dashboard / {navLinks.find(l => l.href === pathname)?.name}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-tighter">{user.full_name}</p>
              <p className="text-[9px] opacity-40 uppercase">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#4a2c2a] text-white flex items-center justify-center font-serif">
              {user.full_name?.[0]}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10">
          {children}
        </main>
      </div>
    </div>
  );
}