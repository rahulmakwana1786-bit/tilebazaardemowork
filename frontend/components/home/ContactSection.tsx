// "use client";

// import React, { useState } from "react";
// import { FiArrowRight } from "react-icons/fi";

// export default function ContactSection() {
//   const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setStatus("sending");
//     // Simulate API call
//     setTimeout(() => setStatus("sent"), 1500);
//   };

//   return (
//     <section className="py-24 bg-white border-t border-gray-100">
//       <div className="max-w-[1440px] mx-auto px-4 md:px-10">
//         <div className="flex flex-col lg:flex-row gap-16 lg:gap-32">
//           {/* Left Side: Info */}
//           <div className="w-full lg:w-1/3">
//             <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#4a2c2a] opacity-50 block mb-6">
//               Get in Touch
//             </span>
//             <h2 className="text-5xl font-serif text-[#4a2c2a] leading-tight mb-8">
//               Let&apos;s build your <br />
//               <span className="italic font-light">vision together.</span>
//             </h2>

//             <div className="space-y-8 mt-12">
//               <div>
//                 <p className="text-[10px] uppercase tracking-widest font-bold text-[#4a2c2a] opacity-40 mb-2">
//                   Showroom
//                 </p>
//                 <p className="text-sm text-[#4a2c2a]/80 leading-relaxed">
//                   Unit 10 Slough Interchange Industrial Estate, Whittenham
//                   Close, Slough, SL2 5EP info@tilebazaar.co.uk 02039153853
//                 </p>
//               </div>
//               <div>
//                 <p className="text-[10px] uppercase tracking-widest font-bold text-[#4a2c2a] opacity-40 mb-2">
//                   Inquiries
//                 </p>
//                 <p className="text-sm text-[#4a2c2a]/80 font-medium">
//                   info@tilebazaar.co.uk
//                 </p>
//                 <p className="text-sm text-[#4a2c2a]/80 font-medium">
//                   +44 7424 252426
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Right Side: Form */}
//           <div className="w-full lg:w-2/3 bg-[#fbfaf9] p-8 md:p-12 rounded-sm shadow-sm">
//             <form className="space-y-6">
//               {" "}
//               {/* Reduced from space-y-12 */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {" "}
//                 {/* Reduced from gap-12 */}
//                 <div className="relative border-b border-gray-200 pb-1 focus-within:border-[#4a2c2a] transition-colors">
//                   <label className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">
//                     Contact Name
//                   </label>
//                   <input
//                     type="text"
//                     className="w-full bg-transparent py-1.5 outline-none text-[#4a2c2a] text-sm placeholder:text-gray-200"
//                     placeholder="e.g. Alex Sterling"
//                   />
//                 </div>
//                 <div className="relative border-b border-gray-200 pb-1 focus-within:border-[#4a2c2a] transition-colors">
//                   <label className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">
//                     Company / Firm
//                   </label>
//                   <input
//                     type="text"
//                     className="w-full bg-transparent py-1.5 outline-none text-[#4a2c2a] text-sm placeholder:text-gray-200"
//                     placeholder="Architectural Office"
//                   />
//                 </div>
//               </div>
//               <div className="relative border-b border-gray-200 pb-1 focus-within:border-[#4a2c2a] transition-colors">
//                 <label className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   className="w-full bg-transparent py-1.5 outline-none text-[#4a2c2a] text-sm placeholder:text-gray-200"
//                   placeholder="professional@firm.com"
//                 />
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {" "}
//                 {/* Reduced from gap-12 */}
//                 <div className="relative border-b border-gray-200 pb-1 focus-within:border-[#4a2c2a] transition-colors">
//                   <label className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">
//                     Inquiry Type
//                   </label>
//                   <div className="relative">
//                     <select className="w-full bg-transparent py-1.5 outline-none text-[#4a2c2a] text-sm appearance-none cursor-pointer pr-8">
//                       <option className="bg-white text-[#4a2c2a]">
//                         Bulk Porcelain Quote
//                       </option>
//                       <option className="bg-white text-[#4a2c2a]">
//                         Architectural Spec
//                       </option>
//                       <option className="bg-white text-[#4a2c2a]">
//                         Sample Request
//                       </option>
//                     </select>
//                     {/* Custom Minimalist Arrow */}
//                     <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
//                       <svg
//                         width="10"
//                         height="6"
//                         viewBox="0 0 10 6"
//                         fill="none"
//                         stroke="#4a2c2a"
//                         strokeWidth="1.5"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         className="opacity-40"
//                       >
//                         <path d="M1 1L5 5L9 1" />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="relative border-b border-gray-200 pb-1 focus-within:border-[#4a2c2a] transition-colors">
//                   <label className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">
//                     Estimated Area (sqm)
//                   </label>
//                   <input
//                     type="number"
//                     className="w-full bg-transparent py-1.5 outline-none text-[#4a2c2a] text-sm placeholder:text-gray-200"
//                     placeholder="2000+"
//                   />
//                 </div>
//               </div>
//               <div className="relative border-b border-gray-200 pb-1 focus-within:border-[#4a2c2a] transition-colors">
//                 <label className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">
//                   Message / Requirements
//                 </label>
//                 <textarea
//                   rows={2} // Reduced from 3
//                   className="w-full bg-transparent py-1.5 outline-none text-[#4a2c2a] text-sm placeholder:text-gray-200 resize-none"
//                   placeholder="Describe your project..."
//                 ></textarea>
//               </div>
//               <button className="group relative w-full overflow-hidden bg-[#4a2c2a] py-4 text-white text-[10px] font-bold uppercase tracking-[0.3em] transition-all hover:bg-black">
//                 <span className="relative z-10 flex items-center justify-center gap-3">
//                   Send Inquiry{" "}
//                   <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
//                 </span>
//               </button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }


