"use client";

import { useEffect, useRef, useState } from "react";
import { formatRupiah } from "@/lib/api";
import type { ChatProduct } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

/**
 * Modal pemilih produk untuk chat (khusus admin).
 * Cari produk → klik Pilih → produk masuk composer sebagai card.
 */
export default function ProductPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (product: ChatProduct) => void;
}) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ChatProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch produk saat modal dibuka / kata kunci berubah (debounce 300ms)
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ limit: "20" });
      if (search.trim()) params.set("search", search.trim());
      fetch(`${API}/products?${params}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          const list = (d?.data ?? []) as Array<{
            id: string;
            name: string;
            slug: string;
            price: number;
            images?: string[];
          }>;
          setProducts(
            list.map((p) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              price: p.price,
              images: p.images ?? [],
            })),
          );
        })
        .catch(() => setProducts([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [open, search]);

  // Fokus ke input pencarian + tutup dengan Escape
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[70vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e1e3e4] px-5 py-4">
          <h3 className="font-semibold text-[#191c1d]">Kirim Produk</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
            aria-label="Tutup"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-[#e1e3e4] p-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#404944]">
              search
            </span>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk..."
              className="w-full rounded-lg border-none bg-[#e1e3e4] py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:bg-white focus:ring-1 focus:ring-[#003527]"
            />
          </div>
        </div>

        {/* Product list */}
        <div className="flex-1 overflow-y-auto p-3">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#003527]/20 border-t-[#003527]" />
            </div>
          )}
          {!loading && products.length === 0 && (
            <p className="py-10 text-center text-sm text-[#707974]">
              {search ? "Produk tidak ditemukan" : "Belum ada produk"}
            </p>
          )}
          {!loading &&
            products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-[#f3f4f5]"
              >
                {p.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <span className="material-symbols-outlined text-gray-400">image</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#191c1d]">{p.name}</p>
                  <p className="text-xs font-bold text-[#003527]">{formatRupiah(p.price)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(p);
                    onClose();
                  }}
                  className="shrink-0 rounded-full bg-[#003527] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#004d38]"
                >
                  Pilih
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
