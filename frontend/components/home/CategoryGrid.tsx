import Image from "next/image";
import Link from "next/link";

const CATEGORIES = [
  { name: "All Tiles", img: "/images/tiles-every.jpg", href: "/products" },
  { name: "Floor Tiles", img: "/images/floor-tile.png", href: "/products" },
  { name: "Wall Tiles", img: "/images/wall-tile.jpg", href: "/products" },
  { name: "Bathroom Tiles", img: "/images/bathroom-tile.png", href: "/products" },
  {
    name: "Splashback Tiles",
    img: "/images/splash-tile.png",
    href: "/products",
  },
];

export default function CategoryGrid() {
  return (
    <section className="py-18 bg-white">
      {/* <div className="flex justify-evenly">
        <div className="text-amber-800 text-center">
          <h2 className="text-2xl font-bold">150,000 + </h2>
          <p className="text-md">Happy Customers</p>
        </div>
        <div className="text-amber-800 text-center">
          <h2 className="text-2xl font-bold">4.6 Star</h2>
          <p className="text-md">Google Rating</p>
        </div>
        <div className="text-amber-800 text-center">
          <h2 className="text-2xl font-bold">Ships from</h2>
          <p className="text-md">United Kingdom</p>
        </div>
      </div> */}
      <main className="max-w-[1440px] mx-auto px-4 md:px-10 py-12 pt-20 font-sans">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group flex flex-col items-center text-center"
            >
              {/* Image Container with 3:4 Aspect Ratio */}
              <div className="relative w-full aspect-[4/5] overflow-hidden rounded-[18px] mb-3">
                <Image
                  src={cat.img}
                  alt={cat.name}
                  fill
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="95vw"
                />
              </div>

              {/* Label with Arrow */}
              <div className="flex items-center gap-1.5 transition-opacity group-hover:opacity-70">
                <span className="text-[11px] md:text-[12px] font-bold text-[#4a2c2a] uppercase tracking-[0.1em]">
                  {cat.name}
                </span>
                <span className="text-[12px] text-[#4a2c2a] font-light">→</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </section>
  );
}
