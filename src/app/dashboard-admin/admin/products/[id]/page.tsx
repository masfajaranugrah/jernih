"use client";

import { useParams, notFound } from "next/navigation";
import DashboardSidebar from "@/app/dashboard-admin/DashboardSidebar";
import EditProductForm from "../EditProductForm";
import type { ApiProduct } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

function EditSkeleton() {
  return (
    <div className="lg:ml-64 min-h-screen flex flex-col pb-24 lg:pb-0">
      <header className="sticky top-0 z-40 flex h-16 w-full items-center border-b border-[#e1e3e4] bg-white/90 px-6 shadow-sm">
        <div className="h-5 w-32 rounded-lg bg-[#e1e3e4] animate-pulse" />
      </header>
      <main className="w-full px-4 sm:px-6 lg:px-10 py-8">
        <div className="flex items-end justify-between mb-8">
          <div className="space-y-2">
            <div className="h-3 w-40 rounded bg-[#e1e3e4] animate-pulse" />
            <div className="h-7 w-48 rounded-lg bg-[#e1e3e4] animate-pulse" />
            <div className="h-3 w-64 rounded bg-[#e1e3e4] animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-20 rounded-lg bg-[#e1e3e4] animate-pulse" />
            <div className="h-10 w-32 rounded-lg bg-[#003527]/20 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-[#e1e3e4] bg-white p-6 shadow-sm space-y-4">
                <div className="h-4 w-32 rounded bg-[#e1e3e4] animate-pulse" />
                <div className="h-10 w-full rounded-lg bg-[#e1e3e4] animate-pulse" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 rounded-lg bg-[#e1e3e4] animate-pulse" />
                  <div className="h-10 rounded-lg bg-[#e1e3e4] animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-[#e1e3e4] bg-white p-6 shadow-sm space-y-4">
                <div className="h-4 w-28 rounded bg-[#e1e3e4] animate-pulse" />
                <div className="h-32 w-full rounded-xl bg-[#e1e3e4] animate-pulse" />
                <div className="h-10 w-full rounded-lg bg-[#e1e3e4] animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: product = null, isLoading: loading, isError: notFoundError } = useQuery<ApiProduct | null>({
    queryKey: ["admin", "product", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`${API_URL}/products/${id}`);
      if (!res.ok) {
        throw new Error("Produk tidak ditemukan");
      }
      return await res.json();
    },
    enabled: !!id,
    retry: false,
  });

  if (notFoundError) return notFound();

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
      `}</style>

      <DashboardSidebar />

      {loading || !product ? (
        <EditSkeleton />
      ) : (
        <div className="lg:ml-64 min-h-screen flex flex-col pb-24 lg:pb-0">
          <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#e1e3e4] bg-white/90 px-6 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#003527]">edit</span>
              <h1 className="text-[#003527] font-bold text-lg">Edit Produk</h1>
            </div>
          </header>
          <main className="w-full px-4 sm:px-6 lg:px-10 py-8">
            <EditProductForm product={product} />
          </main>
        </div>
      )}
    </div>
  );
}
