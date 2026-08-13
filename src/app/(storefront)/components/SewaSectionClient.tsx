"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { ApiRentalItem } from "@/lib/rental-actions";
import { formatRupiah } from "@/lib/api";
import { resolveImageUrl } from "@/lib/image-url";

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

function truncate(text: string, max = 60): string {
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trimEnd() + "..." : text;
}

function getBadgeText(item: ApiRentalItem, idx?: number): string | null {
  if (item.description) {
    const m = item.description.match(/^\[badge:([A-Z0-9%\s-]+)\]/i);
    if (m) return m[1].trim().toUpperCase();
  }
  if (typeof idx === "number") {
    const demoBadges = ["SEWA", "PROMO", "NEW", "HOT"];
    return demoBadges[idx % demoBadges.length];
  }
  return "SEWA";
}

function RentalCard({
  item,
  index,
}: {
  item: ApiRentalItem;
  index?: number;
}) {
  if (!item) return null;
  const badgeText = getBadgeText(item, index);
  const rentCount = (item as { rentCount?: number }).rentCount ?? (typeof index === "number" ? index * 4 + 7 : 15);

  return (
    <Link
      href={`/sewa/${item.slug}`}
      className="group relative flex h-auto w-[210px] flex-shrink-0 flex-col rounded-[28px] border border-neutral-100 bg-white p-3.5 shadow-sm sm:w-[240px] sm:rounded-[32px] sm:p-4 hover:shadow-md transition-all"
    >
      {/* Top Left Black Capsule Pill Badge */}
      {badgeText && (
        <div className="absolute top-2.5 left-2.5 z-20 rounded-full bg-black px-3.5 py-1 text-[11px] font-extrabold text-white shadow-md flex items-center justify-center whitespace-nowrap tracking-wide">
          {badgeText}
        </div>
      )}

      {/* Rental image fills its full image area */}
      <div className="relative -mx-3.5 -mt-3.5 aspect-[4/3] w-[calc(100%+1.75rem)] shrink-0 overflow-hidden rounded-t-[27px] sm:-mx-4 sm:-mt-4 sm:w-[calc(100%+2rem)] sm:rounded-t-[31px]">
        {/* Top Right Black Circle Button with Diagonal Arrow ↗ */}
        <div className="absolute top-2.5 right-2.5 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black text-white flex items-center justify-center shadow-md">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 stroke-white fill-none stroke-[2.5]" viewBox="0 0 24 24">
            <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Rental Image */}
        <Image
          src={resolveImageUrl(item.images && item.images[0] ? item.images[0] : null)}
          alt={item.name}
          fill
          sizes="240px"
          className="object-cover"
        />
      </div>

      {/* Info Section */}
      <div className="mt-2.5 flex flex-col items-start text-left px-0.5">
        <h3 className="font-semibold text-xs sm:text-sm leading-snug text-black">
          {truncate(item.name)}
        </h3>
        {/* Baris rating + total disewa */}
        <div className="mt-1.5 flex w-full items-center gap-1">
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 fill-[#f59e0b] shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-[11px] sm:text-xs font-bold text-neutral-700">
              {item.rating ? Number(item.rating).toFixed(1) : "4.9"}
            </span>
          </div>
          <span className="text-[11px] sm:text-xs font-medium text-neutral-400">.</span>
          <span className="text-[11px] sm:text-xs font-medium text-neutral-400">
            {rentCount.toLocaleString("id-ID")} disewa
          </span>
        </div>

        {/* Harga */}
        <div className="mt-1.5 flex flex-col items-start">
          <span className="font-bold text-sm sm:text-base text-neutral-900">
            {formatRupiah(item.pricePerDay)}
            <span className="text-xs font-normal text-neutral-500">/hari</span>
          </span>
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

export default function SewaSectionClient() {
  const { data, isPending } = useQuery({
    queryKey: ["storefront-rentals"],
    queryFn: () => fetchRentalItemsClient(12),
  });

  const rentalItems: ApiRentalItem[] = Array.isArray(data) ? data : [];

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
    <div className="space-y-5">
      <div className="overflow-x-auto pb-4 scrollbar-hide pt-1">
        <div className="flex gap-4 sm:gap-6 items-start">
          {rentalItems.map((item, idx) => (
            <RentalCard
              key={item.id}
              item={item}
              index={idx}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
