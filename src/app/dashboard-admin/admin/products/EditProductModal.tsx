"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { editProduct } from "@/lib/product-actions";
import type { ApiProduct } from "@/lib/api";

const inputCls =
  "w-full rounded-lg border border-[#bfc9c3] bg-[#f8f9fa] px-4 py-2.5 text-sm text-[#191c1d] outline-none transition-all focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/20";

export default function EditProductModal({ product, onClose }: {
  product: ApiProduct;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [price, setPrice] = useState(String(parseFloat(product.price)));
  const [oldPrice, setOldPrice] = useState(product.oldPrice ? String(parseFloat(product.oldPrice)) : "");
  const [stock, setStock] = useState(String(product.stock));
  const [isActive, setIsActive] = useState(product.isActive);
  const [imageInput, setImageInput] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>(product.images ?? []);

  function toSlug(str: string) {
    return str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  function addImage() {
    const url = imageInput.trim();
    if (url && !imageUrls.includes(url)) {
      setImageUrls((prev) => [...prev, url]);
      setImageInput("");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Nama produk wajib diisi");
    if (!price || isNaN(Number(price)) || Number(price) <= 0)
      return setError("Harga tidak valid");

    startTransition(async () => {
      try {
        await editProduct(product.id, {
          name: name.trim(),
          slug: toSlug(name),
          description,
          price: Number(price),
          oldPrice: oldPrice ? Number(oldPrice) : undefined,
          stock: Number(stock) || 0,
          images: imageUrls,
          isActive,
        });
        router.refresh();
        onClose();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan perubahan");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e1e3e4] px-6 py-4">
          <h2 className="font-bold text-[#191c1d] text-lg">Edit Produk</h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-[#f3f4f5] transition-colors">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#707974]">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="rounded-lg bg-[#ffdad6] border border-[#ba1a1a]/20 px-4 py-3 text-sm text-[#ba1a1a]">
              {error}
            </div>
          )}

          {/* Nama */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#707974]">
              Nama Produk <span className="text-[#ba1a1a]">*</span>
            </label>
            <input type="text" className={inputCls} value={name}
              onChange={(e) => setName(e.target.value)} />
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#707974]">Deskripsi</label>
            <textarea className={inputCls + " resize-none"} rows={3}
              value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/* Harga */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#707974]">
                Harga Jual (Rp) <span className="text-[#ba1a1a]">*</span>
              </label>
              <input type="number" min="0" className={inputCls} value={price}
                onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#707974]">Harga Coret (Rp)</label>
              <input type="number" min="0" className={inputCls} placeholder="Opsional"
                value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} />
            </div>
          </div>

          {/* Stok & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#707974]">Stok</label>
              <input type="number" min="0" className={inputCls} value={stock}
                onChange={(e) => setStock(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#707974]">Status</label>
              <select className={inputCls} value={isActive ? "1" : "0"}
                onChange={(e) => setIsActive(e.target.value === "1")}>
                <option value="1">Aktif</option>
                <option value="0">Nonaktif</option>
              </select>
            </div>
          </div>

          {/* Gambar */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#707974]">Foto Produk</label>
            <div className="flex gap-2">
              <input type="url" className={inputCls + " flex-1 text-xs"} placeholder="Paste URL gambar..."
                value={imageInput} onChange={(e) => setImageInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }} />
              <button type="button" onClick={addImage}
                className="rounded-lg bg-[#064e3b] px-3 py-2 text-xs font-bold text-white hover:bg-[#043b2d] transition-colors">
                + Tambah
              </button>
            </div>
            {imageUrls.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {imageUrls.map((url, i) => (
                  <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-[#e1e3e4] bg-[#edeeef]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`img-${i}`} className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setImageUrls((p) => p.filter((u) => u !== url))}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-[#e1e3e4]">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-[#bfc9c3] py-2.5 text-sm font-semibold text-[#191c1d] hover:bg-[#f3f4f5] transition-colors">
              Batal
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 rounded-lg bg-[#064e3b] py-2.5 text-sm font-semibold text-white hover:bg-[#043b2d] disabled:opacity-60 transition-colors">
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
