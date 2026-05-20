import Hero from "@/components/home/hero";
import CategoryGrid from "@/components/home/CategoryGrid";
import ApplicationPossibilities from "@/components/home/ApplicationPossibilities";
import TopSellingTiles from "@/components/home/TopSellingTiles";
import AboutSection from "@/components/home/AboutSection";
import ContactSection from "@/components/home/ContactSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <CategoryGrid />
      <ApplicationPossibilities />
      <AboutSection />
      <TopSellingTiles />
      <ContactSection />
    </main>
  );
}
