"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// ─── Data statis untuk demo (Trending / Pencarian Populer) ───────────────────
const TRENDING = [
  "Laptop Gaming",
  "iPhone 15",
  "Headphone Sony",
  "Sewa Excavator",
  "Jasa Renovasi",
  "Kamera DSLR",
];

const QUICK_RESULTS = [
  {
    slug: "laptop-gaming-asus-rog",
    name: "Laptop Gaming ASUS ROG",
    category: "Elektronik",
    sub: "Produk",
    price: "Rp15.000.000",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAcCKtONE-oOqQ1l01e4k2hpIrpB7-qqdVH3ANTOcWoB_90mpL3Ug5XEPnfSCS75joY6bUTS9cKl2luQHYfuYcA6SlY4BMhKTI_2IdhbEtcbM7s9ZXSj3R1uknHV-p5au81dvYQXnglm6cKsxgKOHODtyzzHPXtB_Em_7wwSkDs9t-u9pGAg4VoYxkUyrmN85N_OlCtDrorssavgi_f2N-5POP4psuw_h0yLzJLK-MI4XTgvbo9FeZk",
  },
  {
    slug: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max",
    category: "Elektronik",
    sub: "Produk",
    price: "Rp22.000.000",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCdkTocgES_sIazNeSnxhbhnRee2GCElj-hX4aZRsNYyPfmej2vRLCS9_kzETc8q7mDeBVlLQiIXmQ67iJz69xKTZsosdO3zkK1D-VUYMYaPxIfepAzaPK-FLryaoDh9jRGysrfduI14hXzL3cRad8MqbM_eNYeLGsVK0twQ31Njz20txq3hNNlP6ZwuZF3inV4GpktY8SFZx36Xw5a18Mg2Fznqls_d7kxm82cYxkpaPlX5FgSzhYV",
  },
  {
    slug: "headphone-sony-wh-1000xm5",
    name: "Headphone Sony WH-1000XM5",
    category: "Elektronik",
    sub: "Produk",
    price: "Rp4.500.000",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDHKyz3QvmoE8gaJ0uO9TR_ky-QqVfuRHdvDiLrGglbnhqtNXJqF3u5NblTbAescIy3-irxKTZDfUtIgDKIrK54fXsITc8gdxXCpS0aSnYtRoLReU3NA_8QlJfboy4c0t1SLJi9usU2yDEhxvdxFytBbUVkviKcQgds2tpIIv1YmZkfRJvVYId2CqvC24MzezVjMESFkmtk-bBO0q1oRay49n9zz50dioAxQHQ-oNlbryJ90mCQXfLb",
  },
];

// SVG Icons for Category Filter Tabs
function AllIcon() {
  return (
    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
      <path d="M4 11h6V5H4v6zm0 8h6v-6H4v6zm8-14v6h6V5h-6zm0 14h6v-6h-6v6z" />
    </svg>
  );
}

function ProductIcon() {
  return (
    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
      <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z" />
    </svg>
  );
}

function RentalIcon() {
  return (
    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
      <path d="M12.65 10C11.83 7.67 9.59 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.59 0 4.83-1.67 5.65-4H17v3h3v-3h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
    </svg>
  );
}

function ServiceIcon() {
  return (
    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
      <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.3C.5 6.7.9 9.8 2.9 11.8c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.6z" />
    </svg>
  );
}

const FILTERS = [
  { value: "all", label: "Semua", icon: AllIcon },
  { value: "produk", label: "Produk", icon: ProductIcon },
  { value: "sewa", label: "Sewa", icon: RentalIcon },
  { value: "jasa", label: "Jasa", icon: ServiceIcon },
];

