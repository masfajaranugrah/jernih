"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
  const sellerName = "Jernih Creative Official";
  const badgeColors: Record<string, string> = {
    SALE: "bg-[#ba1a1a]", NEW: "bg-[#1e3a8a]", HOT: "bg-orange-500",
    DISKON: "bg-[#1e3a8a]", TERBATAS: "bg-[#7c3aed]",
  };

  return (
    <Link
      href={`/produk/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#bfc9c3]/40 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
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
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="line-clamp-2 min-h-[38px] text-sm font-semibold leading-snug text-[#191c1d] sm:min-h-[44px] sm:text-base">
          {product.name}
        </h3>
        <div className="mt-3">
          {product.oldPrice ? (
            <div className="text-xs text-[#707974] line-through">{formatRupiah(product.oldPrice)}</div>
          ) : null}
          <div className="text-base font-bold text-[#1e3a8a] sm:text-lg">{formatRupiah(product.price)}</div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-[#575e70]">
          <Icon className="text-base text-amber-500">star</Icon>
          {product.rating ?? 0}
        </div>
        <div className="mt-auto border-t border-[#bfc9c3]/30 pt-3">
          <p className="line-clamp-1 text-[11px] font-semibold text-[#1e3a8a] sm:text-xs">{sellerName}</p>
        </div>
      </div>
    </Link>
  );
}

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

  if (isPending) {
    return (
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <SkeletonCard />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) return null;

  // Mobile: two-column grid to match the product listing page.
  if (isMobile) {
    return (
      <div className="mt-5 grid grid-cols-2 gap-3">
        {products.map((product) => (
          <div key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    );
  }

  // Desktop: 4-column grid
  return (
    <div className="mt-5 grid grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
