"use client";

import Link from "next/link";
import { formatRupiah } from "@/lib/api";
import type { ChatProduct } from "./types";

/**
 * Card produk di dalam chat — klik mengarah ke halaman produk.
 * Varian compact dipakai sebagai preview di composer (dengan tombol X).
 */
export default function ProductCard({
  product,
  compact = false,
  onRemove,
}: {
  product: ChatProduct;
  compact?: boolean;
  onRemove?: () => void;
}) {
  const image = product.images?.[0];

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-2 pr-3">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="h-12 w-12 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
            <span className="material-symbols-outlined text-gray-400">image</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-800">
            {product.name}
          </p>
          <p className="text-xs font-bold text-[#003527]">
            {formatRupiah(product.price)}
          </p>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Hapus produk"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <Link
      href={`/produk/${product.slug}`}
      className="block w-56 overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-md"
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={product.name}
          className="h-32 w-full object-cover"
        />
      ) : (
        <div className="flex h-32 w-full items-center justify-center bg-gray-100">
          <span className="material-symbols-outlined text-3xl text-gray-400">
            image
          </span>
        </div>
      )}
      <div className="p-3">
        <p className="line-clamp-2 text-sm font-semibold text-gray-800">
          {product.name}
        </p>
        <p className="mt-1 text-sm font-bold text-[#003527]">
          {formatRupiah(product.price)}
        </p>
        <p className="mt-1 text-xs text-gray-400">Ketuk untuk lihat produk</p>
      </div>
    </Link>
  );
}
