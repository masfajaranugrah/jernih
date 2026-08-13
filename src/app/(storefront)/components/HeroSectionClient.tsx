"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HeroData, HeroBanner } from "@/lib/hero-store";

// ── Item slide untuk side card ─────────────────────────────────────────────
interface SideSlideItem {
  id: string;
  linkHref?: string;
  renderContent: (dots?: React.ReactNode) => React.ReactNode;
}

// ── Komponen Side Card Slider (Auto Slide Independen per Card) ───────────────
function SideCardSlider({
  slides,
  autoPlayMs = 4000,
  className = "",
}: {
  slides: SideSlideItem[];
  autoPlayMs?: number;
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Auto-play interval tersendiri per card
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, autoPlayMs);
    return () => clearInterval(timer);
  }, [isPaused, slides.length, autoPlayMs]);

  // Touch Swipe Gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    if (diffX > 35) {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    } else if (diffX < -35) {
      setActiveIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    }
    touchStartX.current = null;
  };

  // Node dots statis — dirender DI LUAR sliding track supaya tidak ikut bergeser/hilang,
  // selalu berada di tengah bawah kartu, hanya mengubah state aktif saat konten berganti.
  const dotsNode =
    slides.length > 1 ? (
      <div className="absolute left-1/2 -translate-x-1/2 bottom-1.5 sm:bottom-2 z-30 flex items-center justify-center pointer-events-auto">
        <div className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-black/50 px-2 py-0.5 sm:px-2.5 sm:py-1 backdrop-blur-md border border-white/10 transition-opacity hover:bg-black/70 shrink-0">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveIndex(i);
              }}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${activeIndex === i
                ? "w-3 sm:w-4 bg-white"
                : "w-1 sm:w-1.5 bg-white/40 hover:bg-white/80"
                }`}
            />
          ))}
        </div>
      </div>
    ) : null;

  return (
    <div
      className={`group relative w-full h-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100/60 ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sliding Track */}
      <div
        className="flex w-full h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="w-full flex-shrink-0 h-full relative overflow-hidden">
            {slide.linkHref ? (
              <Link href={slide.linkHref} className="block w-full h-full">
                {slide.renderContent()}
              </Link>
            ) : (
              slide.renderContent()
            )}
          </div>
        ))}
      </div>

      {/* Dots statis — tidak ikut sliding track */}
      {dotsNode}
    </div>
  );
}

