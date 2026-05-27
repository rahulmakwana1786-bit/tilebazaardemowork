"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import PromoPopup from "@/components/common/PromoPopup";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // This ensures that /admin, /admin/products, etc., all hide the shop UI
  const isAdminPath = pathname.startsWith("/admin");

  if (isAdminPath) {
    return <>{children}</>;
  }

  return (
    <>
      <PromoPopup />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}