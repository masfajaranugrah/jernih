"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRupiah, type ApiProduct } from "@/lib/api";
import { adminApi } from "@/lib/admin-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ProductsTable({ products }: { products: ApiProduct[] }) {
  const queryClient = useQueryClient();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminApi(`products/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });

  const confirmProduct = products.find((p) => p.id === confirmId);

  function handleDelete(id: string) {
    setConfirmId(null);
    deleteMutation.mutate(id);
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-[#e1e3e4] bg-[#f8f9fa] text-[#707974]">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Produk</th>
              <th className="px-4 py-3 text-left font-semibold">Kategori</th>
              <th className="px-4 py-3 text-right font-semibold">Harga</th>
              <th className="px-4 py-3 text-center font-semibold">Stok</th>
              <th className="px-4 py-3 text-center font-semibold">Status</th>
              <th className="px-4 py-3 text-center font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f5]">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-[#f8f9fa] transition-colors">
                {/* Produk */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#edeeef]">
                      {product.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center">
                          <span className="material-symbols-outlined text-[#bfc9c3] text-2xl">image</span>
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-[#191c1d] line-clamp-1">{product.name}</p>
                      <p className="text-[11px] text-[#707974] mt-0.5">/{product.slug}</p>
                    </div>
                  </div>
                </td>
                {/* Kategori */}
                <td className="px-4 py-4 text-[#404944]">
                  {product.category?.name ?? "-"}
                </td>
                {/* Harga */}
                <td className="px-4 py-4 text-right">
                  <p className="font-bold text-[#003527]">{formatRupiah(product.price)}</p>
                  {product.oldPrice && (
                    <p className="text-[11px] text-[#707974] line-through">{formatRupiah(product.oldPrice)}</p>
                  )}
                </td>
                {/* Stok */}
                <td className="px-4 py-4 text-center">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    product.stock === 0
                      ? "bg-[#ffdad6] text-[#ba1a1a]"
                      : product.stock <= 5
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {product.stock === 0 ? "Habis" : product.stock}
                  </span>
                </td>
                {/* Status */}
                <td className="px-4 py-4 text-center">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    product.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-[#e1e3e4] text-[#707974]"
                  }`}>
                    {product.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                {/* Aksi */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <Link
                      href={`/produk/${product.slug}`}
                      target="_blank"
                      className="rounded-lg p-2 text-[#707974] hover:bg-[#edeeef] hover:text-[#003527] transition-colors"
                      title="Lihat di toko"
                    >
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                    </Link>
                    <Link
                      href={`/dashboard-admin/admin/products/${product.id}`}
                      className="rounded-lg p-2 text-[#707974] hover:bg-[#e8f0fe] hover:text-[#1a73e8] transition-colors"
                      title="Edit produk"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </Link>
                    <button
                      onClick={() => setConfirmId(product.id)}
                      title="Hapus produk"
                      className="rounded-lg p-2 text-[#707974] hover:bg-[#ffdad6] hover:text-[#ba1a1a] transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirm Modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#ffdad6] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#ba1a1a]">delete</span>
              </div>
              <div>
                <h3 className="font-bold text-[#191c1d]">Hapus Produk?</h3>
                <p className="text-xs text-[#707974]">Tindakan ini tidak bisa dibatalkan.</p>
              </div>
            </div>
            {confirmProduct && (
              <p className="mt-3 text-sm text-[#404944] bg-[#f8f9fa] rounded-xl px-4 py-2.5">
                &ldquo;<span className="font-semibold">{confirmProduct.name}</span>&rdquo; akan dihapus permanen.
              </p>
            )}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 rounded-xl border border-[#bfc9c3] py-2.5 text-sm font-semibold text-[#191c1d] hover:bg-[#edeeef] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmId)}
                className="flex-1 rounded-xl bg-[#ba1a1a] py-2.5 text-sm font-semibold text-white hover:bg-[#93000a] transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
