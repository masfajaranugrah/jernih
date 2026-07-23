"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { ApiService } from "@/lib/service-actions";
import { useWindowVirtualizer } from "@tanstack/react-virtual";

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

function formatRupiah(val: string | number) {
  const num = parseFloat(String(val));
  if (isNaN(num)) return "Rp 0";
  const int = Math.floor(num);
  const formatted = int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return "Rp " + formatted;
}

// ── Sub-component ServiceCard (dipakai SSR fallback & virtualizer) ──
function ServiceCard({ svc }: { svc: ApiService }) {
  return (
    <Link
      href={`/jasa/${svc.slug}`}
      className="premium-shadow bg-white rounded-xl overflow-hidden group cursor-pointer block"
    >
      <div className="relative h-48 overflow-hidden bg-[#edeeef]">
        {svc.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={svc.images[0]}
            alt={svc.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-[#bfc9c3]">design_services</span>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-[#1e3a8a] text-white font-black text-[10px] px-2 py-1 uppercase tracking-tight rounded">
          Jasa
        </div>
      </div>
      <div className="p-4 space-y-1">
        <h3 className="text-[#1e3a8a] font-semibold text-sm leading-tight group-hover:underline line-clamp-2">
          {svc.name}
        </h3>
        <p className="text-[10px] font-medium text-[#707974] uppercase tracking-widest">
          {svc.category?.name ?? "Jasa"}
        </p>
        {svc.rating > 0 && (
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-yellow-400 text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="text-[10px] font-semibold text-[#575e70]">{svc.rating.toFixed(1)}</span>
          </div>
        )}
        <div className="pt-1 border-t border-[#e1e3e4]">
          <span className="text-[10px] text-[#707974]">Mulai dari</span>
          <p className="text-xs font-bold text-[#191c1d]">
            {formatRupiah(svc.priceFrom)}
            <span className="text-[10px] font-normal text-[#707974]">/{svc.unit}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}

interface Props {
  services: ApiService[];
  categories: string[];
  resolvedSearch: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  "Kreatif": "brush",
  "Konstruksi": "construction",
  "IT & Digital": "code",
};

export default function JasaPageClient({ services, categories, resolvedSearch }: Props) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [draftFilter, setDraftFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [visibleCount, setVisibleCount] = useState(12);

  // ── SSR Hydration Guard ──
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Column Detection ──
  const [cols, setCols] = useState(2);
  useEffect(() => {
    if (!mounted) return;
    const handleResize = () => {
      setCols(window.innerWidth >= 1280 ? 4 : window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mounted]);

  const filtered = services
    .filter((s) => {
      if (activeFilter.category !== "all" && s.category?.name !== activeFilter.category) return false;
      const price = parseFloat(String(s.priceFrom));
      const min = activeFilter.priceMin ? Number(activeFilter.priceMin) : null;
      const max = activeFilter.priceMax ? Number(activeFilter.priceMax) : null;
      if (min !== null && price < min) return false;
      if (max !== null && price > max) return false;
      return true;
    })
    .sort((a, b) => {
      const pa = parseFloat(String(a.priceFrom));
      const pb = parseFloat(String(b.priceFrom));
      if (activeFilter.sortBy === "harga_asc") return pa - pb;
      if (activeFilter.sortBy === "harga_desc") return pb - pa;
      if (activeFilter.sortBy === "rating") return b.rating - a.rating;
      return 0;
    })
    .slice(0, visibleCount);

  const activeCount =
    (activeFilter.category !== "all" ? 1 : 0) +
    (activeFilter.priceMin || activeFilter.priceMax ? 1 : 0);

  // ── Chunking Rows for Virtual Grid ──
  const rows: ApiService[][] = [];
  for (let i = 0; i < filtered.length; i += cols) {
    rows.push(filtered.slice(i, i + cols));
  }

  // ── TanStack Virtualizer ──
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 340,
    scrollMargin: parentRef.current?.offsetTop ?? 0,
    overscan: 3,
  });

  function openFilter() { setDraftFilter(activeFilter); setFilterOpen(true); }
  function applyFilter() { setActiveFilter(draftFilter); setFilterOpen(false); }
  function resetDraft() { setDraftFilter(DEFAULT_FILTER); }

  const FilterPanel = (
    <div className="space-y-6">
      <section>
        <h3 className="font-semibold text-xs uppercase tracking-widest text-[#191c1d] mb-3">
          Kategori Jasa
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setDraftFilter((p) => ({ ...p, category: "all" }))}
              className={`flex items-center gap-3 w-full py-2.5 pl-3 rounded-lg text-sm font-semibold transition-all ${
                draftFilter.category === "all"
                  ? "text-[#1e3a8a] bg-[#f3f4f5] border-l-4 border-[#1e3a8a]"
                  : "text-[#707974] hover:bg-[#edeeef] border-l-4 border-transparent"
              }`}
            >
              <span className="material-symbols-outlined text-lg">category</span>
              Semua Kategori
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat}>
              <button
                onClick={() => setDraftFilter((p) => ({ ...p, category: cat }))}
                className={`flex items-center gap-3 w-full py-2.5 pl-3 rounded-lg text-sm font-semibold transition-all ${
                  draftFilter.category === cat
                    ? "text-[#1e3a8a] bg-[#f3f4f5] border-l-4 border-[#1e3a8a]"
                    : "text-[#707974] hover:bg-[#edeeef] border-l-4 border-transparent"
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {CATEGORY_ICONS[cat] ?? "design_services"}
                </span>
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="border-t border-[#e1e3e4]" />

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
                type="number" min="0" placeholder="0"
                value={draftFilter.priceMin}
                onChange={(e) => setDraftFilter((p) => ({ ...p, priceMin: e.target.value }))}
                className="w-full pl-8 pr-3 py-2 text-sm border border-[#bfc9c3] rounded-lg bg-[#f8f9fa] outline-none focus:border-[#1e3a8a]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#707974] mb-1">Harga Maksimum (Rp)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#707974]">Rp</span>
              <input
                type="number" min="0" placeholder="Tidak terbatas"
                value={draftFilter.priceMax}
                onChange={(e) => setDraftFilter((p) => ({ ...p, priceMax: e.target.value }))}
                className="w-full pl-8 pr-3 py-2 text-sm border border-[#bfc9c3] rounded-lg bg-[#f8f9fa] outline-none focus:border-[#1e3a8a]"
              />
            </div>
          </div>
          {(draftFilter.priceMin || draftFilter.priceMax) && (
            <p className="text-[11px] text-[#191c1d] font-medium">
              {draftFilter.priceMin ? formatRupiah(draftFilter.priceMin) : "0"}
              {" – "}
              {draftFilter.priceMax ? formatRupiah(draftFilter.priceMax) : "∞"}
            </p>
          )}
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d]" suppressHydrationWarning>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0;24,300,1,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 300,'GRAD' 0,'opsz' 24; vertical-align:middle; }
        .premium-shadow { box-shadow:0px 4px 20px rgba(0,0,0,0.04); transition:box-shadow .3s,transform .3s; }
        .premium-shadow:hover { box-shadow:0px 12px 40px rgba(0,0,0,0.08); transform:translateY(-4px); }
      `}</style>

      <div className="mx-auto flex max-w-[1680px] flex-col gap-6 px-4 pt-8 pb-20 md:flex-row md:gap-10 md:px-8 lg:px-12 xl:gap-14 2xl:px-16">

        {/* Sidebar desktop */}
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

        {/* Main */}
        <main className="flex-grow min-w-0">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-lg font-bold text-[#1e3a8a] tracking-tight">Layanan Profesional</h1>
              <p className="text-xs text-[#707974] mt-0.5">
                {filtered.length} jasa tersedia
                {activeCount > 0 && (
                  <span className="ml-2 text-[#1e3a8a] font-semibold">· {activeCount} filter aktif</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={activeFilter.sortBy}
                onChange={(e) => setActiveFilter((p) => ({ ...p, sortBy: e.target.value }))}
                className="h-10 text-xs font-semibold text-[#1e3a8a] bg-white border border-[#e1e3e4] rounded-lg px-3 outline-none cursor-pointer"
              >
                <option value="terbaru">Terbaru</option>
                <option value="rating">Rating ↓</option>
                <option value="harga_asc">Harga ↑</option>
                <option value="harga_desc">Harga ↓</option>
              </select>
              <button
                onClick={openFilter}
                className="md:hidden relative flex h-10 items-center gap-1.5 rounded-lg border border-[#e1e3e4] bg-white px-3 text-xs font-semibold text-[#191c1d]"
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

          <div className="border-b border-[#bfc9c3] mb-6" />

          {resolvedSearch && (
            <div className="mb-6 bg-white border border-[#bfc9c3]/30 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <p className="text-sm text-[#404944]">
                Hasil pencarian: <strong className="text-[#1e3a8a]">&quot;{resolvedSearch}&quot;</strong>
              </p>
              <Link href="/jasa" className="text-xs font-semibold text-[#ba1a1a] hover:underline">
                Hapus Pencarian
              </Link>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-6xl mb-4">🔍</span>
              <p className="font-semibold text-[#404944] text-lg">Jasa tidak ditemukan</p>
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
              {!mounted ? (
                /* SSR Fallback: static grid untuk SEO */
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 xl:gap-5">
                  {filtered.map((svc) => (
                    <ServiceCard key={svc.id} svc={svc} />
                  ))}
                </div>
              ) : (
                /* Virtualized Grid: performa tinggi di client */
                <div
                  ref={parentRef}
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const rowItems = rows[virtualRow.index] || [];
                    return (
                      <div
                        key={virtualRow.key}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
                        }}
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 xl:gap-5"
                      >
                        {rowItems.map((svc) => (
                          <ServiceCard key={svc.id} svc={svc} />
                        ))}
                        {/* Placeholder columns agar grid tidak collapse */}
                        {rowItems.length < cols &&
                          Array.from({ length: cols - rowItems.length }).map((_, idx) => (
                            <div key={`empty-${idx}`} className="invisible" />
                          ))
                        }
                      </div>
                    );
                  })}
                </div>
              )}
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

      {/* Mobile Filter Drawer */}
      {filterOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setFilterOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl md:hidden max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#e1e3e4]" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#e1e3e4]">
              <h2 className="font-bold text-base text-[#191c1d]">Filter Jasa</h2>
              <button onClick={() => setFilterOpen(false)} className="text-[#707974]">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-5">{FilterPanel}</div>
            <div className="px-5 py-4 border-t border-[#e1e3e4] flex gap-3">
              <button
                onClick={resetDraft}
                className="flex-1 rounded-xl border border-[#bfc9c3] py-3 text-sm font-semibold text-[#707974]"
              >
                Reset
              </button>
              <button
                onClick={applyFilter}
                className="flex-[2] rounded-xl bg-[#1e3a8a] py-3 text-sm font-semibold text-white"
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
