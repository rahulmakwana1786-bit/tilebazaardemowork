"use client";
import { usePathname } from "next/navigation";
import React from "react";

export default function LayoutGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Define routes that should NOT have Navbar/Footer/Promo
  const isAdminPage = pathname.startsWith("/admin");

  if (isAdminPage) {
    // If it's an admin page, ONLY render the children (the admin content)
    return <>{children}</>;
  }

  // Otherwise, render the children with the layout elements
  return <>{children}</>;
}