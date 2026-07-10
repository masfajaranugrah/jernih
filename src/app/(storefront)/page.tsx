import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { getHeroDataFromBackend } from "@/lib/hero-store";
import { HeroSkeleton, PromoSkeleton } from "./components/Skeletons";
import PromoSection from "./components/PromoSection";
import ProductSection from "./components/ProductSection";
import JasaSection from "./components/JasaSection";
import SewaSection from "./components/SewaSection";

// ── Hero Section — async server component tersendiri ─────────────────────────
async function HeroContent() {
  // getHeroDataFromBackend sudah ada try/catch, selalu return data (default jika gagal)
  const hero = await getHeroDataFromBackend();
  const { main, banners } = hero;
  const [b0, b1, b2] = banners;

  return (
    <section className="w-full px-4 py-6 md:px-8">
      <div className="grid grid-cols-12 gap-4 md:gap-5 [grid-auto-rows:minmax(280px,auto)] max-lg:grid-rows-none">

        {/* Tile utama — 8 kolom, 2 baris */}
        <Link
          href={main.linkHref}
          className="group relative col-span-12 min-h-[380px] overflow-hidden rounded-3xl shadow-sm lg:col-span-8 lg:row-span-2"
          style={{ backgroundColor: main.bgColor }}
        >
          <Image
            src={main.imageUrl}
            alt={main.imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
          <div className="relative z-10 flex h-full max-w-2xl flex-col justify-center p-8 text-white sm:p-12">
            <span className="mb-5 w-fit rounded-full bg-[#064e3b]/80 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md">
              {main.badge}
            </span>
            <h1 className="text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              {main.title}
              {main.titleSuffix && (
                <> <span className="font-light italic">{main.titleSuffix}</span></>
              )}
            </h1>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-white/80 sm:text-lg">
              {main.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="inline-block rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#064e3b] transition-colors hover:bg-slate-100">
                {main.ctaText}
              </span>
              <span className="inline-block rounded-xl border-2 border-white/30 px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/10">
                Lihat Semua
              </span>
            </div>
          </div>
        </Link>

        {/* Banner kanan atas — 4 kolom */}
        <div
          className="group relative col-span-12 min-h-[240px] overflow-hidden rounded-3xl shadow-sm lg:col-span-4"
          style={{ backgroundColor: b0.bgColor }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={b0.imageUrl}
            alt={b0.label}
            className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-500 group-hover:scale-110"
          />
          <div className={`relative z-10 flex h-full flex-col justify-between p-6 text-white sm:p-8 ${
            b0.align === "right" ? "items-end text-right" : b0.align === "center" ? "items-center text-center" : "items-start"
          }`}>
            <div className="flex w-full items-start justify-between">
              <h2 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl">
                {b0.subtitle && <>{b0.subtitle}<br /></>}
                {b0.title}
              </h2>
              {b0.label && (
                <span className="rounded bg-yellow-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-tight text-black">
                  Featured
                </span>
              )}
            </div>
            <div>
              {b0.tagline && <p className="mb-3 text-sm text-white/70">{b0.tagline}</p>}
              {b0.ctaText ? (
                <button className="border-b-2 border-[#064e3b] pb-0.5 text-base font-bold text-white transition-all hover:border-white">
                  {b0.ctaText}
                </button>
              ) : (
                <span className="border-b-2 border-[#064e3b] pb-0.5 text-base font-bold text-white cursor-pointer">
                  Pelajari Lebih
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Banner kiri bawah */}
        <div
          className="group relative col-span-6 min-h-[220px] overflow-hidden rounded-3xl shadow-sm lg:col-span-2"
          style={{ backgroundColor: b1.bgColor }}
        >
          {b1.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={b1.imageUrl}
              alt={b1.label}
              className="absolute inset-0 h-full w-full object-cover opacity-60"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-end p-5 text-white">
            <h3 className="text-lg font-black leading-tight sm:text-xl">{b1.title}</h3>
            {b1.subtitle && <p className="mt-1 text-xs text-white/70">{b1.subtitle}</p>}
            {b1.ctaText && (
              <button className={`mt-4 w-full rounded-lg py-2.5 text-xs font-bold transition-colors ${b1.ctaColor} ${b1.ctaTextColor} hover:opacity-90`}>
                {b1.ctaText}
              </button>
            )}
          </div>
        </div>

        {/* Banner kanan bawah */}
        <div
          className="group relative col-span-6 min-h-[220px] overflow-hidden rounded-3xl shadow-sm lg:col-span-2"
          style={{ backgroundColor: b2.bgColor }}
        >
          {b2.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={b2.imageUrl}
              alt={b2.label}
              className="absolute inset-0 h-full w-full object-cover opacity-50"
            />
          )}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#064e3b]/20 blur-3xl" />
          <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-blue-500/20 blur-2xl" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center p-5 text-center text-white">
            {b2.tagline && (
              <span className="mb-3 rounded-full bg-[#064e3b]/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#4ade80]">
                {b2.tagline}
              </span>
            )}
            <h3 className="text-2xl font-black italic tracking-tight sm:text-3xl">
              {b2.title.includes("X") ? (
                <>{b2.title.split("X")[0]}<span className="text-[#4ade80]">X</span>{b2.title.split("X")[1]}</>
              ) : b2.title}
            </h3>
            {b2.subtitle && <p className="mt-2 text-[11px] text-white/60">{b2.subtitle}</p>}
            {b2.ctaText && (
              <button className={`mt-5 rounded-md px-4 py-2 text-xs font-bold transition-all ${b2.ctaColor} ${b2.ctaTextColor} hover:opacity-90`}>
                {b2.ctaText}
              </button>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}

// ── Page utama — render langsung tanpa blocking fetch ────────────────────────
export default function Home() {
  return (
    <>
      {/* ── Hero: stream dari backend database ── */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroContent />
      </Suspense>

      {/* ── Main sections: masing-masing stream sendiri ── */}
      <main className="flex w-full flex-col gap-14 px-4 py-12 md:px-8 md:py-20">

        <Suspense fallback={<PromoSkeleton />}>
          <PromoSection />
        </Suspense>

        {/* Sections di bawah ini pakai TanStack Query — data real-time tanpa Next.js cache */}
        <ProductSection />
        <JasaSection />
        <SewaSection />

      </main>

      {/* ── Footer ── */}
      <footer className="flex w-full flex-col items-center justify-between gap-5 border-t border-[#bfc9c3] bg-[#f3f4f5] px-4 py-10 text-center md:flex-row md:px-8">
        <div className="text-2xl font-bold text-[#064e3b]">Jernih Creatife</div>
        <div className="flex flex-wrap justify-center gap-5 text-xs font-semibold text-[#404944]">
          {["Privacy Policy", "Terms of Service", "Contact Us", "Help Center"].map((item) => (
            <a key={item} href="#" className="underline hover:text-[#064e3b]">
              {item}
            </a>
          ))}
        </div>
        <p className="text-xs font-medium text-[#404944]">© 2024 Jernih Creatife. All rights reserved.</p>
      </footer>
    </>
  );
}
