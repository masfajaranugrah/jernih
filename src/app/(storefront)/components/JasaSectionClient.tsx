"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { ApiService } from "@/lib/service-actions";
import { formatRupiah } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

async function fetchServicesClient(limit = 12): Promise<ApiService[]> {
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
      className="group flex h-full w-[170px] flex-shrink-0 flex-col overflow-hidden rounded-[8px] bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.08)] transition-all duration-200 hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.12)] sm:w-[200px]"
    >
      <div className="relative aspect-square overflow-hidden bg-[#f5f5f5]">
        {service.images && service.images[0] ? (
          <Image
            src={service.images[0]}
            alt={service.name}
            fill
            sizes="200px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg className="h-10 w-10 fill-[#bfc9c3]" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 left-0 rounded-r-[4px] bg-[#1e3a8a] px-1.5 py-[3px] text-[10px] font-bold leading-none text-white">
          Jasa
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-[3px] p-2.5 sm:p-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1e3a8a]">
          {service.category?.name ?? "Layanan Profesional"}
        </p>
        <h3 className="line-clamp-2 text-[13px] font-normal leading-[18px] text-[#191c1d]">
          {service.name}
        </h3>
        {service.rating > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#6b7280]">
            <span className="flex items-center gap-[2px]">
              <svg className="h-3 w-3 fill-[#f59e0b]" viewBox="0 0 24 24">
                <path d="m12 2 2.9 6 6.6.9-4.8 4.7 1.1 6.6L12 17.1l-5.8 3.1 1.1-6.6-4.8-4.7 6.6-.9L12 2Z" />
              </svg>
              {service.rating}
            </span>
          </div>
        )}
        <div className="mt-auto pt-1">
          <span className="text-sm font-bold text-[#191c1d] leading-none">
            Mulai {formatRupiah(service.priceFrom)}
          </span>
          <span className="text-[10px] font-normal text-[#6b7280]">/{service.unit}</span>
        </div>
        {service.mitra?.city && (
          <div className="pt-[2px]">
            <span className="text-[10px] font-normal text-[#6b7280]">{service.mitra.city}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="flex h-full w-[170px] flex-shrink-0 flex-col overflow-hidden rounded-[8px] bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.08)] sm:w-[200px]">
      <div className="aspect-square bg-[#f5f5f5] animate-pulse" />
      <div className="flex flex-col gap-2 p-2.5 sm:p-3">
        <div className="h-2.5 w-16 rounded bg-[#f5f5f5] animate-pulse" />
        <div className="h-3 w-3/4 rounded bg-[#f5f5f5] animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-[#f5f5f5] animate-pulse" />
        <div className="h-3.5 w-20 rounded bg-[#f5f5f5] animate-pulse" />
      </div>
    </div>
  );
}

export default function JasaSectionClient() {
  const { data, isPending } = useQuery({
    queryKey: ["storefront-services"],
    queryFn: () => fetchServicesClient(12),
  });

  const services: ApiService[] = Array.isArray(data) ? data : [];

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

  return (
    <div className="mt-5 overflow-x-auto pb-2 scrollbar-hide md:max-w-[1260px]">
      <div className="flex gap-3">
        {services.map((svc) => (
          <ServiceCard key={svc.id} service={svc} />
        ))}
      </div>
    </div>
  );
}
