"use client";

import Link from "next/link";
import { useState } from "react";
import { formatRupiah, type ApiProduct } from "@/lib/api";

function ProductCard({ product }: { product: ApiProduct }) {
  const badgeMatch = product.description?.match(/^\[badge:([A-Z0-9]+)\]/);
  const badge = badgeMatch ? badgeMatch[1] : product.oldPrice ? "SALE" : null;
  const sellerName = "Jernih Creative Official";
  const colors: Record<string, string> = {
    SALE: "bg-[#ba1a1a]",
    NEW: "bg-[#1e3a8a]",
    HOT: "bg-orange-500",
    DISKON: "bg-[#1e3a8a]",
    TERBATAS: "bg-[#7c3aed]",
  };

  return (
    <Link
      href={`/produk/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.04)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[#edeeef]">
        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#bfc9c3]">
            <span className="text-5xl">📷</span>
          </div>
        )}
        {badge && (
          <div className={`absolute top-3 left-3 rounded px-2 py-1 text-[10px] font-black uppercase tracking-tight text-white ${colors[badge] ?? "bg-[#ba1a1a]"}`}>
            {badge}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-[#191c1d] sm:text-base">
          {product.name}
        </h2>
        <div className="mt-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-[18px] text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
          <span className="text-xs font-semibold text-[#575e70]">5.0</span>
        </div>
        <div className="mt-1">
          {product.oldPrice && (
            <p className="text-[10px] text-[#707974] line-through">{formatRupiah(product.oldPrice)}</p>
          )}
          <p className="text-xs font-bold leading-tight text-[#191c1d]">{formatRupiah(product.price)}</p>
        </div>
        <div className="mt-auto border-t border-[#bfc9c3]/30 pt-3">
          <p className="line-clamp-1 text-[11px] font-semibold text-[#1e3a8a] sm:text-xs">
            {sellerName}
          </p>
        </div>
      </div>
    </Link>
  );
}

interface FilterState {
  category: string;
  priceMin: string;
  priceMax: string;
  sortBy: string;
}

const DEFAULT_FILTER: FilterState = {
  category: "all",
  priceMin: "",
  priceMax: "",
  sortBy: "terbaru",
};

export default function ProdukPageClient({
  products,
  categories,
  resolvedSearch = "",
}: {
  products: ApiProduct[];
  categories: string[];
  resolvedSearch?: string;
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [draftFilter, setDraftFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [visibleCount, setVisibleCount] = useState(12);

  // ── Apply filter ────────────────────────────────────────────────────────────
  const filteredAll = products
    .filter((p) => {
      if (activeFilter.category !== "all" && p.category?.name !== activeFilter.category) return false;
      const price = parseFloat(p.price);
      const min = activeFilter.priceMin ? Number(activeFilter.priceMin) : null;
      const max = activeFilter.priceMax ? Number(activeFilter.priceMax) : null;
      if (min !== null && price < min) return false;
      if (max !== null && price > max) return false;
      return true;
    })
    .sort((a, b) => {
      if (activeFilter.sortBy === "harga_asc") return parseFloat(a.price) - parseFloat(b.price);
      if (activeFilter.sortBy === "harga_desc") return parseFloat(b.price) - parseFloat(a.price);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const filtered = filteredAll.slice(0, visibleCount);

  const activeCount =
    (activeFilter.category !== "all" ? 1 : 0) +
    (activeFilter.priceMin || activeFilter.priceMax ? 1 : 0);

  function openFilter() {
    setDraftFilter(activeFilter);
    setFilterOpen(true);
  }

  function applyFilter() {
    setActiveFilter(draftFilter);
    setVisibleCount(12);
    setFilterOpen(false);
  }

  function resetDraft() {
    setDraftFilter(DEFAULT_FILTER);
  }

  // ── Filter Panel (shared antara sidebar & drawer) ────────────────────────
  const FilterPanel = (
    <div className="space-y-6">
      {/* Kategori */}
      <section>
        <h3 className="font-semibold text-xs uppercase tracking-widest text-[#191c1d] mb-3">
          Kategori
        </h3>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setDraftFilter((p) => ({ ...p, category: "all" }))}
              className={`text-sm block transition-colors ${
                draftFilter.category === "all"
                  ? "text-[#1e3a8a] font-semibold"
                  : "text-[#707974] hover:text-[#1e3a8a]"
              }`}
            >
              Semua Produk
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat}>
              <button
                onClick={() => setDraftFilter((p) => ({ ...p, category: cat }))}
                className={`text-sm block transition-colors ${
                  draftFilter.category === cat
                    ? "text-[#1e3a8a] font-semibold"
                    : "text-[#707974] hover:text-[#1e3a8a]"
                }`}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="border-t border-[#e1e3e4]" />

      {/* Rentang Harga — input manual */}
      <section>
        <h3 className="font-semibold text-xs uppercase tracking-widest text-[#191c1d] mb-3">
          Rentang Harga
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-[#707974] mb-1">Harga Minimum (Rp)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#707974]">Rp</span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={draftFilter.priceMin}
                onChange={(e) => setDraftFilter((p) => ({ ...p, priceMin: e.target.value }))}
                className="w-full pl-8 pr-3 py-2 text-sm border border-[#bfc9c3] rounded-lg bg-[#f8f9fa] outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]/20"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#707974] mb-1">Harga Maksimum (Rp)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#707974]">Rp</span>
              <input
                type="number"
                min="0"
                placeholder="Tidak terbatas"
                value={draftFilter.priceMax}
                onChange={(e) => setDraftFilter((p) => ({ ...p, priceMax: e.target.value }))}
                className="w-full pl-8 pr-3 py-2 text-sm border border-[#bfc9c3] rounded-lg bg-[#f8f9fa] outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]/20"
              />
            </div>
          </div>
          {(draftFilter.priceMin || draftFilter.priceMax) && (
            <p className="text-[11px] text-[#191c1d] font-medium">
              {draftFilter.priceMin ? formatRupiah(Number(draftFilter.priceMin)) : "0"}
              {" – "}
              {draftFilter.priceMax ? formatRupiah(Number(draftFilter.priceMax)) : "∞"}
            </p>
          )}
        </div>
      </section>

      <div className="border-t border-[#e1e3e4]" />

      {/* Penjual — statis */}
      <section>
        <h3 className="font-semibold text-xs uppercase tracking-widest text-[#191c1d] mb-3">
          Penjual
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#1e3a8a] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">J</span>
          </div>
          <span className="text-sm font-semibold text-[#1e3a8a]">Jernih Creative Official</span>
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0;24,300,1,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 300,'GRAD' 0,'opsz' 24; vertical-align:middle; }
      `}</style>

      <div className="mx-auto flex max-w-[1680px] flex-col gap-6 px-4 pt-8 pb-20 md:flex-row md:gap-10 md:px-8 lg:px-12 xl:gap-14 2xl:px-16">

        {/* ── Sidebar desktop ── */}
        <aside className="hidden w-64 flex-shrink-0 md:block xl:w-72">
          <div className="sticky top-24 rounded-2xl border border-[#e1e3e4] bg-white p-5 shadow-sm xl:p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-sm text-[#191c1d]">Filter</h3>
              {activeCount > 0 && (
                <button
                  onClick={() => { setDraftFilter(DEFAULT_FILTER); setActiveFilter(DEFAULT_FILTER); }}
                  className="text-xs text-[#ba1a1a] font-semibold hover:underline"
                >
                  Reset
                </button>
              )}
            </div>
            {FilterPanel}
            <button
              onClick={() => setActiveFilter({ ...draftFilter })}
              className="mt-6 w-full rounded-xl bg-[#1e3a8a] py-2.5 text-sm font-semibold text-white hover:bg-[#1e40af] transition-colors"
            >
              Terapkan Filter
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-grow min-w-0">

          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-lg font-bold text-[#1e3a8a] tracking-tight">
                Koleksi Produk Pilihan
              </h1>
              <p className="text-xs text-[#707974] mt-0.5">
                {filteredAll.length} produk tersedia
                {activeCount > 0 && (
                  <span className="ml-2 text-[#1e3a8a] font-semibold">
                    · {activeCount} filter aktif
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={activeFilter.sortBy}
                onChange={(e) => { setActiveFilter((p) => ({ ...p, sortBy: e.target.value })); setVisibleCount(12); }}
                className="appearance-none h-10 box-border text-xs font-semibold text-[#1e3a8a] bg-white border border-[#e1e3e4] rounded-lg px-3 py-0 leading-none outline-none cursor-pointer"
              >
                <option value="terbaru">Terbaru</option>
                <option value="harga_asc">Harga ↑</option>
                <option value="harga_desc">Harga ↓</option>
              </select>

              {/* Tombol Filter — mobile only */}
              <button
                onClick={openFilter}
                className="md:hidden relative flex h-10 box-border items-center gap-1.5 rounded-lg border border-[#e1e3e4] bg-white px-3 text-xs font-semibold text-[#191c1d] hover:border-[#1e3a8a] transition-colors"
              >
                <span className="material-symbols-outlined text-base">tune</span>
                Filter
                {activeCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#1e3a8a] text-white text-[9px] flex items-center justify-center font-bold">
                    {activeCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="mb-7 border-b border-[#bfc9c3]" />

          {resolvedSearch && (
            <div className="mb-6 bg-white border border-[#bfc9c3]/30 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <p className="text-sm text-[#404944]">
                Hasil pencarian untuk: <strong className="text-[#1e3a8a]">&quot;{resolvedSearch}&quot;</strong>
              </p>
              <Link href="/produk" className="text-xs font-semibold text-[#ba1a1a] hover:underline">
                Hapus Pencarian
              </Link>
            </div>
          )}

          {/* Product grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-6xl mb-4">🔍</span>
              <p className="font-semibold text-[#404944] text-lg">Produk tidak ditemukan</p>
              <p className="mt-1 text-sm text-[#707974]">Coba ubah atau reset filter</p>
              <button
                onClick={() => setActiveFilter(DEFAULT_FILTER)}
                className="mt-4 rounded-xl bg-[#1e3a8a] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5 xl:gap-4">
                {filtered.map((product: ApiProduct) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-8 text-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 30)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#bfc9c3] px-6 py-2.5 text-xs font-semibold text-[#404944] transition-colors hover:border-[#1e3a8a] hover:text-[#1e3a8a]"
                >
                  Lihat Lainnya
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </main>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      {filterOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setFilterOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl md:hidden max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#e1e3e4]" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#e1e3e4]">
              <h2 className="font-bold text-base text-[#191c1d]">Filter Produk</h2>
              <button onClick={() => setFilterOpen(false)} className="text-[#707974]">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-5">
              {FilterPanel}
            </div>
            <div className="px-5 py-4 border-t border-[#e1e3e4] flex gap-3">
              <button
                onClick={resetDraft}
                className="flex-1 rounded-xl border border-[#bfc9c3] py-3 text-sm font-semibold text-[#707974] hover:border-[#1e3a8a] hover:text-[#1e3a8a] transition-colors"
              >
                Reset
              </button>
              <button
                onClick={applyFilter}
                className="flex-[2] rounded-xl bg-[#1e3a8a] py-3 text-sm font-semibold text-white hover:bg-[#1e40af] transition-colors"
              >
                Simpan Filter
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
