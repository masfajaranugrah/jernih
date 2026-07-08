import { HeroSkeleton, PromoSkeleton, ProductSkeleton } from "./components/Skeletons";

/**
 * loading.tsx — otomatis tampil saat Next.js navigasi ke halaman ini
 * Memberikan kesan halaman langsung terbuka (Hero + 4 section)
 */
export default function StorefrontLoading() {
  return (
    <>
      <HeroSkeleton />
      <main className="flex w-full flex-col gap-14 px-4 py-12 md:px-8 md:py-20">
        <PromoSkeleton />
        <ProductSkeleton />
        <ProductSkeleton />
        <ProductSkeleton />
      </main>
    </>
  );
}