function formatRupiah(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "Rp0";
  return "Rp" + num.toLocaleString("id-ID");
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type SearchResultItem = {
  id: string;
  name: string;
  type: "produk" | "sewa" | "jasa";
  category: string;
  price: number;
  image: string;
  link: string;
};

export default function SearchOverlay({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "produk" | "sewa" | "jasa">("all");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setIsLoading(false);
      setActiveTab("all");
    }
  }, [isOpen]);

  // Handle ESC key to close search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent background scrolling when search is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Real-time search query mechanism with debounce
  useEffect(() => {
    if (!isOpen || !query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const fetchPromises: Promise<SearchResultItem[]>[] = [];
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

        // Query Products
        if (activeTab === "all" || activeTab === "produk") {
          fetchPromises.push(
            fetch(`${baseUrl}/products?search=${encodeURIComponent(query)}&limit=10`)
              .then((res) => res.json())
              .then((json) => {
                const items = json.data ?? [];
                return items.map((item: any) => ({
                  id: item.id,
                  name: item.name,
                  type: "produk" as const,
                  category: item.category?.name ?? "Produk",
                  price: parseFloat(item.price),
                  image: item.images?.[0] ?? "",
                  link: `/produk/${item.slug}`,
                }));
              })
              .catch(() => [])
          );
        }

        // Query Rentals (Sewa)
        if (activeTab === "all" || activeTab === "sewa") {
          fetchPromises.push(
            fetch(`${baseUrl}/rentals/items?search=${encodeURIComponent(query)}`)
              .then((res) => res.json())
              .then((items) => {
                if (!Array.isArray(items)) return [];
                return items.map((item: any) => ({
                  id: item.id,
                  name: item.name,
                  type: "sewa" as const,
                  category: "Sewa",
                  price: parseFloat(item.pricePerDay),
                  image: item.images?.[0] ?? "",
                  link: `/sewa?search=${encodeURIComponent(item.name)}`,
                }));
              })
              .catch(() => [])
          );
        }

        // Query Services (Jasa)
        if (activeTab === "all" || activeTab === "jasa") {
          fetchPromises.push(
            fetch(`${baseUrl}/services?search=${encodeURIComponent(query)}`)
              .then((res) => res.json())
              .then((items) => {
                if (!Array.isArray(items)) return [];
                return items.map((item: any) => ({
                  id: item.id,
                  name: item.name,
                  type: "jasa" as const,
                  category: item.category?.name ?? "Jasa",
                  price: parseFloat(item.priceFrom),
                  image: item.images?.[0] ?? "",
                  link: `/jasa/${item.slug}`,
                }));
              })
              .catch(() => [])
          );
        }

        const resolved = await Promise.all(fetchPromises);
        const combined = resolved.flat();
        setResults(combined);
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250); // 250ms debounce for instantaneous feel

    return () => clearTimeout(delayDebounceFn);
  }, [query, activeTab, isOpen]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      if (results.length > 0) {
        // Redirect to the first match
        window.location.href = results[0].link;
      } else {
        // Fallback target
        const targetPage = activeTab === "all" ? "produk" : activeTab;
        window.location.href = `/${targetPage}?search=${encodeURIComponent(query.trim())}`;
      }
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-[#0d1110]/30 px-4 pt-6 backdrop-blur-md md:pt-24"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ animation: "searchFadeIn 0.2s ease-out" }}
    >
      {/* Glassmorphic Search Window */}
      <div
        className="flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/60 shadow-2xl"
        style={{
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          animation: "searchSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* ── Input bar ── */}
        <form onSubmit={handleSearch}>
          <div className="relative flex items-center gap-3 border-b border-[#bfc9c3]/30 px-4 py-3 md:px-6">
            {/* Search icon */}
            <svg
              className="h-5 w-5 shrink-0 fill-current text-[#064e3b]"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="m19.6 21-6.3-6.3a7 7 0 1 1 1.4-1.4l6.3 6.3-1.4 1.4ZM9 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik untuk mencari produk, jasa, atau sewa..."
              className="w-full border-none bg-transparent py-2 text-xl font-medium text-[#191c1d] placeholder:text-[#404944]/40 focus:outline-none focus:ring-0"
            />

            {/* Spinner loader */}
            {isLoading && (
              <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-[#064e3b] border-t-transparent" />
            )}

            {/* Clear button */}
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="rounded-full p-1.5 text-[#404944] hover:bg-black/5 transition"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            )}

            {/* Vertical separator */}
            <span className="h-6 w-px bg-[#bfc9c3]/30" />

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="rounded-full p-1.5 text-[#404944] hover:bg-black/5 transition"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>
        </form>

        {/* ── Category Filter Tabs (Meilisearch Style) ── */}
        <div className="flex gap-2 border-b border-[#bfc9c3]/20 bg-white/40 px-4 py-2.5 md:px-6 overflow-x-auto scrollbar-none">
          {FILTERS.map((tab) => {
            const isActive = activeTab === tab.value;
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value as any)}
                className={`flex items-center gap-1.5 rounded-full px-4.5 py-1.5 text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#064e3b] text-white shadow-md shadow-[#064e3b]/10"
                    : "bg-[#064e3b]/5 text-[#404944] hover:bg-[#064e3b]/10 hover:text-[#064e3b]"
                }`}
              >
                <Icon />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Content Area ── */}
        <div className="max-h-[60vh] overflow-y-auto space-y-6 p-5 md:p-7">
          {!query.trim() ? (
            <>
              {/* Pre-search: Trending */}
              <section>
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#404944]/70">
                  Trending Sekarang
                </h3>
                <div className="flex flex-wrap gap-2">
                  {TRENDING.map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setQuery(term);
                        inputRef.current?.focus();
                      }}
                      className="rounded-full border border-[#bfc9c3] bg-white px-4 py-2 text-sm text-[#191c1d] transition-all hover:border-[#064e3b] hover:text-[#064e3b] cursor-pointer shadow-sm"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </section>

              {/* Pre-search: Recommendation */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#404944]/70">
                    Rekomendasi Pilihan
                  </h3>
                  <Link
                    href="/produk"
                    onClick={onClose}
                    className="text-xs font-semibold text-[#064e3b] underline underline-offset-4 hover:opacity-80"
                  >
                    Lihat Semua Produk
                  </Link>
                </div>
                <div className="flex flex-col gap-1.5">
                  {QUICK_RESULTS.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/produk/${item.slug}`}
                      onClick={onClose}
                      className="group flex items-center gap-4 rounded-xl p-3 bg-white/40 transition-colors hover:bg-white"
                    >
                      {/* Thumbnail */}
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#edeeef] border border-[#bfc9c3]/20">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="56px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#edeeef] flex items-center justify-center text-gray-300">📷</div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="rounded bg-[#064e3b]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#064e3b]">
                            {item.sub}
                          </span>
                          <p className="font-semibold text-[#191c1d] group-hover:text-[#064e3b] transition-colors truncate">
                            {item.name}
                          </p>
                        </div>
                        <p className="text-xs text-[#707974] mt-0.5">
                          {item.category}
                        </p>
                      </div>
                      {/* Price */}
                      <p className="shrink-0 font-bold text-[#003527] text-sm">{item.price}</p>
                    </Link>
                  ))}
                </div>
              </section>
            </>
          ) : (
            /* Results present */
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#404944]/70">
                  Hasil Pencarian ({results.length})
                </h3>
              </div>

              {isLoading && results.length === 0 ? (
                /* Skeleton Loading Row */
                <div className="flex flex-col gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 rounded-xl p-3 bg-white/40 animate-pulse">
                      <div className="h-14 w-14 rounded-xl bg-[#edeeef]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-[#edeeef] rounded w-3/4" />
                        <div className="h-3 bg-[#edeeef] rounded w-1/4" />
                      </div>
                      <div className="h-5 bg-[#edeeef] rounded w-16" />
                    </div>
                  ))}
                </div>
              ) : results.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="text-4xl mb-3">🔍</span>
                  <p className="font-semibold text-[#404944] text-base">Tidak ada hasil ditemukan</p>
                  <p className="text-xs text-[#707974] mt-1">Coba gunakan kata kunci lain atau ubah filter kategori</p>
                </div>
              ) : (
                /* Results List */
                <div className="flex flex-col gap-1.5">
                  {results.map((item) => {
                    const badgeColors: Record<string, string> = {
                      produk: "bg-[#064e3b]/10 text-[#064e3b]",
                      sewa: "bg-blue-600/10 text-blue-700",
                      jasa: "bg-purple-600/10 text-purple-700",
                    };
                    const typeLabel: Record<string, string> = {
                      produk: "Produk",
                      sewa: "Sewa",
                      jasa: "Jasa",
                    };
                    return (
                      <Link
                        key={`${item.type}-${item.id}`}
                        href={item.link}
                        onClick={onClose}
                        className="group flex items-center gap-4 rounded-xl p-3 bg-white/40 transition-colors hover:bg-white"
                      >
                        {/* Thumbnail */}
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#edeeef] border border-[#bfc9c3]/20">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="56px"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#bfc9c3]">
                              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeColors[item.type] || "bg-[#707974]/10 text-[#707974]"}`}>
                              {typeLabel[item.type]}
                            </span>
                            <p className="font-semibold text-[#191c1d] group-hover:text-[#064e3b] transition-colors truncate">
                              {item.name}
                            </p>
                          </div>
                          <p className="text-xs text-[#707974] mt-0.5">
                            {item.category}
                          </p>
                        </div>
                        {/* Price */}
                        <p className="shrink-0 font-bold text-[#003527] text-sm">
                          {item.type === "sewa"
                            ? `${formatRupiah(item.price)}/hari`
                            : item.type === "jasa"
                            ? `Mulai ${formatRupiah(item.price)}`
                            : formatRupiah(item.price)}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-[#bfc9c3]/20 bg-[#064e3b]/5 px-5 py-3 md:px-7">
          <div className="flex gap-4 text-[11px] text-[#404944]/60">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-[#bfc9c3] bg-white px-1.5 py-0.5 text-[10px] shadow-sm">
                ESC
              </kbd>
              tutup
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-[#bfc9c3] bg-white px-1.5 py-0.5 text-[10px] shadow-sm">
                ENTER
              </kbd>
              buka hasil pertama
            </span>
          </div>
          <span className="text-xs font-semibold text-[#064e3b]">Jernih Creatife Search</span>
        </div>
      </div>

      {/* Inject slide-up and fade-in animations */}
      <style>{`
        @keyframes searchFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes searchSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}
