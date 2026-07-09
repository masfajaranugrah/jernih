"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { ApiService } from "@/lib/service-actions";
import { formatRupiah } from "@/lib/api";

function ServiceCard({ service }: { service: ApiService }) {
  return (
    <Link
      href={`/jasa/${service.slug}`}
      className="group overflow-hidden rounded-2xl border border-[#bfc9c3]/40 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg block h-full"
    >
      <div className="relative aspect-square overflow-hidden bg-[#edeeef]">
        {service.images[0] ? (
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
        <div className="absolute top-2 left-2 rounded bg-[#064e3b] px-2 py-0.5 text-[10px] font-black uppercase text-white">
          Jasa
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#064e3b]">
          {service.category?.name ?? "Layanan Profesional"}
        </p>
        <h3 className="mt-2 line-clamp-2 text-sm font-medium text-[#191c1d] sm:text-base">
          {service.name}
        </h3>
        <p className="mt-4 border-t border-[#bfc9c3]/30 pt-3 text-base font-bold text-[#064e3b] sm:text-lg">
          Mulai {formatRupiah(service.priceFrom)}
          <span className="text-xs font-normal text-[#707974]">/{service.unit}</span>
        </p>
      </div>
    </Link>
  );
}

export default function JasaSectionClient({ services }: { services: ApiService[] }) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const rowVirtualizer = useVirtualizer({
    horizontal: true,
    count: services.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 172, // 160px card width + 12px gap
    overscan: 2,
  });

  if (!mounted) {
    return (
      <div className="mt-5 -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
        {services.map((svc) => (
          <div key={svc.id} className="w-[160px] flex-shrink-0 snap-start md:w-auto">
            <ServiceCard service={svc} />
          </div>
        ))}
      </div>
    );
  }

  if (isMobile) {
    return (
      <div
        ref={parentRef}
        className="mt-5 -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide relative"
        style={{
          WebkitOverflowScrolling: "touch",
        }}
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
