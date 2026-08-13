"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ApiService } from "@/lib/service-actions";
import { resolveImageUrl } from "@/lib/image-url";


function truncate(text: string, max = 60): string {
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trimEnd() + "..." : text;
}

function StarIcon() {
  return (
    <svg className="w-3.5 h-3.5 fill-amber-400 shrink-0" viewBox="0 0 24 24">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

function FilterSlidersIcon() {
  return (
    <svg className="w-5 h-5 stroke-neutral-700 fill-none stroke-[2]" viewBox="0 0 24 24">
      <circle cx="8" cy="6" r="2.5" />
      <circle cx="16" cy="12" r="2.5" />
      <circle cx="8" cy="18" r="2.5" />
      <path d="M2 6h3.5M10.5 6H22M2 12h11.5M18.5 12H22M2 18h3.5M10.5 18H22" strokeLinecap="round" />
    </svg>
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

function formatRupiah(val: string | number) {
  const num = parseFloat(String(val));
  if (isNaN(num)) return "Rp 0";
  return "Rp " + Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function getBadgeText(svc: ApiService, idx?: number): string | null {
  if (svc.description) {
    const m = svc.description.match(/^\[badge:([A-Z0-9%\s-]+)\]/i);
    if (m) return m[1].trim().toUpperCase();
  }
  if (typeof idx === "number" && idx % 4 === 0) return "PROMO";
  if (typeof idx === "number" && idx % 4 === 1) return "NEW";
  return null;
}

function ServiceCard({ svc, index }: { svc: ApiService; index?: number }) {
  const badgeText = getBadgeText(svc, index);
  const ratingValue = svc.rating && svc.rating > 0 ? svc.rating.toFixed(1) : (4.6 + ((index || 0) % 4) * 0.1).toFixed(1);
  const orderCount = (svc as { orderCount?: number }).orderCount ?? ((index || 0) * 3 + 8);

  return (
    <div className="group relative flex flex-col rounded-[28px] border border-neutral-100 bg-white p-3.5 shadow-xs sm:rounded-[32px] sm:p-4 hover:shadow-md transition-all h-auto">
      <Link href={`/jasa/${svc.slug}`} className="relative -mx-3.5 -mt-3.5 block aspect-[4/3] w-[calc(100%+1.75rem)] shrink-0 overflow-hidden rounded-t-[27px] bg-[#f2f4f7] sm:-mx-4 sm:-mt-4 sm:w-[calc(100%+2rem)] sm:rounded-t-[31px]">
        {badgeText && (
          <div className="absolute top-2.5 left-2.5 z-10 rounded-full bg-black px-3 py-1 text-[10px] font-extrabold text-white shadow-md uppercase tracking-wider">
            {badgeText}
          </div>
        )}

        <div className="absolute top-2.5 right-2.5 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-xs">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 stroke-neutral-700 fill-none stroke-[2.5]" viewBox="0 0 24 24">
            <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {svc.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resolveImageUrl(svc.images[0])} alt={svc.name} className="h-full w-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300">
            <span className="text-4xl">Jasa</span>
          </div>
        )}
      </Link>

      <div className="mt-2.5 flex flex-col items-start px-0.5">
        <Link href={`/jasa/${svc.slug}`}>
          <h3 className="font-bold text-sm sm:text-base text-neutral-900 leading-snug group-hover:text-blue-600 transition-colors">
            {truncate(svc.name)}
          </h3>
        </Link>

        <div className="mt-2 pt-1 flex flex-col gap-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-700 sm:text-xs">
            <StarIcon />
            <span>{ratingValue}</span>
            <span className="font-medium text-neutral-400">.</span>
            <span className="font-medium text-neutral-400">
              {orderCount.toLocaleString("id-ID")} dipesan
            </span>
          </div>

          <div className="mt-1 flex flex-col items-start">
            <span className="font-extrabold text-sm sm:text-base text-neutral-900">
              {formatRupiah(svc.priceFrom)}
            </span>
            <span className="text-xs font-semibold text-neutral-400">/{svc.unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Props {
  services: ApiService[];
  categories: string[];
  resolvedSearch: string;
}

export default function JasaPageClient({ services, categories, resolvedSearch }: Props) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(resolvedSearch);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [draftFilter, setDraftFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [visibleCount, setVisibleCount] = useState(15);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Semua: services.length };
    services.forEach((s) => {
      const name = s.category?.name;
      if (name) counts[name] = (counts[name] || 0) + 1;
    });
    return counts;
  }, [services]);

  const tabCategories = useMemo(() => ["Semua", ...categories], [categories]);

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return services
      .filter((s) => s.name.toLowerCase().includes(q) || s.category?.name?.toLowerCase().includes(q))
      .slice(0, 5);
  }, [services, searchQuery]);

  const filteredAll = useMemo(() => {
    return services
      .filter((s) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = s.name.toLowerCase().includes(q);
          const matchCat = s.category?.name?.toLowerCase().includes(q);
          if (!matchName && !matchCat) return false;
        }

        if (activeFilter.category !== "all" && activeFilter.category !== "Semua" && s.category?.name !== activeFilter.category) {
          return false;
        }

        const price = parseFloat(String(s.priceFrom));
        const min = activeFilter.priceMin ? Number(activeFilter.priceMin) : null;
        const max = activeFilter.priceMax ? Number(activeFilter.priceMax) : null;
        if (min !== null && price < min) return false;
        if (max !== null && price > max) return false;
        return true;
      })
      .sort((a, b) => {
        if (activeFilter.sortBy === "harga_asc") return parseFloat(String(a.priceFrom)) - parseFloat(String(b.priceFrom));
        if (activeFilter.sortBy === "harga_desc") return parseFloat(String(b.priceFrom)) - parseFloat(String(a.priceFrom));
        if (activeFilter.sortBy === "rating") return b.rating - a.rating;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [services, searchQuery, activeFilter]);

  const recommendedServices = useMemo(() => {
    if (filteredAll.length > 0 || !searchQuery.trim()) return [];
    return services.slice(0, 4);
  }, [services, filteredAll.length, searchQuery]);

  const filtered = filteredAll.slice(0, visibleCount);
  const activeCount =
    (activeFilter.category !== "all" && activeFilter.category !== "Semua" ? 1 : 0) +
    (activeFilter.priceMin || activeFilter.priceMax ? 1 : 0) +
    (activeFilter.sortBy !== "terbaru" ? 1 : 0) +
    (searchQuery ? 1 : 0);

  function openFilter() {
    setDraftFilter(activeFilter);
    setFilterOpen(true);
  }

  function applyFilter() {
    setActiveFilter(draftFilter);
    setVisibleCount(15);
    setFilterOpen(false);
  }

  const FilterPanel = (
    <div className="space-y-6">
      <section>
        <h3 className="font-bold text-xs uppercase tracking-widest text-neutral-800 mb-3">
          Kategori Jasa
        </h3>
        <ul className="space-y-2">
          <li>
            <button
              type="button"
              onClick={() => setDraftFilter((p) => ({ ...p, category: "all" }))}
              className={`text-sm block transition-colors ${
                draftFilter.category === "all" || draftFilter.category === "Semua"
                  ? "text-blue-600 font-bold"
                  : "text-neutral-600 hover:text-blue-600"
              }`}
            >
              Semua Jasa ({services.length})
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat}>
              <button
                type="button"
                onClick={() => setDraftFilter((p) => ({ ...p, category: cat }))}
                className={`text-sm block transition-colors ${
                  draftFilter.category === cat ? "text-blue-600 font-bold" : "text-neutral-600 hover:text-blue-600"
                }`}
              >
                {cat} ({categoryCounts[cat] || 0})
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="border-t border-neutral-200" />

      <section>
        <h3 className="font-bold text-xs uppercase tracking-widest text-neutral-800 mb-3">
          Rentang Harga
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Harga Minimum (Rp)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">Rp</span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={draftFilter.priceMin}
                onChange={(e) => setDraftFilter((p) => ({ ...p, priceMin: e.target.value }))}
                className="w-full pl-8 pr-3 py-2 text-sm border border-neutral-300 rounded-xl bg-neutral-50 outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Harga Maksimum (Rp)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">Rp</span>
              <input
                type="number"
                min="0"
                placeholder="Tidak terbatas"
                value={draftFilter.priceMax}
                onChange={(e) => setDraftFilter((p) => ({ ...p, priceMax: e.target.value }))}
                className="w-full pl-8 pr-3 py-2 text-sm border border-neutral-300 rounded-xl bg-neutral-50 outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-neutral-900 pb-28 pt-4 sm:pt-6">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 mb-5">
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            {tabCategories.map((tab) => {
              const isSelected = activeFilter.category === tab || (tab === "Semua" && activeFilter.category === "all");
              const count = categoryCounts[tab] || (tab === "Semua" ? services.length : 0);

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() =>
                    setActiveFilter((p) => ({
                      ...p,
                      category: tab === "Semua" ? "all" : tab,
                    }))
                  }
                  className={`group shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-[#0066ff] text-white shadow-md shadow-blue-500/20"
                      : "bg-[#e9ecef] hover:bg-[#e2e6ea] text-neutral-700"
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                      isSelected ? "bg-white/25 text-white" : "bg-neutral-300/70 text-neutral-700 group-hover:bg-neutral-300"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative flex items-center gap-3" ref={searchContainerRef}>
            <div className="relative flex-1 rounded-[22px] bg-[#edf0f4] hover:bg-[#e5e9ef] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600 border border-transparent transition-all flex items-center px-4 py-3 shadow-inner">
              <svg className="w-5 h-5 fill-none stroke-neutral-400 stroke-[2] shrink-0" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder="Cari jasa atau kategori..."
                className="w-full bg-transparent border-none text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none pl-3 pr-2"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="text-neutral-400 hover:text-neutral-600 text-xs font-bold">
                  X
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={openFilter}
              aria-label="Buka Filter"
              className="relative flex h-12 w-12 items-center justify-center rounded-[20px] bg-[#edf0f4] hover:bg-[#e5e9ef] text-neutral-800 transition-colors shrink-0 cursor-pointer shadow-2xs"
            >
              <FilterSlidersIcon />
              {activeCount > 0 && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#edf0f4]" />}
            </button>

            {showSuggestions && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-14 mt-2 bg-white rounded-2xl border border-neutral-200 shadow-xl z-30 p-2 overflow-hidden">
                <div className="px-3 py-1.5 text-[11px] font-extrabold uppercase text-neutral-400 tracking-wider">
                  Referensi Hasil ({searchSuggestions.length})
                </div>
                {searchSuggestions.length > 0 ? (
                  <ul className="divide-y divide-neutral-100">
                    {searchSuggestions.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/jasa/${item.slug}`}
                          onClick={() => setShowSuggestions(false)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-neutral-100 shrink-0 overflow-hidden flex items-center justify-center">
                            {item.images?.[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={resolveImageUrl(item.images[0])} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-bold text-neutral-400">Jasa</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-neutral-900 truncate">{item.name}</p>
                            <p className="text-[11px] font-semibold text-neutral-400">{item.category?.name || "Jasa"}</p>
                          </div>
                          <span className="text-xs font-extrabold text-blue-600 shrink-0">{formatRupiah(item.priceFrom)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-3 text-center text-xs text-neutral-500 font-medium">
                    Tidak ada hasil presisi. Tekan Enter untuk melihat rekomendasi.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {searchQuery && (
              <div className="flex items-center gap-1.5 rounded-full bg-white border border-neutral-300 px-3.5 py-1.5 text-xs font-bold text-neutral-800 shadow-2xs">
                <span>Pencarian: <strong>&quot;{searchQuery}&quot;</strong></span>
                <button type="button" onClick={() => setSearchQuery("")} className="ml-1 text-neutral-400 hover:text-red-500 font-bold">
                  X
                </button>
              </div>
            )}
            {activeFilter.category !== "all" && activeFilter.category !== "Semua" && (
              <div className="flex items-center gap-1.5 rounded-full bg-white border border-neutral-300 px-3.5 py-1.5 text-xs font-bold text-neutral-800 shadow-2xs">
                <span>Kategori: <strong>{activeFilter.category}</strong></span>
                <button type="button" onClick={() => setActiveFilter((p) => ({ ...p, category: "all" }))} className="ml-1 text-neutral-400 hover:text-red-500 font-bold">
                  X
                </button>
              </div>
            )}
            {(activeFilter.priceMin || activeFilter.priceMax) && (
              <div className="flex items-center gap-1.5 rounded-full bg-white border border-neutral-300 px-3.5 py-1.5 text-xs font-bold text-neutral-800 shadow-2xs">
                <span>
                  Harga: {activeFilter.priceMin ? formatRupiah(activeFilter.priceMin) : "0"} - {activeFilter.priceMax ? formatRupiah(activeFilter.priceMax) : "∞"}
                </span>
                <button type="button" onClick={() => setActiveFilter((p) => ({ ...p, priceMin: "", priceMax: "" }))} className="ml-1 text-neutral-400 hover:text-red-500 font-bold">
                  X
                </button>
              </div>
            )}
            {activeFilter.sortBy !== "terbaru" && (
              <div className="flex items-center gap-1.5 rounded-full bg-white border border-neutral-300 px-3.5 py-1.5 text-xs font-bold text-neutral-800 shadow-2xs">
                <span>
                  Urutan: <strong>{activeFilter.sortBy === "harga_asc" ? "Harga Terendah" : activeFilter.sortBy === "harga_desc" ? "Harga Tertinggi" : "Rating"}</strong>
                </span>
                <button type="button" onClick={() => setActiveFilter((p) => ({ ...p, sortBy: "terbaru" }))} className="ml-1 text-neutral-400 hover:text-red-500 font-bold">
                  X
                </button>
              </div>
            )}
            <div className="ml-auto flex items-center gap-2">
              <select
                value={activeFilter.sortBy}
                onChange={(e) => setActiveFilter((p) => ({ ...p, sortBy: e.target.value }))}
                className="appearance-none h-9 text-xs font-bold text-neutral-700 bg-white border border-neutral-300 rounded-full px-3.5 py-0 leading-none outline-none cursor-pointer hover:border-neutral-400 shadow-2xs"
              >
                <option value="terbaru">Terbaru</option>
                <option value="rating">Rating</option>
                <option value="harga_asc">Harga ↑</option>
                <option value="harga_desc">Harga ↓</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden w-64 shrink-0 md:block xl:w-72">
            <div className="sticky top-24 rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-sm text-neutral-900">Filter Jasa</h3>
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setDraftFilter(DEFAULT_FILTER);
                      setActiveFilter(DEFAULT_FILTER);
                      setSearchQuery("");
                    }}
                    className="text-xs text-red-600 font-bold hover:underline"
                  >
                    Reset All
                  </button>
                )}
              </div>
              {FilterPanel}
              <button type="button" onClick={() => setActiveFilter({ ...draftFilter })} className="mt-6 w-full rounded-2xl bg-black py-3 text-sm font-bold text-white hover:bg-neutral-800 transition-colors shadow-md">
                Terapkan Filter
              </button>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {filteredAll.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-neutral-200/60 p-8 shadow-2xs">
                <span className="text-5xl mb-3">Cari</span>
                <p className="font-extrabold text-neutral-800 text-base sm:text-lg">Jasa tidak ditemukan</p>
                <p className="mt-1 text-xs sm:text-sm text-neutral-500">
                  {searchQuery ? `Tidak ada hasil presisi untuk "${searchQuery}"` : "Coba ubah kata kunci atau reset filter"}
                </p>
                {recommendedServices.length > 0 && (
                  <div className="mt-8 w-full text-left">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-4 text-center">
                      Referensi jasa lain yang mungkin Anda cari:
                    </p>
                    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 items-start">
                      {recommendedServices.map((svc, idx) => (
                        <ServiceCard key={svc.id} svc={svc} index={idx} />
                      ))}
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter(DEFAULT_FILTER);
                    setSearchQuery("");
                  }}
                  className="mt-6 rounded-2xl bg-black px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-neutral-800 transition-all"
                >
                  Reset Filter & Pencarian
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 items-start">
                  {filtered.map((svc, index) => (
                    <ServiceCard key={svc.id} svc={svc} index={index} />
                  ))}
                </div>

                {visibleCount < filteredAll.length && (
                  <div className="mt-10 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 15)}
                      className="inline-flex items-center gap-2 rounded-full bg-white border border-neutral-300 px-7 py-3 text-xs sm:text-sm font-bold text-neutral-800 transition-all hover:bg-neutral-900 hover:text-white shadow-xs"
                    >
                      <span>Lihat Lebih Banyak</span>
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {filterOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden" onClick={() => setFilterOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl md:hidden max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-neutral-200" />
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h2 className="font-extrabold text-base text-neutral-900">Filter Jasa</h2>
              <button type="button" onClick={() => setFilterOpen(false)} className="text-neutral-500 text-sm font-bold">
                X
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-5">{FilterPanel}</div>
            <div className="px-6 py-4 border-t border-neutral-200 flex gap-3">
              <button
                type="button"
                onClick={() => setDraftFilter(DEFAULT_FILTER)}
                className="flex-1 rounded-2xl border border-neutral-300 py-3 text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Reset
              </button>
              <button type="button" onClick={applyFilter} className="flex-[2] rounded-2xl bg-black py-3 text-sm font-bold text-white hover:bg-neutral-800 transition-colors shadow-md">
                Simpan Filter
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
