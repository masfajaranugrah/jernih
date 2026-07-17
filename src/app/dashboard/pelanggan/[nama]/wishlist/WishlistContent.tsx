"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addToCart, emitWishlistChange } from "@/lib/cart";

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

export default function WishlistContent() {
  const [items, setItems] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/wishlist", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message ?? "Gagal memuat wishlist");
        }
        return res.json();
      })
      .then((data: WishlistEntry[]) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  async function removeItem(productId: string) {
    setRemoving(productId);
    try {
      const res = await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
      if (res.ok) {
        // Delay singkat untuk animasi fade-out
        setTimeout(() => {
          setItems((prev) => prev.filter((item) => item.productId !== productId));
          setRemoving(null);
          emitWishlistChange(); // update badge navbar
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

  return (
    <>
      {/* Summary Header */}
      <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <span className="font-semibold text-xs uppercase tracking-widest text-[#003527] mb-2 block">
            Koleksi Favorit Anda
          </span>
          <h3 className="text-[#191c1d] font-bold tracking-tight"
            style={{ fontSize: "clamp(36px, 5vw, 48px)", lineHeight: "1.1", letterSpacing: "-0.02em" }}>
            Wishlist Saya
          </h3>
          {!loading && !error && (
            <p className="text-[#707974] text-lg mt-2 max-w-2xl">
              Anda menyimpan{" "}
              <span className="font-bold text-[#003527]">{items.length} item</span>{" "}
              untuk dibeli nanti.
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24 gap-3 text-[#707974]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#064e3b] border-t-transparent" />
          <span className="text-sm font-medium">Memuat wishlist...</span>
        </div>
      ) : error ? (
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
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {items.map((entry) => (
            <article
              key={entry.id}
              className="bg-white rounded-xl overflow-hidden flex flex-col"
              style={{
                transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, opacity 0.4s ease",
                opacity: removing === entry.productId ? 0 : 1,
                transform: removing === entry.productId ? "scale(0.9)" : undefined,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0px 12px 40px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Image area */}
              <div className="relative aspect-square group overflow-hidden bg-[#edeeef]">
                <Link href={`/produk/${entry.product.slug}`}>
                  {entry.product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={entry.product.images[0]}
                      alt={entry.product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#bfc9c3]">
                      <span className="material-symbols-outlined text-6xl">image</span>
                    </div>
                  )}
                </Link>
                <button
                  onClick={() => removeItem(entry.productId)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-[#ba1a1a] hover:bg-white transition-colors shadow-sm"
                  aria-label="Hapus dari wishlist"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
                {entry.product.stock === 0 && (
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 text-[10px] font-bold uppercase rounded-full bg-[#ba1a1a] text-white">
                      Stok Habis
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-6 flex flex-col flex-grow">
                <p className="text-xs font-medium text-[#707974] mb-1 uppercase tracking-wider">
                  {entry.product.category?.name ?? "Produk"}
                </p>
                <Link href={`/produk/${entry.product.slug}`}>
                  <h4 className="text-[#191c1d] font-semibold text-xl leading-tight mb-3 hover:text-[#003527] transition-colors">
                    {entry.product.name}
                  </h4>
                </Link>
                <p className="text-[#003527] font-semibold text-2xl mb-6">
                  {formatRupiah(entry.product.price)}
                </p>
                <button
                  onClick={() => handleAddToCart(entry)}
                  disabled={entry.product.stock === 0}
                  className={`mt-auto w-full py-3 font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    addedId === entry.productId
                      ? "bg-[#b0f0d6] text-[#003527]"
                      : "bg-[#003527] text-white hover:bg-[#064e3b]"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {addedId === entry.productId ? "check_circle" : "add_shopping_cart"}
                  </span>
                  {addedId === entry.productId ? "Ditambahkan" : "Tambah ke Keranjang"}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
