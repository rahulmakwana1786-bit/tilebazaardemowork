// "use client";
// import React from "react";
// import { FiPhone, FiMail, FiArrowRight } from "react-icons/fi";

// export default function ContactPage() {
//   return (
//     <main className="bg-[#f8f7f5] min-h-screen pt-32 pb-20">
//       <div className="max-w-[1600px] mx-auto px-6 md:px-12">
//         {/* HEADER: Editorial Style */}
//         <header className="mb-24">
//           <h1 className="text-[12vw] md:text-[9vw] font-serif text-[#4a2c2a] leading-[0.8] tracking-tighter">
//             Contact <br />
//             <span className="italic font-light ml-[8vw]">Bazaar.</span>
//           </h1>
//         </header>

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
//           {/* LEFT: Information & Logistics (5 Columns) */}
//           <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col justify-between">
//             <div className="space-y-16">
//               {/* HQ Details */}
//               <div className="border-t border-[#4a2c2a]/20 pt-10">
//                 <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#4a2c2a] opacity-40 block mb-8">
//                   The Showroom
//                 </span>
//                 <h3 className="text-2xl font-serif text-[#4a2c2a] mb-6">
//                   Slough Interchange
//                 </h3>
//                 <p className="text-[#4a2c2a]/70 font-light leading-relaxed mb-8 text-lg">
//                   Unit 10 Slough Interchange Industrial Estate, Whittenham
//                   Close, Slough, SL2 5EP info@tilebazaar.co.uk 02039153853
//                 </p>

//                 <div className="space-y-4">
//                   <a
//                     href="tel:+442039153853"
//                     className="group flex items-center gap-4 text-xl font-serif text-[#4a2c2a]"
//                   >
//                     <span className="text-sm opacity-40 group-hover:opacity-100 transition-opacity">
//                       <FiPhone />
//                     </span>
//                     +44 7424 252426
//                   </a>
//                   <a
//                     href="mailto:sales@tilebazaar.com"
//                     className="group flex items-center gap-4 text-xl font-light text-[#4a2c2a]"
//                   >
//                     <span className="text-sm opacity-40 group-hover:opacity-100 transition-opacity">
//                       <FiMail />
//                     </span>
//                     info@tilebazaar.co.uk
//                   </a>
//                 </div>
//               </div>

//               {/* Trading Hours */}
//               <div className="border-t border-[#4a2c2a]/20 pt-10">
//                 <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#4a2c2a] opacity-40 block mb-8">
//                   Availability
//                 </span>
//                 <div className="space-y-3 text-[13px] uppercase tracking-[0.2em] font-bold text-[#4a2c2a]">
//                   <div className="flex justify-between">
//                     <span>Monday — Friday</span>
//                     <span>08:00 - 17:00</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Saturday</span>
//                     <span>09:00 - 14:00</span>
//                   </div>
//                   <div className="flex justify-between opacity-30">
//                     <span>Sunday</span>
//                     <span>Closed</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Bulk Logistics Branding */}
//             <div className="mt-20 p-12 bg-[#4a2c2a] text-white rounded-sm relative overflow-hidden">
//               <div className="relative z-10">
//                 <h4 className="text-3xl font-serif mb-4 italic">
//                   Bulk Logistics
//                 </h4>
//                 <p className="text-[13px] leading-relaxed opacity-70 font-light max-w-sm">
//                   Specializing in high-volume porcelain supply. We offer
//                   project-specific pricing for orders exceeding 2000 sqm.
//                 </p>
//               </div>
//               <div className="absolute -bottom-8 -right-8 text-[140px] font-serif italic opacity-[0.03] pointer-events-none select-none">
//                 2000+
//               </div>
//             </div>
//           </div>

//           {/* RIGHT: Professional Form (7 Columns) */}
//           <div className="lg:col-span-7 order-1 lg:order-2">
//             <div className="bg-white p-10 md:p-20 shadow-[0_30px_100px_rgba(0,0,0,0.04)]">
//               <div className="mb-16">
//                 <h2 className="text-4xl font-serif text-[#4a2c2a] mb-6">
//                   Project Inquiry
//                 </h2>
//                 <p className="text-[#4a2c2a]/50 font-light text-lg">
//                   Submit your technical requirements or request a bulk quotation
//                   below.
//                 </p>
//               </div>