"use client";

import React, { useState, useRef } from "react";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import emailjs from "@emailjs/browser";

export default function ContactSection() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    setStatus("sending");

    try {
      // Replace these with your actual EmailJS credentials
      await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      formRef.current,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      setStatus("sent");
      formRef.current.reset(); // Clear form after success
      
      // Reset button text after 5 seconds
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      console.error("EmailJS Error:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-32">
          {/* Left Side: Info */}
          <div className="w-full lg:w-1/3">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#4a2c2a] opacity-50 block mb-6">
              Get in Touch
            </span>
            <h2 className="text-5xl font-serif text-[#4a2c2a] leading-tight mb-8">
              Let&apos;s build your <br />
              <span className="italic font-light">vision together.</span>
            </h2>

            <div className="space-y-8 mt-12">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#4a2c2a] opacity-40 mb-2">
                  Showroom
                </p>
                <p className="text-sm text-[#4a2c2a]/80 leading-relaxed">
                  Unit 10 Slough Interchange Industrial Estate, Whittenham
                  Close, Slough, SL2 5EP info@tilebazaar.co.uk 02039153853
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#4a2c2a] opacity-40 mb-2">
                  Inquiries
                </p>
                <p className="text-sm text-[#4a2c2a]/80 font-medium">
                  info@tilebazaar.co.uk
                </p>
                <p className="text-sm text-[#4a2c2a]/80 font-medium">
                  +44 7424 252426
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="w-full lg:w-2/3 bg-[#fbfaf9] p-8 md:p-12 rounded-sm shadow-sm">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative border-b border-gray-200 pb-1 focus-within:border-[#4a2c2a] transition-colors">
                  <label className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">
                    Contact Name
                  </label>
                  <input
                    name="user_name" // Match your EmailJS template variable
                    required
                    type="text"
                    className="w-full bg-transparent py-1.5 outline-none text-[#4a2c2a] text-sm placeholder:text-gray-200"
                    placeholder="e.g. Alex Sterling"
                  />
                </div>
                <div className="relative border-b border-gray-200 pb-1 focus-within:border-[#4a2c2a] transition-colors">
                  <label className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">
                    Company / Firm
                  </label>
                  <input
                    name="company_name"
                    type="text"
                    className="w-full bg-transparent py-1.5 outline-none text-[#4a2c2a] text-sm placeholder:text-gray-200"
                    placeholder="Architectural Office"
                  />
                </div>
              </div>
              <div className="relative border-b border-gray-200 pb-1 focus-within:border-[#4a2c2a] transition-colors">
                <label className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">
                  Email
                </label>
                <input
                  name="user_email"
                  required
                  type="email"
                  className="w-full bg-transparent py-1.5 outline-none text-[#4a2c2a] text-sm placeholder:text-gray-200"
                  placeholder="professional@firm.com"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative border-b border-gray-200 pb-1 focus-within:border-[#4a2c2a] transition-colors">
                  <label className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">
                    Inquiry Type
                  </label>
                  <div className="relative">
                    <select 
                      name="inquiry_type"
                      className="w-full bg-transparent py-1.5 outline-none text-[#4a2c2a] text-sm appearance-none cursor-pointer pr-8"
                    >
                      <option className="bg-white text-[#4a2c2a]">Bulk Porcelain Quote</option>
                      <option className="bg-white text-[#4a2c2a]">Architectural Spec</option>
                      <option className="bg-white text-[#4a2c2a]">Sample Request</option>
                    </select>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="#4a2c2a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                        <path d="M1 1L5 5L9 1" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="relative border-b border-gray-200 pb-1 focus-within:border-[#4a2c2a] transition-colors">
                  <label className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">
                    Estimated Area (sqm)
                  </label>
                  <input
                    name="area_sqm"
                    type="number"
                    className="w-full bg-transparent py-1.5 outline-none text-[#4a2c2a] text-sm placeholder:text-gray-200"
                    placeholder="2000+"
                  />
                </div>
              </div>
              <div className="relative border-b border-gray-200 pb-1 focus-within:border-[#4a2c2a] transition-colors">
                <label className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">
                  Message / Requirements
                </label>
                <textarea
                  name="message"
                  rows={2}
                  className="w-full bg-transparent py-1.5 outline-none text-[#4a2c2a] text-sm placeholder:text-gray-200 resize-none"
                  placeholder="Describe your project..."
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={status === "sending"}
                className="group relative w-full overflow-hidden bg-[#4a2c2a] py-4 text-white text-[10px] font-bold uppercase tracking-[0.3em] transition-all hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {status === "idle" && <>Send Inquiry <FiArrowRight className="group-hover:translate-x-1 transition-transform" /></>}
                  {status === "sending" && "Processing..."}
                  {status === "sent" && <>Inquiry Sent <FiCheck /></>}
                  {status === "error" && "Try Again"}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}