// ── Komponen utama Hero Section Client ─────────────────────────────────────
export default function HeroSectionClient({ hero }: { hero: HeroData }) {
  // ── 1. MAIN HERO SLIDES (Left Slider) ───────────────────────────────────
  const activeMain = hero.main.filter((b) => b.isActive);
  const mainSlides = activeMain.length > 0
    ? activeMain.map((b) => ({
      id: b.id,
      linkHref: b.linkHref || undefined,
      render: () => (
        <div className="relative flex h-full w-full flex-col justify-between overflow-hidden p-6 sm:p-8 text-white" style={{ backgroundColor: b.bgColor || "#ffffff" }}>
          {b.imageUrl && (
            <Image
              src={b.imageUrl}
              alt={b.imageAlt || b.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover opacity-100"
            />
          )}
          <div className="relative z-10 flex items-start justify-between">
            {b.badge && (
              <span className="rounded-full bg-blue-600/80 px-3.5 py-1 text-[11px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                {b.badge}
              </span>
            )}
          </div>
          <div className="relative z-10 max-w-xl">
            <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-4xl lg:text-4xl">
              {b.title}
              {b.titleSuffix && (
                <span className="font-light italic text-sky-300"> {b.titleSuffix}</span>
              )}
            </h1>
            {b.description && (
              <p className="mt-2 max-w-md text-xs sm:text-sm text-white/80 line-clamp-2">
                {b.description}
              </p>
            )}
            {b.ctaText && (
              <div className="mt-4 flex items-center gap-3">
                <span className="rounded-xl bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 shadow-md transition-transform hover:scale-105">
                  {b.ctaText}
                </span>
              </div>
            )}
          </div>
        </div>
      ),
    }))
    : [
      {
        id: "main-starlink",
        linkHref: "/produk/starlink-v4",
        render: () => (
          <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-[#060c18] p-6 sm:p-8 text-white">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2sBHgcwGGH682Inyv8khjDYHYbX2V-2nDdvvc4mF1xciPRPIbXaNE4jQJSc3iThWuBQ1p0BrO0VCkjdAZpQZjWuDfITkyMGoeIw4s7NHK93pJyoWp7KXBUVIbwtG8wIX4gb_-xTnGVAY4eSBxATkUa1JuEoJx-pbEbmwoenu-Y77Nvj_DozD8V-OgxDYtHzH7hrDLtanp6cQP0Awq5OI-tNH0SvqV6qUTAtpS0BXqHlibmgvINwED"
              alt="OPPO Reno16 Smartphone"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="relative z-10 flex items-start justify-between">
              <span className="rounded-full bg-blue-600/80 px-3.5 py-1 text-[11px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                NEW RELEASE
              </span>
              <div className="flex items-center gap-1 rounded-xl bg-black/60 px-3 py-1.5 border border-amber-400/40 backdrop-blur-md">
                <span className="text-xs font-black text-amber-400 uppercase tracking-tight">RP</span>
                <span className="text-lg sm:text-2xl font-extrabold text-amber-300 tracking-tight">5.900.000</span>
              </div>
            </div>
            <div className="relative z-10 max-w-xl">
              <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-4xl lg:text-4xl">
                STARLINK STANDARD V4 <span className="font-light italic text-sky-300">5G</span>
              </h1>
              <p className="mt-2 max-w-md text-xs sm:text-sm text-white/80 line-clamp-2">
                Internet Satelit Kecepatan Tinggi untuk Rumah & Bisnis. Kuota Tanpa Batas dengan Latensi Rendah.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="rounded-xl bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 shadow-md transition-transform hover:scale-105">
                  Beli Sekarang
                </span>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "main-oppo",
        linkHref: "/produk/oppo-reno16",
        render: () => (
          <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="relative z-10 flex items-start justify-between">
              <span className="rounded-full bg-purple-600/80 px-3.5 py-1 text-[11px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                OFFICIAL PROMO
              </span>
            </div>
            <div className="relative z-10 max-w-xl">
              <h2 className="text-2xl font-black leading-tight tracking-tight sm:text-4xl">
                OPPO Reno16 Series <span className="font-light italic text-purple-300">5G</span>
              </h2>
              <p className="mt-2 max-w-md text-xs sm:text-sm text-white/80">
                Desain Planet 3D, AI Kolase Mix, dan Kamera Selfie 50MP Ultra-Wide.
              </p>
              <div className="mt-4">
                <span className="rounded-xl bg-purple-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md">
                  Selengkapnya
                </span>
              </div>
            </div>
          </div>
        ),
      },
    ];

  const trackRef = useRef<HTMLDivElement>(null);
  const [activeMainIndex, setActiveMainIndex] = useState(0);
  const [isMainPaused, setIsMainPaused] = useState(false);

  const updateActiveIndex = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveMainIndex(Math.max(0, Math.min(idx, mainSlides.length - 1)));
  }, [mainSlides.length]);

  const scrollToSlide = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
    setActiveMainIndex(index);
  };

  const handlePrev = () => {
    const nextIdx = activeMainIndex === 0 ? mainSlides.length - 1 : activeMainIndex - 1;
    scrollToSlide(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = (activeMainIndex + 1) % mainSlides.length;
    scrollToSlide(nextIdx);
  };

  // Main Carousel Auto-slide (5.0s)
  useEffect(() => {
    if (isMainPaused) return;
    const timer = setInterval(() => {
      const el = trackRef.current;
      if (!el || el.clientWidth === 0) return;
      const nextIdx = (activeMainIndex + 1) % mainSlides.length;
      scrollToSlide(nextIdx);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeMainIndex, isMainPaused, mainSlides.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateActiveIndex();
    el.addEventListener("scroll", updateActiveIndex, { passive: true });
    window.addEventListener("resize", updateActiveIndex);
    return () => {
      el.removeEventListener("scroll", updateActiveIndex);
      window.removeEventListener("resize", updateActiveIndex);
    };
  }, [updateActiveIndex]);

  // ── 2. TOP SIDE CARD SLIDES (Multi-slide rotatable card dengan flex bottom bar) ──
  const activeTop = hero.topRight.filter((b) => b.isActive);
  const topCardSlides: SideSlideItem[] = activeTop.length > 0
    ? activeTop.map((b) => ({
      id: b.id,
      linkHref: b.linkHref || undefined,
      renderContent: () => (
        <div className="relative flex h-full w-full flex-col justify-between overflow-hidden p-2 sm:p-3 lg:p-4 text-white" style={{ backgroundColor: b.bgColor || "#ffffff" }}>
          {b.imageUrl && (
            <Image src={b.imageUrl} alt={b.title} fill className="object-cover opacity-100 animate-fade-in" />
          )}

          {/* Header / Badge */}
          <div className="relative z-10 flex justify-between items-start w-full">
            {b.badge ? (
              <span className="bg-yellow-400 text-black text-[9px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded-md shadow-sm">
                {b.badge}
              </span>
            ) : <div />}
            {b.tagline && (
              <span className="text-[9px] sm:text-xs text-white/85 font-black uppercase tracking-wider bg-black/35 px-2 py-0.5 rounded backdrop-blur-sm border border-white/5">
                {b.tagline}
              </span>
            )}
          </div>

          {/* Title / Subtitle */}
          <div className="relative z-10 my-auto py-0.5">
            <h3 className="text-xs sm:text-base lg:text-lg font-black leading-tight sm:leading-snug tracking-tight text-white drop-shadow-md">
              {b.title}
            </h3>
            {b.subtitle && (
              <p className="mt-0.5 sm:mt-1 text-[9px] sm:text-xs font-medium text-amber-100/90 drop-shadow-sm line-clamp-1">
                {b.subtitle}
              </p>
            )}
          </div>

          {/* CTA Button */}
          <div className="relative z-10 flex items-center justify-between gap-1.5 w-full mt-auto">
            {b.ctaText ? (
              <span className="shrink-0 rounded-full bg-rose-600 px-3.5 py-0.5 sm:py-1 text-[8px] sm:text-[11px] font-black uppercase text-white tracking-tight shadow-md select-none whitespace-nowrap">
                {b.ctaText}
              </span>
            ) : <div />}
            <span className="shrink-0 text-[9px] sm:text-xs font-bold text-white/80 drop-shadow-sm">JernihCreatif</span>
          </div>
        </div>
      )
    }))
    : [
      // Slide 1: Intel Powering Ideas Banner
      {
        id: "top-intel-powering-ideas",
        linkHref: "/produk?category=laptop",
        renderContent: () => (
          <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#302111] via-[#1d1309] to-[#0d0702] p-2 sm:p-3 lg:p-4 text-white border border-amber-900/30">
            <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between gap-2 w-full">
              <span className="text-xl sm:text-2xl lg:text-3xl font-black italic tracking-tighter text-white font-sans select-none shrink-0">intel.</span>
              <span className="shrink-0 rounded-full bg-white/10 px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[9px] sm:text-xs font-bold uppercase tracking-wider text-amber-100/90 backdrop-blur-md border border-white/10 select-none">JernihCreatif</span>
            </div>
            <div className="relative z-10 my-auto py-0.5">
              <h3 className="text-xs sm:text-base lg:text-lg font-black leading-tight sm:leading-snug tracking-tight text-white">
                Powering Ideas <br /> Into <span className="text-[#38bdf8] font-black">Achievement.</span>
              </h3>
              <p className="mt-0.5 sm:mt-1 text-[9px] sm:text-xs font-medium text-white/80 line-clamp-1">Mulai Dari Rp 900.000</p>
            </div>
            <div className="relative z-10 flex items-center justify-between gap-1.5 sm:gap-2 w-full mt-auto">
              <span className="shrink-0 rounded-full bg-[#facc15] px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[8px] sm:text-[11px] font-black uppercase text-black tracking-tight shadow-md select-none whitespace-nowrap">FREE SMARTWATCH</span>
            </div>
          </div>
        ),
      },
      // Slide 2: Intel Gamer Days Banner
      {
        id: "top-intel-gamer-days",
        linkHref: "/produk?brand=intel",
        renderContent: () => (
          <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#030d30] via-[#081e62] to-[#020921] p-2 sm:p-3 lg:p-4 text-white border border-blue-900/30">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between gap-1.5 w-full">
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-white">intel.</span>
                <span className="rounded-sm bg-blue-600 px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white">Gamer Days</span>
              </div>
              <div className="shrink-0 flex items-center gap-1 rounded-full bg-white/10 px-2 sm:px-3 py-0.5 sm:py-1 backdrop-blur-md border border-white/10">
                <span className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[8px] sm:text-xs font-bold uppercase tracking-wider text-white">JernihCreatif</span>
              </div>
            </div>
            <div className="relative z-10 my-auto py-0.5">
              <h3 className="text-xs sm:text-base lg:text-lg font-black leading-tight sm:leading-snug tracking-tight text-white">
                Promo terbaik <br /> <span className="text-[#38bdf8]">di dunia game</span>
              </h3>
              <p className="mt-0.5 sm:mt-1 text-[9px] sm:text-xs leading-tight text-white/80 line-clamp-1">Dapatkan dua game dengan membeli Produk Intel® pilihan.</p>
            </div>
            <div className="relative z-10 flex items-center justify-between gap-1.5 sm:gap-2 w-full mt-auto">
              <span className="shrink-0 rounded-full bg-[#facc15] px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[8px] sm:text-[11px] font-black uppercase text-black tracking-tight shadow-md whitespace-nowrap">FREE HEADSET GAMING</span>
            </div>
          </div>
        ),
      },
      // Slide 3: AGRES CARE Protection
      {
        id: "top-agres-care",
        linkHref: "/syarat-ketentuan",
        renderContent: () => (
          <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#850b12] via-[#5c0308] to-[#2b0003] p-2 sm:p-3 lg:p-4 text-white border border-rose-900/30">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between gap-1.5 w-full">
              <span className="shrink-0 rounded-md bg-amber-400 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-xs font-black text-black tracking-tight uppercase">AGRES CARE</span>
              <span className="shrink-0 rounded-full bg-white/10 px-2 sm:px-3 py-0.5 sm:py-1 text-[8px] sm:text-xs font-bold text-amber-300 uppercase border border-white/10">1 TAHUN KAMI GANTI</span>
            </div>
            <div className="relative z-10 my-auto py-0.5">
              <div className="grid grid-cols-2 gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] font-bold text-amber-100">
                <span className="bg-black/30 px-1 sm:px-2 py-0.5 rounded text-center">• KEHILANGAN</span>
                <span className="bg-black/30 px-1 sm:px-2 py-0.5 rounded text-center">• KENA CAIRAN</span>
                <span className="bg-black/30 px-1 sm:px-2 py-0.5 rounded text-center">• BENCANA ALAM</span>
                <span className="bg-black/30 px-1 sm:px-2 py-0.5 rounded text-center">• JATUH / PECAH</span>
              </div>
            </div>
            <div className="relative z-10 flex items-center justify-between gap-1 sm:gap-2 w-full mt-auto">
              <span className="shrink-0 rounded-full bg-rose-600 px-2 sm:px-3 py-0.5 sm:py-1 text-[8px] sm:text-[11px] font-extrabold text-white uppercase tracking-tight whitespace-nowrap">+2 TAHUN SERVIS</span>
              <span className="shrink-0 text-[8px] sm:text-xs text-amber-300 font-bold text-right hidden xs:inline-block">GRATIS 500RB</span>
            </div>
          </div>
        ),
      },
    ];

  // ── 3. BOTTOM SIDE CARD SLIDES (Multi-slide rotatable card dengan flex bottom bar) ──
  const activeBottom = hero.bottomRight.filter((b) => b.isActive);
  const bottomCardSlides: SideSlideItem[] = activeBottom.length > 0
    ? activeBottom.map((b) => ({
      id: b.id,
      linkHref: b.linkHref || undefined,
      renderContent: () => (
        <div className="relative flex h-full w-full flex-col justify-between overflow-hidden p-7 sm:p-3 lg:p-4 text-white" style={{ backgroundColor: b.bgColor || "#ffffff" }}>
          {b.imageUrl && (
            <Image src={b.imageUrl} alt={b.title} fill className="object-cover opacity-100 animate-fade-in" />
          )}

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between gap-1.5 w-full">
            {b.badge ? (
              <span className="shrink-0 rounded-md bg-amber-400 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-xs font-black text-black tracking-tight uppercase">
                {b.badge}
              </span>
            ) : <div />}
            {b.tagline && (
              <span className="text-[9px] sm:text-xs font-bold text-white bg-black/35 px-2.5 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
                {b.tagline}
              </span>
            )}
          </div>

          {/* Title / Subtitle */}
          <div className="relative z-10 my-auto py-0.5">
            <h3 className="text-[11px] sm:text-sm lg:text-base font-black leading-tight sm:leading-snug tracking-tight text-white uppercase drop-shadow-md line-clamp-2">
              {b.title}
            </h3>
            {b.subtitle && (
              <p className="mt-0.5 sm:mt-1 text-[8px] sm:text-xs font-medium text-emerald-100/90 drop-shadow-sm line-clamp-1">
                {b.subtitle}
              </p>
            )}
          </div>

          {/* CTA */}
          <div className="relative z-10 flex items-center justify-between gap-1.5 w-full mt-auto">
            {b.ctaText ? (
              <span className="shrink-0 rounded-full bg-[#e11d48] px-3.5 py-0.5 sm:py-1 text-[8px] sm:text-[11px] font-black uppercase text-white tracking-tight shadow-md select-none whitespace-nowrap">
                {b.ctaText}
              </span>
            ) : <div />}
            <span className="shrink-0 text-[9px] sm:text-xs font-bold text-white/80 drop-shadow-sm">JernihCreatif</span>
          </div>
        </div>
      )
    }))
    : [
      // Slide 1: Hisense Retailer Banner
      {
        id: "bottom-hisense-official",
        linkHref: "/produk?category=tv",
        renderContent: () => (
          <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#4d0309] via-[#330105] to-[#1a0002] p-2 sm:p-3 lg:p-4 text-white border border-rose-950/40">
            <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between gap-1.5 w-full">
              <span className="text-xl sm:text-2xl lg:text-3xl font-black italic tracking-tight text-[#00c594] select-none shrink-0">Hisense</span>
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <span className="text-[8px] sm:text-xs font-extrabold uppercase tracking-wider text-white bg-white/15 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full backdrop-blur-md border border-white/10 select-none">OFFICIAL RETAILER</span>
                <span className="text-[8px] sm:text-xs font-black tracking-wide text-amber-400 bg-black/60 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-amber-400/20 select-none">JernihCreatif</span>
              </div>
            </div>
            <div className="relative z-10 my-auto py-0.5">
              <h3 className="text-[11px] sm:text-sm lg:text-base font-black leading-tight sm:leading-snug tracking-tight text-white uppercase line-clamp-2">TV · KULKAS · MESIN CUCI · AC · PROJECTOR</h3>
              <p className="mt-0.5 sm:mt-1 text-[8px] sm:text-xs font-medium text-white/80 line-clamp-1">Solusi Elektronik Rumah Tangga Modern Terlengkap</p>
            </div>
            <div className="relative z-10 flex items-center justify-between gap-1.5 w-full mt-auto">
              <span className="shrink-0 rounded-full bg-[#e11d48] px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[8px] sm:text-[11px] font-black uppercase text-white tracking-tight shadow-md select-none whitespace-nowrap">PROMO AGUSTUS 2026</span>
              <span className="shrink-0 text-[9px] sm:text-xs font-bold text-[#2dd4bf] tracking-tight select-none hidden xs:inline-block whitespace-nowrap">Garansi Resmi</span>
            </div>
          </div>
        ),
      },
      // Slide 2: Hisense Appliances Showcase
      {
        id: "bottom-hisense-appliances",
        linkHref: "/produk?category=elektronik",
        renderContent: () => (
          <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#1a2e23] via-[#0d1a13] to-[#040a07] p-2 sm:p-3 lg:p-4 text-white">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between gap-1.5 w-full">
              <span className="text-xl sm:text-2xl font-black italic tracking-tight text-[#00c594] shrink-0">Hisense</span>
              <span className="shrink-0 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 sm:px-3 py-0.5 sm:py-1 text-[8px] sm:text-xs font-bold">#1 Global Brand</span>
            </div>
            <div className="relative z-10 my-auto py-0.5">
              <h3 className="text-xs sm:text-base font-black text-white leading-tight">Diskon Elektronik Rumah <span className="text-emerald-400">Hingga 40%</span></h3>
              <p className="mt-0.5 sm:mt-1 text-[8px] sm:text-xs text-white/80 line-clamp-1">Gratis Pengiriman & Pemasangan</p>
            </div>
            <div className="relative z-10 flex items-center justify-between gap-1.5 w-full mt-auto">
              <span className="shrink-0 rounded-full bg-emerald-600 px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[8px] sm:text-[11px] font-bold text-white uppercase shadow-md whitespace-nowrap">Beli Sekarang</span>
              <span className="shrink-0 text-[8px] sm:text-xs text-emerald-300 font-bold text-right hidden xs:inline-block">Free Ongkir</span>
            </div>
          </div>
        ),
      },
      // Slide 3: eraXpress Express Delivery
      {
        id: "bottom-eraxpress",
        linkHref: "/tentang",
        renderContent: () => (
          <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0d2149] via-[#091533] to-[#030917] p-4 sm:p-5 text-white">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-lg font-black italic tracking-tight text-sky-400">eraXpress</span>
              <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[9px] font-bold text-sky-300 border border-sky-500/30">⚡ FAST DELIVERY</span>
            </div>
            <div className="relative z-10 my-auto py-1">
              <h3 className="text-sm sm:text-base font-black text-white">Pasti Sampai Hari Ini</h3>
              <p className="mt-0.5 text-[10px] text-white/75">Layanan Kirim Instan & Sameday Terpercaya</p>
            </div>
            <div className="relative z-10 flex items-center justify-between gap-2 w-full mt-auto">
              <span className="shrink-0 rounded bg-sky-600 px-2.5 py-0.5 text-[9px] font-bold text-white uppercase">Info Selengkapnya</span>
              <span className="shrink-0 text-[9px] text-sky-300 font-bold text-right">Fast Delivery</span>
            </div>
          </div>
        ),
      },
    ];

  return (
    <section className="mx-auto w-full max-w-[1260px] px-4 py-4 md:px-6">
      {/* ── DESKTOP GRID LAYOUT (Main Hero on Left 8 Cols, 2 Stacked Side Cards on Right 4 Cols) ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">

        {/* ── 1. MAIN HERO CAROUSEL (Left - 8 Columns on Desktop) ───────────────── */}
        <div
          className="relative lg:col-span-8 w-full h-[168px] sm:h-[340px] md:h-[380px] lg:h-[332px] group"
          onMouseEnter={() => setIsMainPaused(true)}
          onMouseLeave={() => setIsMainPaused(false)}
          onTouchStart={() => setIsMainPaused(true)}
          onTouchEnd={() => setIsMainPaused(false)}
        >
          {/* Main Slider Track */}
          <div
            ref={trackRef}
            className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth scrollbar-none rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100/60"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {mainSlides.map((slide) => (
              <div key={slide.id} className="h-full w-full flex-shrink-0 snap-center">
                {slide.linkHref ? (
                  <Link href={slide.linkHref} className="block h-full w-full">
                    {slide.render()}
                  </Link>
                ) : (
                  slide.render()
                )}
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {mainSlides.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                aria-label="Previous slide"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/60 active:scale-90 shadow-md opacity-90 sm:opacity-0 group-hover:opacity-100"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                aria-label="Next slide"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/60 active:scale-90 shadow-md opacity-90 sm:opacity-0 group-hover:opacity-100"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Pagination Dots for Main Slider */}
          {mainSlides.length > 1 && (
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-md">
              {mainSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToSlide(i)}
                  aria-label={`Go to main slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${activeMainIndex === i ? "w-5 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── 2. TWO ROTATABLE SIDE CARDS ───── */}
        <div className="lg:col-span-4 grid grid-cols-2 lg:flex lg:flex-col gap-2.5 sm:gap-3.5 lg:h-[332px]">
          {/* Top Side Card Slider */}
          <SideCardSlider
            slides={topCardSlides}
            autoPlayMs={4200}
            className="h-[220px] sm:h-[190px] lg:h-auto lg:flex-1 lg:min-h-0 w-full"
          />

          {/* Bottom Side Card Slider */}
          <SideCardSlider
            slides={bottomCardSlides}
            autoPlayMs={4800}
            className="h-[220px] sm:h-[190px] lg:h-auto lg:flex-1 lg:min-h-0 w-full"
          />
        </div>

      </div>
    </section>
  );
}
