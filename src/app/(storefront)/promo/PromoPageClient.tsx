"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatRupiah, type ApiPromo } from "@/lib/api";
import { resolveImageUrl } from "@/lib/image-url";

type Tab = "active" | "upcoming" | "expired";

const TABS: { key: Tab; label: string }[] = [
  { key: "active", label: "Promo Aktif" },
  { key: "upcoming", label: "Akan Datang" },
  { key: "expired", label: "Telah Berakhir" },
];

const SORTS: { key: string; label: string }[] = [
  { key: "newest", label: "Terbaru" },
  { key: "price_asc", label: "Harga Terendah" },
  { key: "price_desc", label: "Harga Tertinggi" },
  { key: "discount_desc", label: "Diskon Terbesar" },
];

function PromoCountdown({ endDate, expired }: { endDate: string; expired: boolean }) {
  const [left, setLeft] = useState(() => new Date(endDate).getTime() - Date.now());
  useEffect(() => {
    if (expired) return;
    const t = setInterval(() => {
      setLeft(new Date(endDate).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, [endDate, expired]);

  const diff = Math.max(0, left);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <span className="inline-flex items-center gap-1 tabular-nums text-xs font-bold text-white">
      <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7z" />
      </svg>
      {expired ? (
        "Berakhir"
      ) : (
        <>
          {d > 0 && <span>{pad(d)}h</span>}
          <span>{pad(h)}:{pad(m)}:{pad(s)}</span>
        </>
      )}
    </span>
  );
}

function PromoCard({ promo }: { promo: ApiPromo }) {
  const product = promo.product;
  if (!product) return null;
  const discount = promo.discountPercent;
  const hasDiscount = discount > 0 || (Number(promo.promoPrice) < Number(product.price));
  const soldOut = promo.quotaLeft === 0;
  const href = `/produk/${product.slug}`;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      {/* Gambar */}
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-[#f2f4f7]">
        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveImageUrl(product.images[0])}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-neutral-300">🛍️</div>
        )}
        <span className="absolute left-3 top-3 z-10 rounded-full bg-black px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md">
          {hasDiscount ? `-${Math.round(discount || ((Number(product.price) - Number(promo.promoPrice)) / Number(product.price)) * 100)}%` : "PROMO"}
        </span>
        <span className="absolute bottom-3 left-3 z-10 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-sm">
          <PromoCountdown endDate={promo.endsAt} expired={promo.status === "expired"} />
        </span>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-snug text-neutral-900">
          <Link href={href} className="hover:text-blue-600">{product.name}</Link>
        </h3>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-base font-extrabold text-neutral-900">
            {formatRupiah(promo.promoPrice)}
          </span>
          <span className="text-xs font-medium text-neutral-400 line-through">
            {formatRupiah(product.price)}
          </span>
        </div>

        {promo.quotaLeft !== null && (
          <p className={`mt-1 text-[11px] font-semibold ${soldOut ? "text-red-600" : "text-emerald-700"}`}>
            {soldOut ? "Stok promo habis" : `Sisa ${promo.quotaLeft.toLocaleString("id-ID")} stok`}
          </p>
        )}

        <Link
          href={href}
          className={`mt-3 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-extrabold transition ${
            soldOut
              ? "cursor-not-allowed bg-neutral-100 text-neutral-400"
              : "bg-[#064e3b] text-white hover:bg-[#043b2d]"
          }`}
        >
          {soldOut ? "Stok Habis" : "Beli Sekarang"}
          {!soldOut && (
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 18l7-6-7-6v12zM17 6h-2v12h2V6z" />
            </svg>
          )}
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <div className="aspect-[4/3] bg-neutral-200" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 rounded-full bg-neutral-200" />
        <div className="h-4 w-1/2 rounded-full bg-neutral-200" />
        <div className="h-9 w-full rounded-xl bg-neutral-200" />
      </div>
    </div>
  );
}

export default function PromoPageClient({
  active,
  upcoming,
  expired,
}: {
  active: ApiPromo[];
  upcoming: ApiPromo[];
  expired: ApiPromo[];
}) {
  const [tab, setTab] = useState<Tab>("active");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [visible, setVisible] = useState(12);

  const pool = tab === "active" ? active : tab === "upcoming" ? upcoming : expired;

  const filtered = useMemo(() => {
    let list = pool;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.product?.name.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q),
      );
    }
    const sorted = [...list];
    switch (sort) {
      case "price_asc":
        sorted.sort((a, b) => Number(a.promoPrice) - Number(b.promoPrice));
        break;
      case "price_desc":
        sorted.sort((a, b) => Number(b.promoPrice) - Number(a.promoPrice));
        break;
      case "discount_desc":
        sorted.sort((a, b) => b.discountPercent - a.discountPercent);
        break;
      default:
        sorted.sort((a, b) => new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime());
    }
    return sorted;
  }, [pool, search, sort]);

  const shown = filtered.slice(0, visible);
  const counts = { active: active.length, upcoming: upcoming.length, expired: expired.length };

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 px-4 py-8 md:px-8">
      {/* Header */}
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[#064e3b]">Penawaran Terbatas</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl">
          Promo & Diskon
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Diskon hingga 50% untuk produk pilihan. Jangan sampai kehabisan!
        </p>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setVisible(12);
            }}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              tab === t.key
                ? "bg-[#064e3b] text-white shadow-sm"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {t.label}
            <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${tab === t.key ? "bg-white/20" : "bg-neutral-200"}`}>
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar: search + sort */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisible(12);
            }}
            placeholder="Cari produk promo..."
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-800 outline-none transition focus:border-[#064e3b] focus:ring-1 focus:ring-[#064e3b]/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500">Urutkan</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-semibold text-neutral-800 outline-none transition focus:border-[#064e3b]"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-20 text-center">
          <span className="text-5xl">🎁</span>
          <h3 className="mt-4 text-lg font-bold text-neutral-800">Tidak ada promo ditemukan</h3>
          <p className="mt-1 max-w-sm text-sm text-neutral-500">
            Coba kata kunci lain atau lihat tab lainnya.
          </p>
          <button
            onClick={() => setSearch("")}
            className="mt-5 rounded-xl bg-[#064e3b] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#043b2d]"
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((promo) => (
              <PromoCard key={promo.id} promo={promo} />
            ))}
          </div>
          {visible < filtered.length && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setVisible((v) => v + 12)}
                className="rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50"
              >
                Muat Lebih Banyak ({filtered.length - visible} tersisa)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function PromoPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <div className="h-8 w-48 animate-pulse rounded-full bg-neutral-200" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}