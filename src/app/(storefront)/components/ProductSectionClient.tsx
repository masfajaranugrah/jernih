"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatRupiah, type ApiProduct } from "@/lib/api";
import { emitWishlistChange } from "@/lib/cart";
import { resolveImageUrl } from "@/lib/image-url";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

async function fetchProductsClient(limit = 12): Promise<ApiProduct[]> {
  try {
    const res = await fetch(`${API_URL}/products?limit=${limit}&light=true`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

function HeartIcon({ isFav }: { isFav: boolean }) {
  return (
    <svg
      className={`w-5 h-5 shrink-0 ${isFav ? "fill-white text-white" : "fill-none stroke-black stroke-2"}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function truncate(text: string, max = 60): string {
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trimEnd() + "..." : text;
}

function getBadgeText(product: ApiProduct, idx?: number): string | null {
  if (product.description) {
    const m = product.description.match(/^\[badge:([A-Z0-9%\s-]+)\]/i);
    if (m) return m[1].trim().toUpperCase();
  }

  const oldP = product.oldPrice ? Number(product.oldPrice) : 0;
  const curP = Number(product.price);
  const discountPercent = oldP > curP ? Math.round(((oldP - curP) / oldP) * 100) : 0;
  if (discountPercent > 0) {
    return `-${discountPercent}%`;
  }

  if (typeof idx === "number") {
    const demoBadges = ["PROMO", "NEW", "HOT", null];
    return demoBadges[idx % demoBadges.length];
  }

  return null;
}

function ProductCard({
  product,
  index,
}: {
  product: ApiProduct;
  index?: number;
}) {
  if (!product) return null;
  const badgeText = getBadgeText(product, index);

  return (
    <Link
      href={`/produk/${product.slug}`}
      className="group relative flex h-auto w-[210px] flex-shrink-0 flex-col rounded-[28px] border border-neutral-100 bg-white p-3.5 shadow-sm sm:w-[240px] sm:rounded-[32px] sm:p-4 hover:shadow-md transition-all"
    >
      {/* Top Left Black Capsule Pill Badge (Promo, -5%, New, Hot) */}
      {badgeText && (
        <div className="absolute top-2.5 left-2.5 z-20 rounded-full bg-black px-3.5 py-1 text-[11px] font-extrabold text-white shadow-md flex items-center justify-center whitespace-nowrap tracking-wide">
          {badgeText}
        </div>
      )}

      {/* Product image fills its full image area. */}
      <div className="relative -mx-3.5 -mt-3.5 aspect-[4/3] w-[calc(100%+1.75rem)] shrink-0 overflow-hidden rounded-t-[27px] sm:-mx-4 sm:-mt-4 sm:w-[calc(100%+2rem)] sm:rounded-t-[31px]">

        {/* Top Right Black Circle Button with Diagonal Arrow ↗ matching screenshot */}
        <div className="absolute top-2.5 right-2.5 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black text-white flex items-center justify-center shadow-md">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 stroke-white fill-none stroke-[2.5]" viewBox="0 0 24 24">
            <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Product Image */}
        <Image
          src={resolveImageUrl(product.images && product.images[0] ? product.images[0] : null)}
          alt={product.name}
          fill
          sizes="240px"
          className="object-cover"
        />
      </div>

      {/* Info Section - Nama penuh (kecil), rating, lalu harga */}
      <div className="mt-2.5 flex flex-col items-start text-left px-0.5">
        <h3 className="font-semibold text-xs sm:text-sm leading-snug text-black">
          {truncate(product.name)}
        </h3>
        {/* Baris rating + total terjual */}
        <div className="mt-1.5 flex w-full items-center gap-1">
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 fill-[#f59e0b] shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-[11px] sm:text-xs font-bold text-neutral-700">
              {product.rating ? Number(product.rating).toFixed(1) : "0.0"}
            </span>
          </div>
          <span className="text-[11px] sm:text-xs font-medium text-neutral-400">.</span>
          <span className="text-[11px] sm:text-xs font-medium text-neutral-400">
            {product.totalSold.toLocaleString("id-ID")} terjual
          </span>
        </div>

        {/* Harga tersusun vertikal: harga jual di atas, harga coret di bawah */}
        <div className="mt-1.5 flex flex-col items-start">
          <span className="font-bold text-sm sm:text-base text-neutral-900">
            {formatRupiah(product.price)}
          </span>
          {product.oldPrice && Number(product.oldPrice) > Number(product.price) && (
            <span className="text-xs sm:text-[13px] text-neutral-400 line-through">
              {formatRupiah(product.oldPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="flex h-auto w-[210px] flex-shrink-0 flex-col rounded-[28px] border border-neutral-100 bg-white p-3.5 shadow-xs animate-pulse sm:w-[240px] sm:rounded-[32px] sm:p-4">
      <div className="-mx-3.5 -mt-3.5 aspect-[4/3] w-[calc(100%+1.75rem)] rounded-t-[27px] bg-[#f3f4f1] sm:-mx-4 sm:-mt-4 sm:w-[calc(100%+2rem)] sm:rounded-t-[31px]" />
      <div className="mt-3 space-y-2 flex flex-col items-start px-1">
        <div className="h-4 w-3/4 rounded-full bg-neutral-200" />
        <div className="h-4 w-1/2 rounded-full bg-neutral-200" />
      </div>
    </div>
  );
}

export default function ProductSectionClient() {
  const [favMap, setFavMap] = useState<Record<string, boolean>>({});

  const { data, isPending } = useQuery({
    queryKey: ["storefront-products"],
    queryFn: () => fetchProductsClient(12),
  });

  const products: ApiProduct[] = Array.isArray(data) ? data : [];

  function toggleFav(id: string) {
    setFavMap((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      // Jangan panggil emitWishlistChange — ini hanya state lokal,
      // bukan API. Navbar/MobileBottomNav tidak perlu refetch.
      return next;
    });
  }

  if (isPending) {
    return (
      <div className="mt-5 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex gap-4 sm:gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="space-y-5">
      {/* Horizontal Scroll / Grid Cards matching screenshot */}
      <div className="overflow-x-auto pb-4 scrollbar-hide pt-1">
        <div className="flex gap-4 sm:gap-6 items-start">
          {products.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              index={idx}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
