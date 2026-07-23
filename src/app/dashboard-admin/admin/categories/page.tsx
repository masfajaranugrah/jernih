"use client";

import { useQuery } from "@tanstack/react-query";
import CategoriesAdminClient from "./CategoriesAdminClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

function Skeleton() {
 return (
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
   <div className="rounded-2xl border border-[#bfc9c3]/50 bg-white p-6 shadow-sm">
    <div className="mb-4 h-6 w-32 rounded bg-[#e1e3e4] animate-pulse" />
    <div className="space-y-4">
     <div className="h-16 rounded-lg bg-[#e1e3e4] animate-pulse" />
     <div className="h-16 rounded-lg bg-[#e1e3e4] animate-pulse" />
     <div className="h-10 rounded-lg bg-[#e1e3e4] animate-pulse" />
    </div>
   </div>
   <div className="lg:col-span-2 rounded-2xl border border-[#bfc9c3]/50 bg-white p-6 shadow-sm">
    <div className="mb-4 h-6 w-48 rounded bg-[#e1e3e4] animate-pulse" />
    <div className="space-y-3">
     {[1, 2, 3, 4].map((i) => (
      <div key={i} className="h-12 rounded-lg bg-[#e1e3e4] animate-pulse" />
     ))}
    </div>
   </div>
  </div>
 );
}

export default function AdminCategoriesPage() {
 const {
  data: categories = [],
  isLoading,
  error,
 } = useQuery({
  queryKey: ["admin", "categories"],
  queryFn: async () => {
   const res = await fetch(`${API_URL}/categories`);
   if (!res.ok) throw new Error("Gagal mengambil kategori");
   return res.json() as Promise<import("@/lib/category-actions").ApiCategory[]>;
  },
 });

 return (
  <div className="min-h-screen bg-[#f8f9fa]">
   <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
    .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
   `}</style>


   <div className="lg:ml-64 min-h-screen flex flex-col pb-24 lg:pb-0">
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#e1e3e4] bg-white/90 px-6 shadow-sm backdrop-blur">
     <div className="flex items-center gap-3">
      <span className="material-symbols-outlined text-[#003527]">category</span>
      <h1 className="text-[#003527] font-bold text-lg">Manajemen Kategori</h1>
      {isLoading && (
       <span className="text-[10px] text-[#707974] animate-pulse ml-1">memuat...</span>
      )}
     </div>
    </header>

    <main className="p-6">
     {isLoading ? (
      <Skeleton />
     ) : error ? (
      <div className="flex flex-col items-center justify-center py-20 text-center">
       <span className="material-symbols-outlined text-6xl text-[#bfc9c3] mb-4">error</span>
       <p className="font-semibold text-[#404944]">Gagal memuat kategori</p>
       <p className="mt-1 text-sm text-[#707974]">Periksa koneksi backend</p>
      </div>
     ) : (
      <CategoriesAdminClient categories={categories} />
     )}
    </main>
   </div>
  </div>
 );
}
