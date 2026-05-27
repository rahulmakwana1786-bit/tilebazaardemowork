import Image from "next/image";

export default function ApplicationPossibilities() {
  return (
    <section className="bg-white py-20 md:py-28 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-48">
          
          {/* Left Column: Application Possibilities */}
          <div className="space-y-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif text-[#4a2c2a] leading-tight mb-6">
                Application <span className="italic font-light">Possibilities</span>
              </h2>
            </div>
            
            <div className="relative aspect-[1.5/1] w-full overflow-hidden bg-white group">
              <Image
                src="/images/application-possibilities.png"
                alt="Application possibilities for tiles"
                fill
                className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
          </div>

          {/* Right Column: Amassed with Features */}
          <div className="space-y-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif text-[#4a2c2a] leading-tight">
                Amassed with <span className="italic font-light">Features</span>
              </h2>
              {/* No paragraph as per user request */}
            </div>
            
            <div className="relative aspect-[1.5/1] w-full overflow-hidden bg-white group">
              <Image
                src="/images/Amessed with the features.png"
                alt="Amessed with the features"
                fill
                className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
