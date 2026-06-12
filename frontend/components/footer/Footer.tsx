// import React from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import { FaFacebookF, FaPinterestP, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa';

// export default function Footer() {
//   return (
//     <footer className="bg-[#EBEBEB] text-[#000] pt-16 pb-8 px-6 md:px-12 font-sans">
//       <div className="max-w-[1440px] mx-auto">

//         <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">

//           {/* 1. ABOUT */}
//           <div>
//             <h4 className="font-bold text-[14px] mb-6 tracking-widest uppercase">About</h4>
//             <ul className="space-y-3 text-[13px] font-medium opacity-90">
//               <li><Link href="#" className="hover:underline">About TileBazaar</Link></li>
//               <li><Link href="#" className="hover:underline">Reviews</Link></li>
//               <li><Link href="#" className="hover:underline">Collections</Link></li>
//               <li><Link href="#" className="hover:underline">Store location</Link></li>
//               <li><Link href="#" className="hover:underline">Contact us</Link></li>
//             </ul>
//           </div>

//           {/* 2. HELP */}
//           <div>
//             <h4 className="font-bold text-[14px] mb-6 tracking-widest uppercase">Help</h4>
//             <ul className="space-y-3 text-[13px] font-medium opacity-90">
//               <li><Link href="#" className="hover:underline">Lodge a return</Link></li>
//               <li><Link href="#" className="hover:underline">Delivery timeframes</Link></li>
//               <li><Link href="#" className="hover:underline">FAQ</Link></li>
//               <li><Link href="#" className="hover:underline">Terms & Conditions</Link></li>
//               <li><Link href="#" className="hover:underline">Privacy Policy</Link></li>
//             </ul>
//           </div>

//           {/* 3. COMPANY */}
//           <div>
//             <h4 className="font-bold text-[14px] mb-6 tracking-widest uppercase">Company</h4>
//             <ul className="space-y-3 text-[13px] font-medium opacity-90">
//               <li><Link href="#" className="hover:underline">Style quiz</Link></li>
//               <li><Link href="#" className="hover:underline">Reno readiness quiz</Link></li>
//               <li><Link href="#" className="hover:underline">Book a design appointment</Link></li>
//               <li><Link href="#" className="hover:underline">Samples</Link></li>
//               <li><Link href="#" className="hover:underline">Blog</Link></li>
//             </ul>
//           </div>

//           {/* 4. Newsletter & Branding (Spans 2 columns on large screens) */}
//           <div className="lg:col-span-2 flex flex-col items-start md:items-end text-left md:text-right">
//             <div className="relative mb-8 w-full max-w-[400px]">
//               {/* "Sign Up!" Script Text */}
//               <span className="absolute -top-10 left-0 font-serif italic text-4xl opacity-80">Sign Up!</span>
//               <div className="flex w-full border border-[#4a2c2a] overflow-hidden">
//                 <input
//                   type="email"
//                   placeholder="Enter your email"
//                   className="bg-[#ffffff] flex-grow px-4 py-3 outline-none text-[13px] placeholder:text-[#4a2c2a]/60"
//                 />
//                 <button className="bg-[#4a2c2a] text-white px-8 py-3 border-l border-black text-[12px] font-bold uppercase tracking-widest hover:bg-opacity-90">
//                   Submit
//                 </button>
//               </div>
//             </div>

//             <div className="mt-4">
//               <h2 className="text-6xl font-serif tracking-tighter mb-4">TileBazaar</h2>
//               <p className="text-[11px] leading-relaxed font-bold uppercase tracking-wider max-w-[400px] ml-auto">
//                 Unit 10, Slough Interchange Industrial Estate, Whittenham Cl, Slough SL2 5EG,<br /> United Kingdom
//               </p>
//               <p className="text-[11px] mt-4 font-medium opacity-80">
//                 +44 20 3915 3853 &nbsp;
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* BOTTOM SECTION */}
//         <div className="flex flex-col md:flex-row justify-between items-center border-t border-[#000]/20 pt-8 pb-16">
//           <div className="flex items-center gap-6 mb-6 md:mb-0">
//             <span className="text-[12px] font-bold uppercase tracking-widest">Follow Us</span>
//             <div className="flex gap-4 text-xl">
//               <FaFacebookF className="cursor-pointer hover:opacity-60" />
//               <FaPinterestP className="cursor-pointer hover:opacity-60" />
//               <FaInstagram className="cursor-pointer hover:opacity-60" />
//               <FaTiktok className="cursor-pointer hover:opacity-60" />
//               <FaYoutube className="cursor-pointer hover:opacity-60" />
//             </div>
//           </div>

//           <div className="text-[11px] font-medium opacity-60 mb-6 md:mb-0">
//             © 2026 TileBazaar
//           </div>

//           {/* Payment Icons Placeholder */}
//           <div className="flex gap-2 grayscale opacity-80 hover:grayscale-0 transition-all">
//              <div className="w-10 h-6 bg-white text-black rounded flex items-center justify-center text-[8px] font-bold border">VISA</div>
//              <div className="w-10 h-6 bg-white text-black rounded flex items-center justify-center text-[8px] font-bold border">PayPal</div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }

