"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import DashboardSidebar from "@/app/dashboard-admin/DashboardSidebar";
import PromoEditor from "./PromoEditor";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

function Skeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-[#e1e3e4] bg-white shadow-sm overflow-hidden">
          <div className="aspect-[4/3] bg-[#edeeef] animate-pulse" />
          <div className="h-12 bg-[#f8f9fa] animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default function AdminPromoPage() {
  const {
    data: promos = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin", "promos"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/settings/promo_cards`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
      `}</style>

      <DashboardSidebar />

      <div className="lg:ml-64 min-h-screen flex flex-col pb-24 lg:pb-0">
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#e1e3e4] bg-white/90 px-6 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <Link href="/dashboard-admin/orders" className="text-[#707974] hover:text-[#003527] transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <span className="material-symbols-outlined text-[#003527]">local_offer</span>
            <h1 className="text-[#003527] font-bold text-lg">Editor Promo Spesial</h1>
            {isLoading && (
              <span className="text-[10px] text-[#707974] animate-pulse ml-1">memuat...</span>
            )}
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-sm text-[#707974] hover:text-[#003527] transition-colors"
          >
            <span className="material-symbols-outlined text-base">open_in_new</span>
            Preview Halaman Utama
          </Link>
        </header>

        <main className="mx-auto w-full max-w-5xl px-6 py-10">
          {isLoading ? (
            <Skeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-outlined text-6xl text-[#bfc9c3] mb-4">error</span>
              <p className="font-semibold text-[#404944]">Gagal memuat promo</p>
              <p className="mt-1 text-sm text-[#707974]">Periksa koneksi backend</p>
            </div>
          ) : (
            <PromoEditor promos={promos} />
          )}
        </main>
      </div>
    </div>
  );
}
