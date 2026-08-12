import { Suspense } from "react";
import { getHeroDataFromBackend } from "@/lib/hero-store";
import { getHomepageSections } from "@/lib/homepage-settings";
import { HeroSkeleton, PromoSkeleton } from "./components/Skeletons";
import PromoSection from "./components/PromoSection";
import ProductSection from "./components/ProductSection";
import JasaSection from "./components/JasaSection";
import SewaSection from "./components/SewaSection";
import StorefrontFooter from "./StorefrontFooter";
import HeroSectionClient from "./components/HeroSectionClient";
import CategoryGridSection from "./components/CategoryGridSection";

// ── Hero Section — async server component tersendiri ─────────────────────────
async function HeroContent() {
  // getHeroDataFromBackend sudah ada try/catch, selalu return data (default jika gagal)
  const hero = await getHeroDataFromBackend();
  return <HeroSectionClient hero={hero} />;
}

// ── Konten utama — baca toggle admin via getHomepageSections ────────────────
async function MainContent() {
  // Sekarang pakai ISR cache (revalidate: 60) — tidak blocking lama
  const sections = await getHomepageSections();

  return (
    <>
      {/* Hero — conditional sesuai toggle admin, stream data via Suspense sendiri */}
      {sections.showHero && (
        <Suspense fallback={<HeroSkeleton />}>
          <HeroContent />
        </Suspense>
      )}

      <main className="flex w-full flex-col gap-14 px-4 py-12 md:px-8 md:py-20">
        {sections.showPromo && (
          <Suspense fallback={<PromoSkeleton />}>
            <PromoSection />
          </Suspense>
        )}

        {/* Keunggulan & Grid Kategori Produk (di atas Produk Populer) */}
        <CategoryGridSection />

        {/* Sections di bawah ini pakai TanStack Query — data real-time via browser */}
        {sections.showProduct && <ProductSection />}
        {sections.showJasa && <JasaSection />}
        {sections.showSewa && <SewaSection />}
      </main>
    </>
  );
}

// ── Page utama ─────────────────────────────────────────────────────────────
export default async function Home() {
  return (
    <div className="bg-white">
      {/* Streaming penuh: fallback langsung terkirim, konten menyusul */}
      <Suspense fallback={<HeroSkeleton />}>
        <MainContent />
      </Suspense>

      <StorefrontFooter />
    </div>
  );
}
