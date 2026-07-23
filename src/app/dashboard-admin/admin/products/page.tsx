"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import ProductsTable from "./ProductsTable";
import type { ApiProduct } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

function StatsCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
 return (
  <div className="rounded-xl border border-[#e1e3e4] bg-white p-4 shadow-sm">
   <div className={`flex items-center gap-2 ${color}`}>
    <span className="material-symbols-outlined text-xl">{icon}</span>
    <span className="text-2xl font-black">{value}</span>
   </div>
   <p className="mt-1 text-xs text-[#707974]">{label}</p>
  </div>
 );
}

function TableSkeleton() {
 return (
  <div className="divide-y divide-[#f3f4f5]">
   {[1, 2, 3, 4, 5].map((i) => (
    <div key={i} className="flex items-center gap-4 px-6 py-4">
     <div className="h-12 w-12 rounded-lg bg-[#e1e3e4] animate-pulse shrink-0" />
     <div className="flex-1 space-y-2">
      <div className="h-4 w-48 rounded bg-[#e1e3e4] animate-pulse" />
      <div className="h-3 w-24 rounded bg-[#e1e3e4] animate-pulse" />
     </div>
     <div className="h-4 w-20 rounded bg-[#e1e3e4] animate-pulse" />
     <div className="h-6 w-12 rounded-full bg-[#e1e3e4] animate-pulse" />
     <div className="h-6 w-14 rounded-full bg-[#e1e3e4] animate-pulse" />
     <div className="flex gap-1">
      {[1, 2, 3].map((j) => (
       <div key={j} className="h-8 w-8 rounded-lg bg-[#e1e3e4] animate-pulse" />
      ))}
     </div>
    </div>
   ))}
  </div>
 );
}

export default function AdminProductsPage() {
 const { data: products = [], isLoading: loading, isFetching: isRefreshing } = useQuery<ApiProduct[]>({
  queryKey: ["admin", "products"],
  queryFn: async () => {
   const res = await fetch(`${API_URL}/products?limit=100`);
   if (!res.ok) throw new Error("Gagal mengambil data produk");
   const json = await res.json();
   return json.data ?? [];
  },
 });

 const stats = [
  { label: "Total Produk", value: products.length, icon: "inventory_2", color: "text-[#003527]" },
  { label: "Aktif", value: products.filter((p) => p.isActive).length, icon: "check_circle", color: "text-green-600" },
  { label: "Stok Habis", value: products.filter((p) => p.stock === 0).length, icon: "warning", color: "text-[#ba1a1a]" },
  { label: "Kategori", value: new Set(products.map((p) => p.categoryId)).size, icon: "category", color: "text-[#575e70]" },
 ];

 return (
  <div className="min-h-screen bg-[#f8f9fa]">
   <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
    .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
   `}</style>


   <div className="lg:ml-64 min-h-screen flex flex-col pb-24 lg:pb-0">
    {/* Top bar */}
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#e1e3e4] bg-white/90 px-6 shadow-sm backdrop-blur">
     <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-[#003527]">inventory_2</span>
      <h1 className="text-[#003527] font-bold text-lg">Manajemen Produk</h1>
      {isRefreshing && (
       <span className="text-[10px] text-[#707974] animate-pulse ml-1">memperbarui...</span>
      )}
     </div>
     <Link
      href="/dashboard-admin/admin/products/new"
      prefetch={false}
      className="flex items-center gap-2 rounded-lg bg-[#064e3b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#043b2d]"
     >
      <span className="material-symbols-outlined text-base">add</span>
      Tambah Produk
     </Link>
    </header>

    <main className="p-6">
     {/* Stats */}
     <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {loading
       ? [1, 2, 3, 4].map((i) => (
         <div key={i} className="rounded-xl border border-[#e1e3e4] bg-white p-4 shadow-sm">
          <div className="h-8 w-16 rounded bg-[#e1e3e4] animate-pulse mb-2" />
          <div className="h-3 w-24 rounded bg-[#e1e3e4] animate-pulse" />
         </div>
        ))
       : stats.map((s) => <StatsCard key={s.label} {...s} />)
      }
     </div>

     {/* Tabel */}
     <div className="rounded-xl border border-[#e1e3e4] bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#e1e3e4] px-6 py-4">
       <h2 className="font-semibold text-[#191c1d]">
        {loading ? (
         <span className="inline-block h-5 w-40 rounded bg-[#e1e3e4] animate-pulse" />
        ) : (
         `Semua Produk (${products.length})`
        )}
       </h2>
      </div>

      {loading ? (
       <TableSkeleton />
      ) : products.length === 0 ? (
       <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="material-symbols-outlined text-6xl text-[#bfc9c3] mb-4">inventory_2</span>
        <p className="font-semibold text-[#404944]">Belum ada produk</p>
        <p className="mt-1 text-sm text-[#707974]">Klik &quot;Tambah Produk&quot; untuk mulai menambahkan</p>
        <Link href="/dashboard-admin/admin/products/new" prefetch={false}
         className="mt-4 rounded-lg bg-[#064e3b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#043b2d] transition-colors">
         + Tambah Produk Pertama
        </Link>
       </div>
      ) : (
       <ProductsTable products={products} />
      )}
     </div>
    </main>
   </div>
  </div>
 );
}
