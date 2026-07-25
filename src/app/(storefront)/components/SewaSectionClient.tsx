"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ApiRentalItem } from "@/lib/rental-actions";
import { formatRupiah } from "@/lib/api";
import { emitWishlistChange } from "@/lib/cart";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

async function fetchRentalItemsClient(limit = 12): Promise<ApiRentalItem[]> {
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

function RentalCard({
  item,
  isFav,
  onToggleFav,
}: {
  item: ApiRentalItem;
  isFav: boolean;
  onToggleFav: () => void;
}) {
  if (!item) return null;
  return (
    <div className="group relative flex h-full w-[200px] sm:w-[220px] flex-shrink-0 flex-col justify-between rounded-[28px] sm:rounded-[32px] bg-white p-4 sm:p-5 shadow-xs hover:shadow-xl transition-all duration-300 border border-black/5">
      {/* Badge */}
      <div className="absolute top-4 right-4 z-10 rounded-full bg-black px-2.5 py-1 text-[11px] font-bold text-white shadow-xs">
        Sewa
      </div>

      <Link href={`/sewa/${item.slug}`} className="relative aspect-square w-full overflow-hidden rounded-2xl flex items-center justify-center p-2">
        {item.images && item.images[0] ? (
          <Image
            src={item.images[0]}
            alt={item.name}
            fill
            sizes="220px"
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-300">
            <svg className="h-10 w-10 fill-current" viewBox="0 0 24 24">
              <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z" />
            </svg>
          </div>
        )}
      </Link>

      <div className="mt-3 flex flex-col items-center text-center">
        <Link href={`/sewa/${item.slug}`} className="line-clamp-1 font-bold text-base sm:text-lg text-black hover:underline">
          {item.name}
        </Link>
        <div className="mt-1 font-extrabold text-lg sm:text-xl text-black">
          {formatRupiah(item.pricePerDay)}<span className="text-xs font-semibold text-neutral-500">/hari</span>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFav();
          }}
          aria-label="Favoritkan item sewa"
          className={`w-11 h-11 rounded-full flex items-center justify-center shadow-xs transition-all duration-200 cursor-pointer ${
            isFav
              ? "bg-black text-white hover:scale-105 shadow-black/20"
              : "bg-white text-black border border-neutral-200/80 hover:bg-neutral-100 hover:scale-105"
          }`}
        >
          <HeartIcon isFav={isFav} />
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex h-full w-[200px] sm:w-[220px] flex-shrink-0 flex-col justify-between rounded-[28px] sm:rounded-[32px] bg-white p-4 sm:p-5 shadow-xs border border-black/5 animate-pulse">
      <div className="aspect-square w-full rounded-2xl bg-neutral-100" />
      <div className="mt-4 space-y-2 flex flex-col items-center">
        <div className="h-4 w-3/4 rounded-full bg-neutral-100" />
        <div className="h-5 w-1/2 rounded-full bg-neutral-100" />
      </div>
      <div className="mt-4 flex justify-center">
        <div className="w-11 h-11 rounded-full bg-neutral-100" />
      </div>
    </div>
  );
}

export default function SewaSectionClient() {
  const [favMap, setFavMap] = useState<Record<string, boolean>>({});

  const { data, isPending } = useQuery({
    queryKey: ["storefront-rentals"],
    queryFn: () => fetchRentalItemsClient(12),
  });

  const rentalItems: ApiRentalItem[] = Array.isArray(data) ? data : [];

  function toggleFav(id: string) {
    setFavMap((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      emitWishlistChange();
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

  if (rentalItems.length === 0) return null;

  return (
    <div className="mt-5 overflow-x-auto pb-4 scrollbar-hide pt-1">
      <div className="flex gap-4 sm:gap-6">
        {rentalItems.map((item, idx) => (
          <RentalCard
            key={item.id}
            item={item}
            isFav={Boolean(favMap[item.id] ?? (idx === 1))}
            onToggleFav={() => toggleFav(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
