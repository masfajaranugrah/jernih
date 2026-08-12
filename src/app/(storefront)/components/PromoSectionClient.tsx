"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PromoCard } from "@/lib/promo-actions";

export default function PromoSectionClient({ promoCards }: { promoCards: PromoCard[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  // Ukuran kartu direplikasi dari class card (70vw di mobile, 38vw di sm).
  function cardStep(): number {
    if (!trackRef.current) return 280;
    const first = trackRef.current.querySelector<HTMLElement>("[data-card]");
    const scrollW = trackRef.current.clientWidth;
    const cardW = first ? first.offsetWidth : Math.min(scrollW * 0.7, 280);
    // geser = lebar kartu + gap (1rem)
    return cardW + 16;
  }

  const updateNav = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  function scrollBy(direction: 1 | -1) {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: direction * cardStep(), behavior: "smooth" });
  }

  // update tombol saat scroll / resize
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateNav();
    el.addEventListener("scroll", updateNav, { passive: true });
    window.addEventListener("resize", updateNav);
    return () => {
      el.removeEventListener("scroll", updateNav);
      window.removeEventListener("resize", updateNav);
    };
  }, [updateNav]);

  // auto-play: geser maju tiap 4.5 detik, loop kembali ke awal
  useEffect(() => {
    const el = trackRef.current;
    if (!el || promoCards.length <= 1) return;
    const id = setInterval(() => {
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      el.scrollBy({ left: atEnd ? -el.scrollLeft : cardStep(), behavior: "smooth" });
      updateNav();
    }, 4500);
    return () => clearInterval(id);
  }, [promoCards.length, updateNav]);

  return (
    <div className="relative">
      {/* Tombol kiri / kanan — desktop saja */}
      <div className="absolute -left-5 top-1/2 z-20 hidden -translate-y-1/2 md:block">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          disabled={!canPrev}
          aria-label="Promo sebelumnya"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-[#191c1d] shadow-lg transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
      </div>

      <div
        ref={trackRef}
        className="scrollbar-hide -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scroll-smooth md:mx-0 md:px-0"
      >
        {promoCards.map((promo) => (
          <Link
            href={promo.linkHref ?? "/produk"}
            key={promo.id}
            data-card
            className="group relative aspect-[3/4] w-[70vw] max-w-[280px] shrink-0 snap-center overflow-hidden rounded-3xl bg-white shadow-lg shadow-black/5 sm:w-[38vw]"
          >
            <Image
              src={promo.image}
              alt={promo.title}
              fill
              sizes="(min-width: 768px) 280px, 70vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute left-3 top-3 rounded-full bg-[#575e70] px-2.5 py-0.5 text-xs font-bold text-white">
              PROMO
            </div>
            {promo.category && (
              <div className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-[#191c1d]">
                {promo.category}
              </div>
            )}
            <div className="absolute inset-x-3 bottom-3 text-white">
              <h3 className="text-xs font-bold">{promo.title}</h3>
              <p className="mt-1 text-xl font-black text-[#a5b4fc]">{promo.price}</p>
              <span className="mt-3 block rounded-xl bg-white py-1.5 text-center text-xs font-bold text-[#191c1d]">
                Lihat Detail
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Tombol kanan — desktop saja */}
      <div className="absolute -right-5 top-1/2 z-20 hidden -translate-y-1/2 md:block">
        <button
          type="button"
          onClick={() => scrollBy(1)}
          disabled={!canNext}
          aria-label="Promo berikutnya"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-[#191c1d] shadow-lg transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>
      </div>
    </div>
  );
}