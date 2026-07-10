"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useQuery } from "@tanstack/react-query";
import { formatRupiah, type ApiProduct } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

async function fetchProductsClient(limit = 8): Promise<ApiProduct[]> {
  try {
    const res = await fetch(`${API_URL}/products?limit=${limit}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

function Icon({ children, className = "" }: { children: string; className?: string }) {
  return (
    <svg className={`inline-block h-[1em] w-[1em] fill-current ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      {children === "star" && <path d="m12 2 2.9 6 6.6.9-4.8 4.7 1.1 6.6L12 17.1l-5.8 3.1 1.1-6.6-4.8-4.7 6.6-.9L12 2Z" />}
    </svg>
  );
}

function ProductCard({ product }: { product: ApiProduct }) {
  if (!product) return null;
  const badgeMatch = product.description?.match(/^\[badge:([A-Z0-9]+)\]/);
  const badge = badgeMatch ? badgeMatch[1] : product.oldPrice ? "SALE" : null;
  const badgeColors: Record<string, string> = {
    SALE: "bg-[#ba1a1a]", NEW: "bg-[#064e3b]", HOT: "bg-orange-500",
    DISKON: "bg-[#1d4ed8]", TERBATAS: "bg-[#7c3aed]",
  };

  return (
    <Link
      href={`/produk/${product.slug}`}
      className="group flex min-h-full flex-col overflow-hidden rounded-2xl border border-[#bfc9c3]/40 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-[#edeeef]">
        <Image
          src={product.images && product.images[0] ? product.images[0] : "/placeholder.png"}
          alt={product.name}
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {badge && (
          <div className={`absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded text-white uppercase ${badgeColors[badge] ?? "bg-[#ba1a1a]"}`}>
            {badge}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#064e3b]">
          {product.category?.name}
        </span>
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-[#191c1d] sm:text-base">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center gap-1 text-sm font-semibold text-[#575e70]">
          <Icon className="text-base text-amber-500">star</Icon>
          {product.rating}
        </div>
        <div className="border-t border-[#bfc9c3]/30 pt-3">
          {product.oldPrice ? (
            <div className="text-xs text-[#707974] line-through">{formatRupiah(product.oldPrice)}</div>
          ) : null}
          <div className="text-base font-bold text-[#064e3b] sm:text-lg">{formatRupiah(product.price)}</div>
        </div>
      </div>
    </Link>
  );
}

// Skeleton Card
function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#bfc9c3]/40 bg-white shadow-sm">
      <div className="aspect-square bg-[#edeeef] animate-pulse" />
      <div className="flex flex-col gap-2 p-3 sm:p-4">
        <div className="h-2.5 w-16 rounded bg-[#edeeef] animate-pulse" />
        <div className="h-3.5 w-full rounded bg-[#edeeef] animate-pulse" />
        <div className="h-3 w-20 rounded bg-[#edeeef] animate-pulse mt-auto" />
        <div className="h-4 w-24 rounded bg-[#edeeef] animate-pulse mt-2" />
      </div>
    </div>
  );
}

export default function ProductSectionClient() {
  const [isMobile, setIsMobile] = useState(true);
  const parentRef = useRef<HTMLDivElement>(null);

  // TanStack Query — real-time, no cache
  const { data, isPending } = useQuery({
    queryKey: ["storefront-products"],
    queryFn: () => fetchProductsClient(8),
  });

  const products: ApiProduct[] = Array.isArray(data) ? data : [];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const rowVirtualizer = useVirtualizer({
    horizontal: true,
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 172,
    overscan: 2,
  });

  if (isPending) {
    return (
      <div className="mt-5 -mx-4 flex gap-3 overflow-x-hidden px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-[160px] flex-shrink-0 md:w-auto">
            <SkeletonCard />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) return null;

  if (isMobile) {
    return (
      <div
        ref={parentRef}
        className="mt-5 -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide relative"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div style={{ width: `${rowVirtualizer.getTotalSize()}px`, height: "100%", position: "relative", display: "flex" }}>
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const product = products[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                style={{ position: "absolute", top: 0, left: 0, width: "160px", transform: `translateX(${virtualItem.start}px)` }}
                className="flex-shrink-0"
              >
                <ProductCard product={product} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 md:grid md:grid-cols-4 md:gap-6">
      {products.map((product) => (
        <div key={product.id}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
