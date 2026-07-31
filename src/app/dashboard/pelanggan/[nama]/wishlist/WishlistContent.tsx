"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart, emitWishlistChange } from "@/lib/cart";
import { getToken } from "@/lib/auth";
import { WishlistSkeleton } from "./loading";

type WishlistEntry = {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: string;
    stock: number;
    images: string[];
    category?: { name: string } | null;
  };
};

function formatRupiah(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return "Rp" + (isNaN(num) ? 0 : num).toLocaleString("id-ID");
}

// ── Cache wishlist di sessionStorage ──
const WISHLIST_CACHE_KEY = "mh_wishlist_cache";
const WISHLIST_CACHE_TTL = 120_000; // 2 menit

function getCachedWishlist(): WishlistEntry[] | null {
  try {
    const raw = sessionStorage.getItem(WISHLIST_CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > WISHLIST_CACHE_TTL) {
      sessionStorage.removeItem(WISHLIST_CACHE_KEY);
      return null;
    }
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

function setCachedWishlist(data: WishlistEntry[]) {
  try {
    sessionStorage.setItem(
      WISHLIST_CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {}
}

function clearWishlistCache() {
  try {
    sessionStorage.removeItem(WISHLIST_CACHE_KEY);
  } catch {}
}

export default function WishlistContent() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  const loadWishlist = useCallback(() => {
    // Cek cache dulu untuk instant load
    const cached = getCachedWishlist();
    if (cached) {
      setItems(cached);
      setLoading(false);
      // Background refresh tanpa spinner
      fetch("/api/wishlist", { cache: "no-store" })
        .then(async (res) => {
          if (res.status === 401) {
            clearWishlistCache();
            router.push("/dashboard/pelanggan/login");
            return null;
          }
          if (!res.ok) throw new Error("Failed to update");
          return res.json();
        })
        .then((data: unknown) => {
          const items = (data as { items?: WishlistEntry[] })?.items;
          if (items && Array.isArray(items)) {
            setItems(items);
            setCachedWishlist(items);
          }
        })
        .catch(() => {});
      return;
    }

    // Tidak ada cache — fetch fresh data
    let cancelled = false;
    fetch("/api/wishlist", { cache: "no-store" })
      .then(async (res) => {
        if (res.status === 401) {
          clearWishlistCache();
          router.push("/dashboard/pelanggan/login");
          return null;
        }
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message ?? "Gagal memuat wishlist");
        }
        return res.json();
      })
      .then((data: unknown) => {
        if (!cancelled && data) {
          const items = (data as { items?: WishlistEntry[] })?.items;
          if (items && Array.isArray(items)) {
            setItems(items);
            setCachedWishlist(items);
          }
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
  }, [router]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      // ⏳ Grace period 5 detik sebelum redirect ke login.
      // Token mungkin belum terbaca saat render pertama (sedang di-refresh).
      // Kalau token sudah ada setelah 5 detik, lanjut muat wishlist.
      const timer = setTimeout(() => {
        if (!getToken()) {
          router.push("/dashboard/pelanggan/login");
        } else {
          loadWishlist();
        }
      }, 5000);
      return () => clearTimeout(timer);
    }

    loadWishlist();
  }, [router, loadWishlist]);

  async function removeItem(productId: string) {
    setRemoving(productId);
    try {
      const res = await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
      if (res.ok) {
        clearWishlistCache();
        setTimeout(() => {
          setItems((prev) => prev.filter((item) => item.productId !== productId));
          setRemoving(null);
          emitWishlistChange();
        }, 400);
        return;
      }
    } catch {}
    setRemoving(null);
  }

  function handleAddToCart(entry: WishlistEntry) {
    addToCart({
      productId: entry.product.id,
      name: entry.product.name,
      slug: entry.product.slug,
      image: entry.product.images[0] ?? "/placeholder.png",
      price: parseFloat(entry.product.price) || 0,
      quantity: 1,
      typeName: null,
    });
    setAddedId(entry.productId);
    setTimeout(() => setAddedId(null), 2000);
  }

  if (loading) {
    return <WishlistSkeleton />;
  }

  return (
    <>
      {/* Summary Header */}
      <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <span className="font-semibold text-[10px] sm:text-xs uppercase tracking-widest text-[#003527] mb-1.5 sm:mb-2 block">
            Koleksi Favorit Anda
          </span>
          <h3 className="text-[#191c1d] font-bold tracking-tight"
            style={{ fontSize: "clamp(24px, 4vw, 32px)", lineHeight: "1.15", letterSpacing: "-0.02em" }}>
            Wishlist Saya
          </h3>
          {!error && (
            <p className="text-[#707974] text-sm sm:text-base mt-2 max-w-2xl">
              Anda menyimpan{" "}
              <span className="font-bold text-[#003527]">{items.length} item</span>{" "}
              untuk dibeli nanti.
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      {error ? (
        <div className="rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/20 px-4 py-3 text-sm font-semibold text-[#93000a]">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="material-symbols-outlined text-6xl text-[#bfc9c3] mb-4">favorite_border</span>
          <p className="text-[#707974] text-base">Wishlist Anda masih kosong.</p>
          <Link
            href="/produk"
            className="mt-6 rounded-lg bg-[#003527] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#064e3b]"
          >
            Jelajahi Produk
          </Link>
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
          {items.map((entry) => (
            <article
              key={entry.id}
              className="group relative flex h-full flex-col justify-between rounded-[28px] bg-white p-3.5 sm:p-4 shadow-xs border border-neutral-100"
            >
              {/* Image area */}
              <Link href={`/produk/${entry.product.slug}`} className="block relative aspect-square w-full overflow-hidden rounded-[22px] bg-[#f2f4f7] p-3 transition-colors group-hover:bg-[#ebece8]">
                {entry.product.stock === 0 && (
                  <div className="absolute top-2.5 left-2.5 z-10 rounded-full bg-black px-3 py-1 text-[10px] font-extrabold text-white shadow-md uppercase tracking-wider">
                    STOK HABIS
                  </div>
                )}
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeItem(entry.productId); }}
                  className="absolute top-2.5 right-2.5 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-xs cursor-pointer text-[#dc2626]"
                  aria-label="Hapus dari wishlist"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                </button>
                {entry.product.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.product.images[0]}
                    alt={entry.product.name}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300">
                    <span className="text-4xl">📷</span>
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="mt-3 flex flex-col px-1">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
                  <span className="uppercase tracking-wider text-[11px] font-extrabold text-neutral-400 truncate max-w-[65%]">
                    {entry.product.category?.name ?? "PRODUK"}
                  </span>
                  <button
                    onClick={() => handleAddToCart(entry)}
                    disabled={entry.product.stock === 0}
                    className={`flex items-center gap-1 font-bold text-neutral-800 px-2 py-1 rounded-md text-[11px] transition-colors ${
                      addedId === entry.productId
                        ? "bg-[#b0f0d6] text-[#003527]"
                        : "bg-neutral-100/80 hover:bg-neutral-200 hover:text-neutral-900"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                    <span>{addedId === entry.productId ? "OK" : "Cart"}</span>
                  </button>
                </div>

                <Link href={`/produk/${entry.product.slug}`} className="mt-1">
                  <h4 className="line-clamp-1 font-bold text-sm sm:text-base text-neutral-900 group-hover:text-blue-600 transition-colors">
                    {entry.product.name}
                  </h4>
                </Link>

                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="font-extrabold text-sm sm:text-base text-neutral-900">
                    {formatRupiah(entry.product.price)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