import React from "react";
import Link from "next/link";
import {
  FaFacebookF,
  FaPinterestP,
  FaInstagram,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#EBEBEB] text-[#000] pt-16 pb-8 px-6 md:px-12 font-sans border-t border-gray-200">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* 1. MAP SECTION (Spans 5 columns) */}
          <div className="lg:col-span-5 w-full h-[300px] bg-gray-300 transition-all duration-700 rounded-sm overflow-hidden shadow-inner border border-gray-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.5682855581134!2d-0.5898083!3d51.5120359!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487664db8b8e0001%3A0x7d6f582f3775f78a!2sWhittenham%20Cl%2C%20Slough%20SL2%205EG%2C%20UK!5e0!3m2!1sen!2sin!4v1711200000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          {/* 2. NAVIGATION (Spans 3 columns) */}
          <div className="lg:col-span-3 py-12 md:py-0">
            <h4 className="font-bold text-[14px] mb-4 tracking-[0.3em] border-b border-gray-400 pb-4 uppercase text-[#4a2c2a]">
              Our Pages
            </h4>
            <nav className="flex flex-col space-y-4 text-[13px] font-bold uppercase tracking-widest">
              <Link href="/" className="hover:text-[#4a2c2a] transition-colors">
                Home
              </Link>
              <Link
                href="/products"
                className="hover:text-[#4a2c2a] transition-colors"
              >
                About us
              </Link>
              <Link
                href="/contact"
                className="hover:text-[#4a2c2a] transition-colors"
              >
                Products
              </Link>
            </nav>
            <h4 className="font-bold text-[14px] mt-10 mb-4 tracking-[0.1em] border-b border-gray-400 pb-4 uppercase text-[#4a2c2a]">
              Terms and Policies
            </h4>
            <nav className="flex flex-col space-y-4 text-[12px] font-bold uppercase tracking-wide">
              <Link
                href="/policies/privacy-policy"
                className="hover:text-[#4a2c2a] transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/policies/refund-policy"
                className="hover:text-[#4a2c2a] transition-colors"
              >
                Refund Policy
              </Link>
              <Link
                href="/policies/terms-of-service"
                className="hover:text-[#4a2c2a] transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/policies/contact-information"
                className="hover:text-[#4a2c2a] transition-colors"
              >
                Contact Information
              </Link>
              <Link
                href="/policies/shipping-policy"
                className="hover:text-[#4a2c2a] transition-colors"
              >
                Shipping Policy
              </Link>
            </nav>
          </div>

          {/* 3. NEWSLETTER & BRANDING (Spans 4 columns) */}
          <div className="lg:col-span-4 flex flex-col items-start lg:items-end text-left lg:text-right">
            <div className="mb-10 w-full max-w-[400px] flex flex-col">
              <span className="font-serif italic text-4xl opacity-80 text-[#4a2c2a] mb-4 text-left lg:text-right">
                Join the Tile Bazaar
              </span>
              <div className="flex w-full border border-[#4a2c2a]">
                <input
                  type="email"
                  placeholder="Professional Email"
                  className="bg-white flex-grow px-4 py-4 outline-none text-[12px] placeholder:text-[#4a2c2a]/40"
                />
                <button className="bg-[#4a2c2a] text-white px-4 sm:px-8 py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-colors">
                  Subscribe
                </button>
              </div>
            </div>

            <div className="mt-auto">
              <div className="flex justify-start md:justify-end  text-6xl font-serif tracking-tighter mb-4 text-[#4a2c2a]">
                <Image
                  src="/images/logo-2.png"
                  alt="Logo"
                  width={100}
                  height={100}
                  className="w-auto h-25 md:h-30"
                />
              </div>
              <p className="text-[11px] leading-relaxed font-bold uppercase tracking-wider max-w-[320px] lg:ml-auto">
                Unit 10 Slough Interchange Industrial Estate, Whittenham Close,
                Slough, SL2 5EP info@tilebazaar.co.uk 02039153853
              </p>
              <p className="text-[12px] mt-4 font-black tracking-widest text-[#4a2c2a]">
                +44 7424 252426
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-black/10 pt-8 pb-12">
          <div className="flex items-center gap-8 mb-8 md:mb-0">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-40">
              Connect
            </span>
            <div className="flex gap-6 text-lg">
              <Link
                href="https://www.facebook.com/share/1PFi9tive6/?mibextid=wwXIfr"
                target="_blank"
              >
                <FaFacebookF className="cursor-pointer hover:text-[#4a2c2a] transition-colors" />
              </Link>
              <Link
                href="https://www.instagram.com/tile_bazaar?igsh=dHF5YW16MTg2Y2k2&utm_source=qr"
                target="_blank"
              >
                <FaInstagram className="cursor-pointer hover:text-[#4a2c2a] transition-colors" />
              </Link>
              <Link
                href="https://www.tiktok.com/@tile.bazaar?_r=1&_t=ZN-950WtUKmfqQ"
                target="_blank"
              >
                <FaTiktok className="cursor-pointer hover:text-[#4a2c2a] transition-colors" />
              </Link>
            </div>
          </div>

          <div className="text-[12px] flex flex-col items-center font-bold opacity-30 tracking-[0.1em]">
            <p>© 2026 TileBazaar </p>
            <p>
              Designed & Developed by{" "}
              <Link href="https://www.espressomedia.in">
                The Espresso Media
              </Link>
            </p>
          </div>

          <div className="flex gap-3 grayscale opacity-40">
            <div className="px-3 py-1 bg-white border text-[10px] font-bold">
              VISA
            </div>
            <div className="px-3 py-1 bg-white border text-[10px] font-bold">
              PAYPAL
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
