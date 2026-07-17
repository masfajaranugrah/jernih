"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { formatRupiah, type ApiProduct } from "@/lib/api";

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

function formatNumber(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "rb";
  return String(num);
}

function ProductCard({ product }: { product: ApiProduct }) {
  if (!product) return null;
  const oldP = product.oldPrice ? Number(product.oldPrice) : 0;
  const curP = Number(product.price);
  const discountPercent = oldP > curP ? Math.round(((oldP - curP) / oldP) * 100) : 0;
  const hasDiscount = discountPercent > 0;

  return (
    <Link
      href={`/produk/${product.slug}`}
      className="group flex h-full w-[170px] flex-shrink-0 flex-col overflow-hidden rounded-[8px] bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.08)] transition-all duration-200 hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.12)] sm:w-[200px]"
    >
      <div className="relative aspect-square overflow-hidden bg-[#f5f5f5]">
        <Image
          src={product.images && product.images[0] ? product.images[0] : "/placeholder.png"}
          alt={product.name}
          fill
          sizes="200px"
          className="object-cover"
        />
        {hasDiscount && (
          <div className="absolute top-2 left-0 rounded-r-[4px] bg-[#ee4d2d] px-1.5 py-[3px] text-[11px] font-bold leading-none text-white">
            {discountPercent}%
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-[3px] p-2.5 sm:p-3">
        <h3 className="line-clamp-2 text-[13px] font-normal leading-[18px] text-[#191c1d]">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5 text-[11px] text-[#6b7280]">
          <span className="flex items-center gap-[2px]">
            <svg className="h-3 w-3 fill-[#f59e0b]" viewBox="0 0 24 24">
              <path d="m12 2 2.9 6 6.6.9-4.8 4.7 1.1 6.6L12 17.1l-5.8 3.1 1.1-6.6-4.8-4.7 6.6-.9L12 2Z" />
            </svg>
            5.0
          </span>
          {product.totalSold > 0 && (
            <>
              <span className="text-[#d1d5db]">|</span>
              <span>Terjual {formatNumber(product.totalSold)}</span>
            </>
          )}
        </div>
        <div className="flex items-baseline gap-1.5">
          {hasDiscount && (
            <span className="text-[11px] text-[#6b7280] line-through">{formatRupiah(product.oldPrice!)}</span>
          )}
          <span className="text-sm font-bold text-[#191c1d] leading-none">{formatRupiah(product.price)}</span>
        </div>
        <div className="mt-auto pt-[2px]">
          <span className="text-[10px] font-normal text-[#6b7280]">Jakarta</span>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="flex h-full w-[170px] flex-shrink-0 flex-col overflow-hidden rounded-[8px] bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.08)] sm:w-[200px]">
      <div className="aspect-square bg-[#f5f5f5] animate-pulse" />
      <div className="flex flex-col gap-2 p-2.5 sm:p-3">
        <div className="h-3 w-3/4 rounded bg-[#f5f5f5] animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-[#f5f5f5] animate-pulse" />
        <div className="h-3.5 w-16 rounded bg-[#f5f5f5] animate-pulse" />
        <div className="h-3 w-12 rounded bg-[#f5f5f5] animate-pulse" />
      </div>
    </div>
  );
}

export default function ProductSectionClient() {
  const { data, isPending } = useQuery({
    queryKey: ["storefront-products"],
    queryFn: () => fetchProductsClient(12),
  });

  const products: ApiProduct[] = Array.isArray(data) ? data : [];

  if (isPending) {
    return (
      <div className="mt-5 overflow-x-auto pb-2 scrollbar-hide md:max-w-[1260px]">
        <div className="flex gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="mt-5 overflow-x-auto pb-2 scrollbar-hide md:max-w-[1260px]">
      <div className="flex gap-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
