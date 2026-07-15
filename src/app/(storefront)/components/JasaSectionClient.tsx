"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useQuery } from "@tanstack/react-query";
import type { ApiService } from "@/lib/service-actions";
import { formatRupiah } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

async function fetchServicesClient(limit = 4): Promise<ApiService[]> {
  try {
    const res = await fetch(`${API_URL}/services?limit=${limit}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.data)) return json.data;
    return [];
  } catch {
    return [];
  }
}

function ServiceCard({ service }: { service: ApiService }) {
  if (!service) return null;
  return (
    <Link
      href={`/jasa/${service.slug}`}
      className="group overflow-hidden rounded-2xl border border-[#bfc9c3]/40 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg block h-full"
    >
      <div className="relative aspect-square overflow-hidden bg-[#edeeef]">
        {service.images && service.images[0] ? (
          <Image
            src={service.images[0]}
            alt={service.name}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg className="h-12 w-12 fill-[#bfc9c3]" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 left-2 rounded bg-[#1e3a8a] px-2 py-0.5 text-[10px] font-black uppercase text-white">
          Jasa
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#1e3a8a]">
          {service.category?.name ?? "Layanan Profesional"}
        </p>
        <h3 className="mt-2 line-clamp-2 text-sm font-medium text-[#191c1d] sm:text-base">
          {service.name}
        </h3>
        <p className="mt-4 border-t border-[#bfc9c3]/30 pt-3 text-base font-bold text-[#1e3a8a] sm:text-lg">
          Mulai {formatRupiah(service.priceFrom)}
          <span className="text-xs font-normal text-[#707974]">/{service.unit}</span>
        </p>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#bfc9c3]/40 bg-white shadow-sm">
      <div className="aspect-square animate-pulse bg-[#edeeef]" />
      <div className="flex flex-col gap-2 p-3 sm:p-4">
        <div className="h-2.5 w-16 animate-pulse rounded bg-[#edeeef]" />
        <div className="h-3.5 w-full animate-pulse rounded bg-[#edeeef]" />
        <div className="mt-4 h-4 w-24 animate-pulse rounded bg-[#edeeef]" />
      </div>
    </div>
  );
}

export default function JasaSectionClient() {
  const [isMobile, setIsMobile] = useState(true);
  const parentRef = useRef<HTMLDivElement>(null);

  // TanStack Query v5 — gunakan isPending, bukan isLoading
  const { data, isPending } = useQuery({
    queryKey: ["storefront-services"],
    queryFn: () => fetchServicesClient(4),
  });

  // Pastikan selalu array, tidak pernah undefined
  const services: ApiService[] = Array.isArray(data) ? data : [];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const rowVirtualizer = useVirtualizer({
    horizontal: true,
    count: services.length,
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

  if (services.length === 0) {
    return (
      <div className="mt-5 w-full rounded-2xl border border-dashed border-[#bfc9c3] bg-white px-6 py-10 text-center">
        <p className="text-sm font-semibold text-[#404944]">Jasa tidak tersedia saat ini</p>
        <Link
          href="/jasa"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#bfc9c3] px-4 py-1.5 text-xs font-semibold text-[#404944] transition-colors hover:border-[#1e3a8a] hover:text-[#1e3a8a]"
        >
          Lihat Halaman Jasa
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
        <div
          style={{
            width: `${rowVirtualizer.getTotalSize()}px`,
            height: "100%",
            position: "relative",
            display: "flex",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const svc = services[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "160px",
                  transform: `translateX(${virtualItem.start}px)`,
                }}
                className="flex-shrink-0"
              >
                <ServiceCard service={svc} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 md:grid md:grid-cols-4 md:gap-6">
      {services.map((svc) => (
        <div key={svc.id}>
          <ServiceCard service={svc} />
        </div>
      ))}
    </div>
  );
}
