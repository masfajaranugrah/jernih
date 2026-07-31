"use client";

import Link from "next/link";
import { useState, useMemo, useEffect, useRef } from "react";
import { formatRupiah, type ApiProduct } from "@/lib/api";
import { emitWishlistChange } from "@/lib/cart";

function HeartIcon({ isFav }: { isFav: boolean }) {
  return (
    <svg
      className={`w-5 h-5 shrink-0 transition-all duration-200 ${
        isFav ? "fill-red-500 text-red-500 scale-110" : "fill-none stroke-neutral-500 stroke-[2] hover:stroke-red-500"
      }`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
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

function getBadgeText(product: ApiProduct, idx?: number): string | null {
  if (product.description) {
    const m = product.description.match(/^\[badge:([A-Z0-9%\s-]+)\]/i);
    if (m) return m[1].trim().toUpperCase();
  }

  const oldP = product.oldPrice ? Number(product.oldPrice) : 0;
  const curP = Number(product.price);
  const discountPercent = oldP > curP ? Math.round(((oldP - curP) / oldP) * 100) : 0;
  if (discountPercent > 0) {
    return `-${discountPercent}%`;
  }

  if (typeof idx === "number" && idx % 4 === 0) {
    return "PROMO";
  }

  return null;
}

function ProductCard({
  product,
  index,
  isFavorite,
  onToggleFavorite,
}: {
  product: ApiProduct;
  index?: number;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}) {
  const badgeText = getBadgeText(product, index);
  const categoryLabel = product.category?.name || "PRODUK";
  const ratingValue = (product.rating && product.rating > 0) ? product.rating.toFixed(1) : (4.5 + ((index || 0) % 5) * 0.1).toFixed(1);

  return (
    <div className="group relative flex h-full flex-col justify-between rounded-[28px] bg-white p-3.5 sm:p-4 shadow-xs border border-neutral-100">
      {/* Top Image Box */}
      <Link href={`/produk/${product.slug}`} className="block relative aspect-square w-full overflow-hidden rounded-[22px] bg-[#f2f4f7] p-3">
        {badgeText && (
          <div className="absolute top-2.5 left-2.5 z-10 rounded-full bg-black px-3 py-1 text-[10px] font-extrabold text-white shadow-md uppercase tracking-wider">
            {badgeText}
          </div>
        )}

        <button
          type="button"
          aria-label="Tambah ke Favorit"
          onClick={(e) => onToggleFavorite(product.id, e)}
          className="absolute top-2.5 right-2.5 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-xs cursor-pointer"
        >
          <HeartIcon isFav={isFavorite} />
        </button>

        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300">
            <span className="text-4xl">📷</span>
          </div>
        )}
      </Link>

      {/* Info Section Below Image */}
      <div className="mt-3 flex flex-col px-1">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
          <span className="uppercase tracking-wider text-[11px] font-extrabold text-neutral-400 truncate max-w-[65%]">
            {categoryLabel}
          </span>
          <div className="flex items-center gap-1 font-bold text-neutral-800 bg-neutral-100/80 px-2 py-0.5 rounded-md text-[11px]">
            <StarIcon />
            <span>{ratingValue}</span>
          </div>
        </div>

        <Link href={`/produk/${product.slug}`} className="mt-1">
          <h3 className="line-clamp-1 font-bold text-sm sm:text-base text-neutral-900 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-extrabold text-sm sm:text-base text-neutral-900">
            {formatRupiah(product.price)}
          </span>
          {product.oldPrice && Number(product.oldPrice) > Number(product.price) && (
            <span className="text-xs text-neutral-400 line-through">
              {formatRupiah(product.oldPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
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
  const [searchQuery, setSearchQuery] = useState(resolvedSearch);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [draftFilter, setDraftFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [visibleCount, setVisibleCount] = useState(15);
  const [favorites, setFavorites] = useState<string[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load wishlist IDs
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mh_wishlist_ids");
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Close search suggestions on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleFavorite(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("mh_wishlist_ids", JSON.stringify(next));
        // Jangan panggil emitWishlistChange — ini hanya localStorage,
        // bukan API. Navbar/MobileBottomNav tidak perlu refetch.
      } catch {}
      return next;
    });
  }

  // Calculate dynamic category counts from actual products
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Semua: products.length };
    products.forEach((p) => {
      const name = p.category?.name;
      if (name) {
        counts[name] = (counts[name] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  // Dynamic Category Tabs from database
  const tabCategories = useMemo(() => {
    return ["Semua", ...categories];
  }, [categories]);

  // Search Live Suggestions & References
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchCat = p.category?.name?.toLowerCase().includes(q);
      return matchName || matchCat;
    }).slice(0, 5);
  }, [products, searchQuery]);

  // Apply filters
  const filteredAll = useMemo(() => {
    return products
      .filter((p) => {
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchCat = p.category?.name?.toLowerCase().includes(q);
          if (!matchName && !matchCat) return false;
        }

        // Category filter
        if (activeFilter.category !== "all" && activeFilter.category !== "Semua") {
          if (p.category?.name !== activeFilter.category) {
            return false;
          }
        }

        // Price filter
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
  }, [products, searchQuery, activeFilter]);

  // Alternative recommendations if no exact search match found
  const recommendedProducts = useMemo(() => {
    if (filteredAll.length > 0 || !searchQuery.trim()) return [];
    // Suggest top 4 products as references
    return products.slice(0, 4);
  }, [products, filteredAll.length, searchQuery]);

  const filtered = filteredAll.slice(0, visibleCount);

  // Count active filters
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

  // Filter drawer/sidebar component
  const FilterPanel = (
    <div className="space-y-6">
      {/* Category Selection */}
      <section>
        <h3 className="font-bold text-xs uppercase tracking-widest text-neutral-800 mb-3">
          Kategori Produk
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
              Semua Produk ({products.length})
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat}>
              <button
                type="button"
                onClick={() => setDraftFilter((p) => ({ ...p, category: cat }))}
                className={`text-sm block transition-colors ${
                  draftFilter.category === cat
                    ? "text-blue-600 font-bold"
                    : "text-neutral-600 hover:text-blue-600"
                }`}
              >
                {cat} ({categoryCounts[cat] || 0})
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="border-t border-neutral-200" />

      {/* Rentang Harga */}
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
        
        {/* ── Top Header Bar & Real Category Tabs ── */}
        <div className="flex flex-col gap-4 mb-5">
          {/* Real Category Tabs from DB */}
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            {tabCategories.map((tab) => {
              const isSelected =
                activeFilter.category === tab ||
                (tab === "Semua" && activeFilter.category === "all");
              const count = categoryCounts[tab] || (tab === "Semua" ? products.length : 0);

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
                      isSelected
                        ? "bg-white/25 text-white"
                        : "bg-neutral-300/70 text-neutral-700 group-hover:bg-neutral-300"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input Bar with Live Suggestions & Filter Toggle */}
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
                placeholder="Cari produk atau kategori..."
                className="w-full bg-transparent border-none text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none pl-3 pr-2"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-neutral-400 hover:text-neutral-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Slider Button */}
            <button
              type="button"
              onClick={openFilter}
              aria-label="Buka Filter"
              className="relative flex h-12 w-12 items-center justify-center rounded-[20px] bg-[#edf0f4] hover:bg-[#e5e9ef] text-neutral-800 transition-colors shrink-0 cursor-pointer shadow-2xs"
            >
              <FilterSlidersIcon />
              {activeCount > 0 && (
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#edf0f4]" />
              )}
            </button>

            {/* Live Search Suggestions Dropdown / References */}
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
                          href={`/produk/${item.slug}`}
                          onClick={() => setShowSuggestions(false)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-neutral-100 shrink-0 overflow-hidden flex items-center justify-center">
                            {item.images[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs">📷</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-neutral-900 truncate">{item.name}</p>
                            <p className="text-[11px] font-semibold text-neutral-400">{item.category?.name || "Produk"}</p>
                          </div>
                          <span className="text-xs font-extrabold text-blue-600 shrink-0">{formatRupiah(item.price)}</span>
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

          {/* Dynamic Active Filter Tags Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Tag */}
            {searchQuery && (
              <div className="flex items-center gap-1.5 rounded-full bg-white border border-neutral-300 px-3.5 py-1.5 text-xs font-bold text-neutral-800 shadow-2xs">
                <span>Pencarian: <strong>&quot;{searchQuery}&quot;</strong></span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="ml-1 text-neutral-400 hover:text-red-500 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Category Tag */}
            {activeFilter.category !== "all" && activeFilter.category !== "Semua" && (
              <div className="flex items-center gap-1.5 rounded-full bg-white border border-neutral-300 px-3.5 py-1.5 text-xs font-bold text-neutral-800 shadow-2xs">
                <span>Kategori: <strong>{activeFilter.category}</strong></span>
                <button
                  type="button"
                  onClick={() => setActiveFilter((p) => ({ ...p, category: "all" }))}
                  className="ml-1 text-neutral-400 hover:text-red-500 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Price Filter Tag */}
            {(activeFilter.priceMin || activeFilter.priceMax) && (
              <div className="flex items-center gap-1.5 rounded-full bg-white border border-neutral-300 px-3.5 py-1.5 text-xs font-bold text-neutral-800 shadow-2xs">
                <span>
                  Harga: {activeFilter.priceMin ? formatRupiah(Number(activeFilter.priceMin)) : "0"} -{" "}
                  {activeFilter.priceMax ? formatRupiah(Number(activeFilter.priceMax)) : "∞"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter((p) => ({ ...p, priceMin: "", priceMax: "" }));
                  }}
                  className="ml-1 text-neutral-400 hover:text-red-500 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Sort Tag */}
            {activeFilter.sortBy !== "terbaru" && (
              <div className="flex items-center gap-1.5 rounded-full bg-white border border-neutral-300 px-3.5 py-1.5 text-xs font-bold text-neutral-800 shadow-2xs">
                <span>Urutan: <strong>{activeFilter.sortBy === "harga_asc" ? "Harga Terendah" : "Harga Tertinggi"}</strong></span>
                <button
                  type="button"
                  onClick={() => setActiveFilter((p) => ({ ...p, sortBy: "terbaru" }))}
                  className="ml-1 text-neutral-400 hover:text-red-500 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Sort dropdown on right */}
            <div className="ml-auto flex items-center gap-2">
              <select
                value={activeFilter.sortBy}
                onChange={(e) => setActiveFilter((p) => ({ ...p, sortBy: e.target.value }))}
                className="appearance-none h-9 text-xs font-bold text-neutral-700 bg-white border border-neutral-300 rounded-full px-3.5 py-0 leading-none outline-none cursor-pointer hover:border-neutral-400 shadow-2xs"
              >
                <option value="terbaru">Terbaru</option>
                <option value="harga_asc">Harga ↑</option>
                <option value="harga_desc">Harga ↓</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Main Product Grid Section ── */}
        <div className="flex gap-8">
          {/* Sidebar Filter for Desktop */}
          <aside className="hidden w-64 shrink-0 md:block xl:w-72">
            <div className="sticky top-24 rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-sm text-neutral-900">Filter Produk</h3>
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
              <button
                type="button"
                onClick={() => setActiveFilter({ ...draftFilter })}
                className="mt-6 w-full rounded-2xl bg-black py-3 text-sm font-bold text-white hover:bg-neutral-800 transition-colors shadow-md"
              >
                Terapkan Filter
              </button>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="flex-1 min-w-0">
            {filteredAll.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-neutral-200/60 p-8 shadow-2xs">
                <span className="text-5xl mb-3">🔍</span>
                <p className="font-extrabold text-neutral-800 text-base sm:text-lg">Produk tidak ditemukan</p>
                <p className="mt-1 text-xs sm:text-sm text-neutral-500">
                  {searchQuery ? `Tidak ada hasil presisi untuk "${searchQuery}"` : "Coba ubah kata kunci atau reset filter"}
                </p>

                {/* References / Recommendations if search yielded no match */}
                {recommendedProducts.length > 0 && (
                  <div className="mt-8 w-full text-left">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-4 text-center">
                      Referensi produk lain yang mungkin Anda cari:
                    </p>
                    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                      {recommendedProducts.map((prod, idx) => (
                        <ProductCard
                          key={prod.id}
                          product={prod}
                          index={idx}
                          isFavorite={favorites.includes(prod.id)}
                          onToggleFavorite={toggleFavorite}
                        />
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
                <div className="grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
                  {filtered.map((product: ApiProduct, index: number) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      isFavorite={favorites.includes(product.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>

                {/* Load More Button */}
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

      {/* ── Mobile Filter Drawer ── */}
      {filterOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
            onClick={() => setFilterOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl md:hidden max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-neutral-200" />
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h2 className="font-extrabold text-base text-neutral-900">Filter Produk</h2>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="text-neutral-500 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-5">
              {FilterPanel}
            </div>
            <div className="px-6 py-4 border-t border-neutral-200 flex gap-3">
              <button
                type="button"
                onClick={() => setDraftFilter(DEFAULT_FILTER)}
                className="flex-1 rounded-2xl border border-neutral-300 py-3 text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={applyFilter}
                className="flex-[2] rounded-2xl bg-black py-3 text-sm font-bold text-white hover:bg-neutral-800 transition-colors shadow-md"
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
