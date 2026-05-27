// import Image from "next/image";

// export default function Hero() {
//   return (
//     <section className="mt-16 w-full bg-white overflow-hidden">
//       {/* Container for the text block - Now sits above the image in flow */}
      

//       {/* The image is now a standard block element, dictating its own space */}
//       <div className="w-full h-auto">
//         <Image
//           src="/images/hero-bg.png" // Place your image in public/images/
//           alt="Luxury Tile Interior"
//           width={1920} // Use the original width/height to set aspect ratio
//           height={1080}
//           priority // Loads immediately for better LCP
//           className="w-full h-auto object-center"
//           sizes="100vw"
//         />
//       </div>
//     </section>
//   );
// }






import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative mt-24 w-full h-[60vh] md:h-[80vh] lg:h-[90vh] overflow-hidden bg-white">
      
      {/* LAYER 1: The Main Background Image (The Room) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.png" 
          alt="Luxury Interior"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* LAYER 2: The Front PNG (White Strip with Text/Price) */}
      {/* This image will sit on the left and maintain its aspect ratio */}
      <div className="relative z-10 h-full w-full md:w-[60%] lg:w-[80%]">
        <Image
          src="/images/offer_new.png" // Your PNG with the text and slant
          alt="Opening Offer £10 + VAT"
          fill
          className="object-fill lg:object-contain object-center"
          priority
          sizes="100vw"
        />
      </div>

    </section>
  );
}
