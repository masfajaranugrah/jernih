"use client";

import React, { useState } from "react";
import Link from "next/link";

interface FlexPromoBannerProps {
  className?: string;
}

/**
 * 1. Kartu Promo Intel (Flexbox Layout)
 * Titik-titik slide (Pagination Dots) diletakkan konsisten tepat di tengah (absolute center).
 */
export function IntelFlexBannerCard({ className = "" }: { className?: string }) {
  const [activeDot, setActiveDot] = useState(2); // Slide ke-3 aktif

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#302111] via-[#1d1309] to-[#0d0702] p-3.5 sm:p-5 lg:p-6 text-white shadow-lg border border-amber-900/30 w-full h-[165px] sm:h-[185px] lg:h-[192px] ${className}`}
    >
      {/* Visual Background Glow */}
      <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

      {/* ── FLEX ROW 1: HEADER (Logo & Store Badge) ── */}
      <div className="relative z-10 flex items-center justify-between w-full gap-2">
        {/* Brand Logo Left */}
        <span className="text-xl sm:text-2xl lg:text-3xl font-black italic tracking-tighter text-white font-sans select-none shrink-0">
          intel.
        </span>

        {/* Store Badge Right */}
        <span className="shrink-0 rounded-full bg-white/10 px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[9px] sm:text-xs font-bold uppercase tracking-wider text-amber-100/90 backdrop-blur-md border border-white/10 select-none">
          AGRES.ID
        </span>
      </div>

      {/* ── FLEX COL 2: MAIN CONTENT (Middle) ── */}
      <div className="relative z-10 flex flex-col justify-center my-auto py-0.5">
        <h3 className="text-xs sm:text-base lg:text-lg font-black leading-tight sm:leading-snug tracking-tight text-white">
          Powering Ideas <br />
          Into <span className="text-[#38bdf8] font-black">Achievement.</span>
        </h3>
        <p className="mt-0.5 sm:mt-1 text-[9px] sm:text-xs font-medium text-white/80 line-clamp-1">
          Mulai Dari Rp 900.000
        </p>
      </div>

      {/* ── FLEX ROW 3: FOOTER ACTION & CENTERED DOTS INDICATOR ── */}
      <div className="relative z-10 flex items-center justify-between gap-1.5 sm:gap-3 w-full mt-auto min-h-[24px]">
        {/* Yellow Promo Button */}
        <span className="shrink-0 rounded-full bg-[#facc15] px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[8px] sm:text-[11px] font-black uppercase text-black tracking-tight shadow-md hover:bg-amber-300 transition-colors cursor-pointer select-none whitespace-nowrap z-10">
          FREE SMARTWATCH
        </span>

        {/* Carousel Pagination Dots Capsule - Konsisten Presisi di Tengah (Absolute Center) */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-20 pointer-events-auto">
          <div className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-black/50 px-2 sm:px-3 py-0.5 sm:py-1 backdrop-blur-md border border-white/10">
            {[0, 1, 2, 3].map((idx) => (
              <button
                key={idx}
                onClick={() => setActiveDot(idx)}
                aria-label={`Intel Slide ${idx + 1}`}
                className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                  activeDot === idx ? "w-3 sm:w-4 bg-white" : "w-1 sm:w-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Label Placeholder (Kosong agar rata kiri-kanan sempurna) */}
        <span className="shrink-0 text-[9px] sm:text-xs font-bold text-white/60 tracking-tight select-none z-10 ml-auto hidden xs:inline-block whitespace-nowrap opacity-0">
          AGRES.ID
        </span>
      </div>
    </div>
  );
}

/**
 * 2. Kartu Promo Hisense (Flexbox Layout)
 * Titik-titik slide (Pagination Dots) diletakkan konsisten tepat di tengah (absolute center).
 */
export function HisenseFlexBannerCard({ className = "" }: { className?: string }) {
  const [activeDot, setActiveDot] = useState(0); // Slide 1 aktif

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#4d0309] via-[#330105] to-[#1a0002] p-3.5 sm:p-5 lg:p-6 text-white shadow-lg border border-rose-950/40 w-full h-[165px] sm:h-[185px] lg:h-[192px] ${className}`}
    >
      {/* Visual Background Glow */}
      <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

      {/* ── FLEX ROW 1: HEADER (Logo & Retailer Badges) ── */}
      <div className="relative z-10 flex items-center justify-between w-full gap-1.5">
        {/* Hisense Brand Logo Left */}
        <span className="text-xl sm:text-2xl lg:text-3xl font-black italic tracking-tight text-[#00c594] font-sans select-none shrink-0">
          Hisense
        </span>

        {/* Retailer Badges Right */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <span className="rounded-full bg-white/15 px-2 sm:px-3 py-0.5 sm:py-1 text-[8px] sm:text-xs font-extrabold uppercase tracking-wider text-white backdrop-blur-md border border-white/10 select-none">
            OFFICIAL RETAILER
          </span>
          <span className="rounded-md bg-black/60 px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[8px] sm:text-xs font-black uppercase tracking-wide text-amber-400 border border-amber-400/20 select-none">
            AGRES.ID
          </span>
        </div>
      </div>

      {/* ── FLEX COL 2: MAIN CONTENT (Middle) ── */}
      <div className="relative z-10 flex flex-col justify-center my-auto py-0.5">
        <h3 className="text-[11px] sm:text-sm lg:text-base font-black leading-tight sm:leading-snug tracking-tight text-white uppercase line-clamp-2">
          TV · KULKAS · MESIN CUCI · AC · PROJECTOR
        </h3>
        <p className="mt-0.5 sm:mt-1 text-[8px] sm:text-xs font-medium text-white/80 line-clamp-1">
          Solusi Elektronik Rumah Tangga Modern Terlengkap
        </p>
      </div>

      {/* ── FLEX ROW 3: FOOTER ACTION, CENTERED DOTS & GARANSI ── */}
      <div className="relative z-10 flex items-center justify-between gap-1.5 sm:gap-2 w-full mt-auto min-h-[24px]">
        {/* Pink/Red Promo Pill */}
        <span className="shrink-0 rounded-full bg-[#e11d48] px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[8px] sm:text-[11px] font-black uppercase text-white tracking-tight shadow-md hover:bg-rose-500 transition-colors cursor-pointer select-none whitespace-nowrap z-10">
          PROMO AGUSTUS 2026
        </span>

        {/* Pagination Dots - Konsisten Presisi di Tengah (Absolute Center) */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-20 pointer-events-auto">
          <div className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-black/40 px-1.5 sm:px-2.5 py-0.5 sm:py-1 backdrop-blur-xs border border-white/10">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => setActiveDot(idx)}
                aria-label={`Hisense Slide ${idx + 1}`}
                className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                  activeDot === idx ? "w-3 sm:w-4 bg-white" : "w-1 sm:w-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Guarantee Label */}
        <span className="shrink-0 text-[9px] sm:text-xs font-bold text-[#2dd4bf] tracking-tight select-none z-10 ml-auto hidden xs:inline-block whitespace-nowrap">
          Garansi Resmi
        </span>
      </div>
    </div>
  );
}

/**
 * Container Gabungan Both Flex Cards (Side-by-side / Kanan-Kiri di Mobile & Stacked di Desktop)
 */
export default function FlexPromoBannerContainer() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-4 w-full max-w-4xl mx-auto p-2">
      <Link href="/produk?brand=intel" className="block w-full min-w-0">
        <IntelFlexBannerCard />
      </Link>
      <Link href="/produk?brand=hisense" className="block w-full min-w-0">
        <HisenseFlexBannerCard />
      </Link>
    </div>
  );
}
