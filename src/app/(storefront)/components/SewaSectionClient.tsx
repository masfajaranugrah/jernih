"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useQuery } from "@tanstack/react-query";
import type { ApiRentalItem } from "@/lib/rental-actions";
import { formatRupiah } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

async function fetchRentalItemsClient(limit = 4): Promise<ApiRentalItem[]> {
  try {
    const res = await fetch(`${API_URL}/rentals/items?limit=${limit}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? json : (json.data ?? []);
  } catch {
    return [];
  }
}

function RentalCard({ item }: { item: ApiRentalItem }) {
  if (!item) return null;
  return (
    <div className="group overflow-hidden rounded-2xl border border-[#bfc9c3]/40 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full">
      <div className="relative aspect-square overflow-hidden bg-[#edeeef]">
        {item.images && item.images[0] ? (
          <Image
            src={item.images[0]}
            alt={item.name}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg className="h-12 w-12 fill-[#bfc9c3]" viewBox="0 0 24 24">
              <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 left-2 rounded bg-[#064e3b] px-2 py-0.5 text-[10px] font-black uppercase text-white">
          Sewa
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="mt-1 line-clamp-2 text-sm font-medium text-[#191c1d] sm:text-base">
          {item.name}
        </h3>
        <p className="mt-4 border-t border-[#bfc9c3]/30 pt-3 text-base font-bold text-[#064e3b] sm:text-lg">
          {formatRupiah(item.pricePerDay)}
          <span className="text-xs font-normal text-[#707974]">/hari</span>
        </p>
      </div>
    </div>
  );
}

// Skeleton Card
function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#bfc9c3]/40 bg-white shadow-sm">
      <div className="aspect-square bg-[#edeeef] animate-pulse" />
      <div className="flex flex-col gap-2 p-3 sm:p-4">
        <div className="h-3.5 w-full rounded bg-[#edeeef] animate-pulse mt-1" />
        <div className="h-4 w-24 rounded bg-[#edeeef] animate-pulse mt-4" />
      </div>
    </div>
  );
}

export default function SewaSectionClient() {
  const [isMobile, setIsMobile] = useState(true);
  const parentRef = useRef<HTMLDivElement>(null);

  // TanStack Query — real-time, no cache
  const { data, isPending } = useQuery({
    queryKey: ["storefront-rentals"],
    queryFn: () => fetchRentalItemsClient(4),
  });

  const rentalItems: ApiRentalItem[] = Array.isArray(data) ? data : [];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const rowVirtualizer = useVirtualizer({
    horizontal: true,
    count: rentalItems.length,
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

  if (rentalItems.length === 0) {
    return (
      <div className="mt-5 w-full rounded-2xl border border-dashed border-[#bfc9c3] bg-white px-6 py-10 text-center">
        <p className="text-sm font-semibold text-[#404944]">Item sewa tidak tersedia saat ini</p>
        <Link
          href="/sewa"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#bfc9c3] px-4 py-1.5 text-xs font-semibold text-[#404944] transition-colors hover:border-[#064e3b] hover:text-[#064e3b]"
        >
          Lihat Halaman Sewa
        </Link>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div
        ref={parentRef}
        className="mt-5 -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide relative"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div style={{ width: `${rowVirtualizer.getTotalSize()}px`, height: "100%", position: "relative", display: "flex" }}>
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const item = rentalItems[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                style={{ position: "absolute", top: 0, left: 0, width: "160px", transform: `translateX(${virtualItem.start}px)` }}
                className="flex-shrink-0"
              >
                <RentalCard item={item} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 md:grid md:grid-cols-4 md:gap-6">
      {rentalItems.map((item) => (
        <div key={item.id}>
          <RentalCard item={item} />
        </div>
      ))}
    </div>
  );
}
