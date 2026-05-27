import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ReduxProvider } from "@/components/Provider";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/AuthProvider";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: {
    default: "Tile Bazaar | Premium Architectural Surfaces & Tiles",
    template: "%s | Tile Bazaar"
  },
  description: "UK's leading supplier of premium architectural surfaces. We provide high-quality tiles for large-scale construction projects and luxury residential designs.",
  verification: {
    google: "yiyRSvBVXQuxkQlzr08FUPiv2oU5cT-9sh77mgMY3kw",
  },
  keywords: ["tiles", "tilebazaar uk", "tilebazaar", "tile Bazaar uk", "porcelain tiles", "ceramic tiles", "natural stone", "mosaics", "wall tiles", "floor tiles", "outdoor tiles", "bathroom tiles", "kitchen tiles", "slabs", "large format tiles", "architectural surfaces", "commercial tiles", "residential tiles", "tiling trade", "tile supplier", "porcelain slabs", "stone tiles", "tile shop UK", "premium tiles", "luxury tiles", "building materials", "construction supplies", "marble", "granite", "terrazzo"],
  metadataBase: new URL('https://www.tilebazaar.co.uk'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/icon.png',
  },
  openGraph: {
    title: 'Tile Bazaar',
    description: 'Leading supplier of premium architectural surfaces in UK. We provide high-quality tiles for large-scale construction projects and luxury residential designs.',
    url: 'https://www.tilebazaar.co.uk',
    siteName: 'Tile Bazaar',
    images: [
      {
        url: '/images/logo-2.png',
        alt: 'Tile Bazaar Premium Surfaces',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tile Bazaar',
    description: 'UK Professional Tile & Surface Suppliers',
    images: ['/images/logo-2.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body cz-shortcut-listen="true">
        <Toaster position="bottom-right" reverseOrder={false} />
        <ReduxProvider>
          <CartProvider>
            <AuthProvider>
            {/* The Wrapper handles the logic of what to show */}
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            </AuthProvider>
          </CartProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