//               <form className="space-y-12">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
//                   <div className="relative border-b border-gray-200 pb-2 focus-within:border-[#4a2c2a] transition-colors">
//                     <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">
//                       Contact Name
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full bg-transparent py-2 outline-none text-[#4a2c2a] placeholder:text-gray-200"
//                       placeholder="e.g. Alex Sterling"
//                     />
//                   </div>
//                   <div className="relative border-b border-gray-200 pb-2 focus-within:border-[#4a2c2a] transition-colors">
//                     <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">
//                       Company / Firm
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full bg-transparent py-2 outline-none text-[#4a2c2a] placeholder:text-gray-200"
//                       placeholder="Architectural Office"
//                     />
//                   </div>
//                 </div>

//                 <div className="relative border-b border-gray-200 pb-2 focus-within:border-[#4a2c2a] transition-colors">
//                   <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">
//                     Email
//                   </label>
//                   <input
//                     type="email"
//                     className="w-full bg-transparent py-2 outline-none text-[#4a2c2a] placeholder:text-gray-200"
//                     placeholder="professional@firm.com"
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
//                   <div className="relative border-b border-gray-200 pb-1 focus-within:border-[#4a2c2a] transition-colors">
//                     <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">
//                       Inquiry Type
//                     </label>
//                     <div className="relative">
//                       <select className="w-full bg-transparent py-2 outline-none text-[#4a2c2a] text-sm appearance-none cursor-pointer pr-8 relative z-10">
//                         {/* Background set to white on options to prevent browser gray-out */}
//                         <option
//                           value="bulk"
//                           className="bg-white text-[#4a2c2a] py-2"
//                         >
//                           Bulk Porcelain Quote
//                         </option>
//                         <option
//                           value="spec"
//                           className="bg-white text-[#4a2c2a] py-2"
//                         >
//                           Architectural Spec
//                         </option>
//                         <option
//                           value="sample"
//                           className="bg-white text-[#4a2c2a] py-2"
//                         >
//                           Sample Request
//                         </option>
//                       </select>

//                       {/* Custom Minimalist Arrow - Kept outside for consistency */}
//                       <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none z-0">
//                         <svg
//                           width="10"
//                           height="6"
//                           viewBox="0 0 10 6"
//                           fill="none"
//                           stroke="#4a2c2a"
//                           strokeWidth="1.5"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           className="opacity-40"
//                         >
//                           <path d="M1 1L5 5L9 1" />
//                         </svg>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="relative border-b border-gray-200 pb-2 focus-within:border-[#4a2c2a] transition-colors">
//                     <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">
//                       Estimated Area (sqm)
//                     </label>
//                     <input
//                       type="number"
//                       className="w-full bg-transparent py-2 outline-none text-[#4a2c2a] placeholder:text-gray-200"
//                       placeholder="2000+"
//                     />
//                   </div>
//                 </div>

//                 <div className="relative border-b border-gray-200 pb-2 focus-within:border-[#4a2c2a] transition-colors">
//                   <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">
//                     Message / Requirements
//                   </label>
//                   <textarea
//                     rows={3}
//                     className="w-full bg-transparent py-2 outline-none text-[#4a2c2a] placeholder:text-gray-200 resize-none"
//                     placeholder="Describe your project..."
//                   ></textarea>
//                 </div>

//                 <button className="group relative w-full overflow-hidden bg-[#4a2c2a] py-6 text-white text-[11px] font-bold uppercase tracking-[0.4em] transition-all hover:bg-black">
//                   <span className="relative z-10 flex items-center justify-center gap-4">
//                     Send Inquiry{" "}
//                     <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
//                   </span>
//                 </button>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }


// "use client";
// import React from "react";
// import { FiPhone, FiMail, FiArrowRight } from "react-icons/fi";

// export default function ContactPage() {
//   return (
//     <main className="bg-[#f8f7f5] min-h-screen pt-28 md:pt-32 pb-10 md:pb-20">
//       <div className="max-w-[1600px] mx-auto px-5 md:px-12">
        
//         {/* HEADER: Responsive Typography */}
//         <header className="mb-12 md:mb-24">
//           <h1 className="text-[18vw] md:text-[9vw] font-serif text-[#4a2c2a] leading-[0.85] tracking-tighter">
//             Contact <br />
//             <span className="italic font-light ml-[4vw] md:ml-[8vw]">Bazaar.</span>
//           </h1>
//         </header>

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          
//           {/* RIGHT (Moved to Top on Mobile): Professional Form */}
//           <div className="lg:col-span-7 order-1 lg:order-2">
//             <div className="bg-white p-6 md:p-16 lg:p-20 shadow-[0_15px_50px_rgba(0,0,0,0.03)] md:shadow-[0_30px_100px_rgba(0,0,0,0.04)]">
//               <div className="mb-10 md:mb-16">
//                 <h2 className="text-3xl md:text-4xl font-serif text-[#4a2c2a] mb-4 md:mb-6">
//                   Project Inquiry
//                 </h2>
//                 <p className="text-[#4a2c2a]/50 font-light text-base md:text-lg">
//                   Submit your technical requirements or request a bulk quotation below.
//                 </p>
//               </div>

//               <form className="space-y-8 md:space-y-12">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
//                   <div className="relative border-b border-gray-200 pb-2 focus-within:border-[#4a2c2a] transition-colors">
//                     <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Contact Name</label>
//                     <input type="text" className="w-full bg-transparent py-2 outline-none text-[#4a2c2a] placeholder:text-gray-200 text-sm md:text-base" placeholder="e.g. Alex Sterling" />
//                   </div>
//                   <div className="relative border-b border-gray-200 pb-2 focus-within:border-[#4a2c2a] transition-colors">
//                     <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Company / Firm</label>
//                     <input type="text" className="w-full bg-transparent py-2 outline-none text-[#4a2c2a] placeholder:text-gray-200 text-sm md:text-base" placeholder="Architectural Office" />
//                   </div>
//                 </div>

//                 <div className="relative border-b border-gray-200 pb-2 focus-within:border-[#4a2c2a] transition-colors">
//                   <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Email</label>
//                   <input type="email" className="w-full bg-transparent py-2 outline-none text-[#4a2c2a] placeholder:text-gray-200 text-sm md:text-base" placeholder="professional@firm.com" />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
//                   <div className="relative border-b border-gray-200 pb-1 focus-within:border-[#4a2c2a] transition-colors">
//                     <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Inquiry Type</label>
//                     <div className="relative">
//                       <select className="w-full bg-transparent py-2 outline-none text-[#4a2c2a] text-sm md:text-base appearance-none cursor-pointer pr-8 relative z-10">
//                         <option value="bulk" className="bg-white">Bulk Porcelain Quote</option>
//                         <option value="spec" className="bg-white">Architectural Spec</option>
//                         <option value="sample" className="bg-white">Sample Request</option>
//                       </select>
//                       <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none z-0">
//                         <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="#4a2c2a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><path d="M1 1L5 5L9 1" /></svg>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="relative border-b border-gray-200 pb-2 focus-within:border-[#4a2c2a] transition-colors">
//                     <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Estimated Area (sqm)</label>
//                     <input type="number" className="w-full bg-transparent py-2 outline-none text-[#4a2c2a] placeholder:text-gray-200 text-sm md:text-base" placeholder="2000+" />
//                   </div>
//                 </div>

//                 <div className="relative border-b border-gray-200 pb-2 focus-within:border-[#4a2c2a] transition-colors">
//                   <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Message / Requirements</label>
//                   <textarea rows={3} className="w-full bg-transparent py-2 outline-none text-[#4a2c2a] placeholder:text-gray-200 resize-none text-sm md:text-base" placeholder="Describe your project..."></textarea>
//                 </div>

//                 <button className="group relative w-full overflow-hidden bg-[#4a2c2a] py-5 md:py-6 text-white text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] transition-all hover:bg-black">
//                   <span className="relative z-10 flex items-center justify-center gap-4">
//                     Send Inquiry <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
//                   </span>
//                 </button>
//               </form>
//             </div>
//           </div>

//           {/* LEFT: Information & Logistics (5 Columns) */}
//           <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col justify-between">
//             <div className="space-y-12 md:space-y-16">
              
//               {/* HQ Details */}
//               <div className="border-t border-[#4a2c2a]/20 pt-8 md:pt-10">
//                 <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#4a2c2a] opacity-40 block mb-6">The Showroom</span>
//                 <h3 className="text-xl md:text-2xl font-serif text-[#4a2c2a] mb-4">Slough Interchange</h3>
//                 <p className="text-[#4a2c2a]/70 font-light leading-relaxed mb-6 text-base md:text-lg">
//                   Unit 10 Slough Interchange Industrial Estate, Whittenham
//                   Close, Slough, SL2 5EP info@tilebazaar.co.uk 02039153853
//                 </p>
//                 <div className="space-y-4">
//                   <a href="tel:+447424252426" className="group flex items-center gap-4 text-lg md:text-xl font-serif text-[#4a2c2a]">
//                     <FiPhone className="text-sm opacity-40" /> +44 7424 252426
//                   </a>
//                   <a href="mailto:info@tilebazaar.co.uk" className="group flex items-center gap-4 text-lg md:text-xl font-light text-[#4a2c2a]">
//                     <FiMail className="text-sm opacity-40" /> info@tilebazaar.co.uk
//                   </a>
//                 </div>
//               </div>

//               {/* Trading Hours */}
//               <div className="border-t border-[#4a2c2a]/20 pt-8 md:pt-10">
//                 <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#4a2c2a] opacity-40 block mb-6">Availability</span>
//                 <div className="space-y-3 text-xs md:text-[13px] uppercase tracking-[0.2em] font-bold text-[#4a2c2a]">
//                   <div className="flex justify-between"><span>Mon — Fri</span><span>08:00 - 17:00</span></div>
//                   <div className="flex justify-between"><span>Saturday</span><span>09:00 - 14:00</span></div>
//                   <div className="flex justify-between opacity-30"><span>Sunday</span><span>Closed</span></div>
//                 </div>
//               </div>
//             </div>

//             {/* Bulk Logistics Branding - Adjusted padding for mobile */}
//             <div className="mt-12 lg:mt-20 p-8 md:p-12 bg-[#4a2c2a] text-white rounded-sm relative overflow-hidden">
//               <div className="relative z-10">
//                 <h4 className="text-2xl md:text-3xl font-serif mb-4 italic">Bulk Logistics</h4>
//                 <p className="text-xs md:text-[13px] leading-relaxed opacity-70 font-light max-w-sm">
//                   Specializing in high-volume porcelain supply. We offer project-specific pricing for orders exceeding 2000 sqm.
//                 </p>
//               </div>
//               <div className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 text-[100px] md:text-[140px] font-serif italic opacity-[0.03] pointer-events-none select-none">
//                 2000+
//               </div>
//             </div>
//           </div>

//         </div>
//       </div>
//     </main>
//   );
// }




"use client";

import React, { useState, useRef } from "react";
import { FiPhone, FiMail, FiArrowRight, FiCheck, FiAlertCircle } from "react-icons/fi";
import api from "@/lib/axios";

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    setStatus("sending");

    try {
      const formData = new FormData(formRef.current);
      const payload = {
        user_name: formData.get("user_name"),
        company_name: formData.get("company_name"),
        user_email: formData.get("user_email"),
        inquiry_type: formData.get("inquiry_type"),
        area_sqm: formData.get("area_sqm"),
        message: formData.get("message"),
      };

      await api.post("/api/inquiries", payload);

      setStatus("sent");
      formRef.current.reset();
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      console.error("Submission Error:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <main className="bg-[#f8f7f5] min-h-screen pt-28 md:pt-32 pb-10 md:pb-20 text-[#4a2c2a]">
      <div className="max-w-[1600px] mx-auto px-5 md:px-12">
        
        {/* HEADER */}
        <header className="mb-12 md:mb-24">
          <h1 className="text-[18vw] md:text-[9vw] font-serif leading-[0.85] tracking-tighter">
            Contact <br />
            <span className="italic font-light ml-[4vw] md:ml-[8vw]">Tile Bazaar.</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          
          {/* FORM SECTION */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="bg-white p-6 md:p-16 lg:p-20 shadow-[0_15px_50px_rgba(0,0,0,0.03)] md:shadow-[0_30px_100px_rgba(0,0,0,0.04)]">
              <div className="mb-10 md:mb-16">
                <h2 className="text-3xl md:text-4xl font-serif mb-4 md:mb-6">Project Inquiry</h2>
                <p className="opacity-50 font-light text-base md:text-lg">
                  Submit your technical requirements or request a bulk quotation below.
                </p>
              </div>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-8 md:space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  <div className="relative border-b border-gray-200 pb-2 focus-within:border-[#4a2c2a] transition-colors">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Contact Name</label>
                    <input name="user_name" required type="text" className="w-full bg-transparent py-2 outline-none placeholder:text-gray-200 text-sm md:text-base" placeholder="e.g. Alex Sterling" />
                  </div>
                  <div className="relative border-b border-gray-200 pb-2 focus-within:border-[#4a2c2a] transition-colors">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Company / Firm</label>
                    <input name="company_name" type="text" className="w-full bg-transparent py-2 outline-none placeholder:text-gray-200 text-sm md:text-base" placeholder="Architectural Office" />
                  </div>
                </div>

                <div className="relative border-b border-gray-200 pb-2 focus-within:border-[#4a2c2a] transition-colors">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Email</label>
                  <input name="user_email" required type="email" className="w-full bg-transparent py-2 outline-none placeholder:text-gray-200 text-sm md:text-base" placeholder="professional@firm.com" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  <div className="relative border-b border-gray-200 pb-1 focus-within:border-[#4a2c2a] transition-colors">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Inquiry Type</label>
                    <div className="relative">
                      <select name="inquiry_type" className="w-full bg-transparent py-2 outline-none text-sm md:text-base appearance-none cursor-pointer pr-8 relative z-10">
                        <option value="Bulk Porcelain Quote" className="bg-white">Bulk Porcelain Quote</option>
                        <option value="Architectural Spec" className="bg-white">Architectural Spec</option>
                        <option value="Sample Request" className="bg-white">Sample Request</option>
                      </select>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none z-0">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="#4a2c2a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><path d="M1 1L5 5L9 1" /></svg>
                      </div>
                    </div>
                  </div>
                  <div className="relative border-b border-gray-200 pb-2 focus-within:border-[#4a2c2a] transition-colors">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Estimated Area (sqm)</label>
                    <input name="area_sqm" type="number" className="w-full bg-transparent py-2 outline-none placeholder:text-gray-200 text-sm md:text-base" placeholder="2000+" />
                  </div>
                </div>

                <div className="relative border-b border-gray-200 pb-2 focus-within:border-[#4a2c2a] transition-colors">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Message / Requirements</label>
                  <textarea name="message" rows={3} className="w-full bg-transparent py-2 outline-none placeholder:text-gray-200 resize-none text-sm md:text-base" placeholder="Describe your project..."></textarea>
                </div>

                <button 
                  disabled={status === "sending"}
                  className="group relative w-full overflow-hidden bg-[#4a2c2a] py-5 md:py-6 text-white text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] transition-all hover:bg-black disabled:opacity-80"
                >
                  <span className="relative z-10 flex items-center justify-center gap-4">
                    {status === "idle" && <>Send Inquiry <FiArrowRight className="group-hover:translate-x-2 transition-transform" /></>}
                    {status === "sending" && "Processing..."}
                    {status === "sent" && <>Inquiry Sent <FiCheck className="text-lg" /></>}
                    {status === "error" && <>Error Occurred <FiAlertCircle /></>}
                  </span>
                </button>
              </form>
            </div>
          </div>

          {/* INFORMATION SIDEBAR */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col justify-between">
            <div className="space-y-12 md:space-y-16">
              <div className="border-t border-[#4a2c2a]/20 pt-8 md:pt-10">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40 block mb-6">The Showroom</span>
                <h3 className="text-xl md:text-2xl font-serif mb-4">Slough Interchange</h3>
                <p className="opacity-70 font-light leading-relaxed mb-6 text-base md:text-lg">
                  Unit 10 Slough Interchange Industrial Estate, Whittenham
                  Close, Slough, SL2 5EP
                </p>
                <div className="space-y-4">
                  <a href="tel:+447424252426" className="group flex items-center gap-4 text-lg md:text-xl font-serif">
                    <FiPhone className="text-sm opacity-40" /> +44 7424 252426
                  </a>
                  <a href="mailto:info@tilebazaar.co.uk" className="group flex items-center gap-4 text-lg md:text-xl font-light">
                    <FiMail className="text-sm opacity-40" /> info@tilebazaar.co.uk
                  </a>
                </div>
              </div>

              <div className="border-t border-[#4a2c2a]/20 pt-8 md:pt-10">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40 block mb-6">Availability</span>
                <div className="space-y-3 text-xs md:text-[13px] uppercase tracking-[0.2em] font-bold">
                  <div className="flex justify-between"><span>Mon — Fri</span><span>08:00 - 17:00</span></div>
                  <div className="flex justify-between"><span>Saturday</span><span>09:00 - 14:00</span></div>
                  <div className="flex justify-between opacity-30"><span>Sunday</span><span>Closed</span></div>
                </div>
              </div>
            </div>

            {/* Bulk Branding */}
            <div className="mt-12 lg:mt-20 p-8 md:p-12 bg-[#4a2c2a] text-white rounded-sm relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-2xl md:text-3xl font-serif mb-4 italic">Bulk Logistics</h4>
                <p className="text-xs md:text-[13px] leading-relaxed opacity-70 font-light max-w-sm">
                  Specializing in high-volume porcelain supply. We offer project-specific pricing for orders exceeding 2000 sqm.
                </p>
              </div>
              <div className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 text-[100px] md:text-[140px] font-serif italic opacity-[0.03] pointer-events-none select-none">
                2000+
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}