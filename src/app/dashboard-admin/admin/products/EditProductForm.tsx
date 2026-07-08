"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getCategoryOptions } from "@/lib/categories";
import { editProduct } from "@/lib/product-actions";
import type { ApiProduct } from "@/lib/api";

const categoryOptions = getCategoryOptions();

function Field({
  label, required = false, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#707974]">
        {label} {required && <span className="text-[#ba1a1a]">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-[#bfc9c3] bg-[#f8f9fa] px-4 py-2.5 text-sm text-[#191c1d] outline-none transition-all focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/20";

export default function EditProductForm({ product }: { product: ApiProduct }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Form state (pre-filled dari product) ────────────────────────────────────
  const [name, setName] = useState(product.name);
  const [categoryId, setCategoryId] = useState(product.categoryId ?? "");
  const [description, setDescription] = useState(
    // Strip badge prefix agar tidak tampil di textarea
    (product.description ?? "").replace(/^\[badge:[A-Z0-9]+\]\s*/, "")
  );
  const [price, setPrice] = useState(String(parseFloat(product.price)));
  const [oldPrice, setOldPrice] = useState(product.oldPrice ? String(parseFloat(product.oldPrice)) : "");
  const [stock, setStock] = useState(String(product.stock));
  const [isActive, setIsActive] = useState(product.isActive);
  const [badge, setBadge] = useState(() => {
    // Baca badge dari awal description jika ada
    const match = (product.description ?? "").match(/^\[badge:([A-Z0-9]+)\]/);
    return match ? match[1] : "";
  });
  const [imageUrls, setImageUrls] = useState<string[]>(product.images ?? []);
  const [imageInput, setImageInput] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState("");

  // ── Slug otomatis ───────────────────────────────────────────────────────────
  function toSlug(str: string) {
    return str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  // ── Gambar: tambah via URL ──────────────────────────────────────────────────
  function addImageByUrl() {
    const url = imageInput.trim();
    if (url && !imageUrls.includes(url)) {
      setImageUrls((prev) => [...prev, url]);
      setImageInput("");
    }
  }

  function removeImage(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length) { handleFileUpload(files); return; }
    const text = e.dataTransfer.getData("text/plain").trim();
    if (text.startsWith("http")) {
      setImageUrls((prev) => [...prev, text]);
    }
  }

  async function handleFileUpload(files: File[]) {
    if (!files.length) return;
    setUploadingImages(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload gagal");
      const data = await res.json();
      const urls: string[] = data.urls ?? [];
      if (urls.length) setImageUrls((prev) => [...prev, ...urls]);
    } catch {
      setError("Upload gambar gagal. Coba lagi.");
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Nama produk wajib diisi");
    if (!price || isNaN(Number(price)) || Number(price) <= 0)
      return setError("Harga jual tidak valid");
    if (Number(price) > 9_999_999_999)
      return setError("Harga terlalu besar. Maksimum adalah Rp 9.999.999.999");
    if (oldPrice && Number(oldPrice) > 9_999_999_999)
      return setError("Harga coret terlalu besar. Maksimum adalah Rp 9.999.999.999");

    startTransition(async () => {
      try {
        // Sisipkan badge ke awal description
        const descWithBadge = badge
          ? `[badge:${badge}] ${description.replace(/^\[badge:[A-Z0-9]+\]\s*/, "")}`
          : description.replace(/^\[badge:[A-Z0-9]+\]\s*/, "");

        await editProduct(product.id, {
          name: name.trim(),
          slug: toSlug(name),
          categoryId: categoryId || undefined,
          description: descWithBadge,
          price: Number(price),
          oldPrice: oldPrice ? Number(oldPrice) : undefined,
          stock: Number(stock) || 0,
          images: imageUrls,
          isActive,
        });
        router.push("/dashboard-admin/admin/products");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan produk");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ── Header ── */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <nav className="mb-1 flex items-center gap-1 text-xs text-[#707974]">
            <span>Admin</span>
            <span>›</span>
            <span>Produk</span>
            <span>›</span>
            <span className="font-bold text-[#003527]">Edit Produk</span>
          </nav>
          <h2 className="text-2xl font-bold text-[#191c1d]">Edit Produk</h2>
          <p className="mt-1 text-sm text-[#707974]">
            Perbarui informasi produk yang sudah ada.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard-admin/admin/products")}
            className="rounded-lg border border-[#bfc9c3] px-5 py-2.5 text-sm font-semibold text-[#191c1d] hover:bg-[#edeeef] transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-[#064e3b] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#043b2d] disabled:opacity-60 disabled:translate-y-0"
          >
            {isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-lg border border-[#ba1a1a]/20 bg-[#ffdad6] px-4 py-3 text-sm font-medium text-[#ba1a1a]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Kolom kiri (2/3) ── */}
        <div className="space-y-6 lg:col-span-2">

          {/* Informasi Dasar */}
          <section className="rounded-xl border border-[#e1e3e4] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003527]">info</span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#707974]">
                Informasi Dasar
              </h3>
            </div>
            <div className="space-y-4">
              <Field label="Nama Produk" required>
                <input
                  type="text" className={inputCls} placeholder="Contoh: Laptop Gaming ASUS ROG"
                  value={name} onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Slug URL (otomatis)">
                  <input
                    type="text" className={inputCls + " text-[#707974]"}
                    value={toSlug(name)} readOnly
                    placeholder="akan-terisi-otomatis"
                  />
                </Field>
                <Field label="Kategori">
                  <select
                    className={inputCls}
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categoryOptions.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        disabled={opt.isParent}
                        style={{ fontWeight: opt.isParent ? 700 : 400 }}
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          </section>

          {/* Deskripsi */}
          <section className="rounded-xl border border-[#e1e3e4] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003527]">description</span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#707974]">
                Deskripsi Produk
              </h3>
            </div>
            <textarea
              className={inputCls + " resize-none"}
              rows={6}
              placeholder="Tuliskan detail produk, fitur utama, keunggulan, dan informasi penting lainnya..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="mt-1.5 text-[11px] text-[#707974]">{description.length} karakter</p>
          </section>

          {/* Status */}
          <section className="rounded-xl border border-[#e1e3e4] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003527]">toggle_on</span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#707974]">
                Status Produk
              </h3>
            </div>
            <div className="flex items-center gap-4">
              {[{ val: true, label: "Aktif", desc: "Produk tampil di toko" }, { val: false, label: "Nonaktif", desc: "Produk disembunyikan" }].map((opt) => (
                <label key={String(opt.val)}
                  className={`flex flex-1 cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                    isActive === opt.val
                      ? opt.val ? "border-[#064e3b] bg-[#064e3b]/5" : "border-[#ba1a1a] bg-[#ba1a1a]/5"
                      : "border-[#e1e3e4] hover:border-[#bfc9c3]"
                  }`}>
                  <input type="radio" className="sr-only" checked={isActive === opt.val}
                    onChange={() => setIsActive(opt.val)} />
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    isActive === opt.val
                      ? opt.val ? "border-[#064e3b]" : "border-[#ba1a1a]"
                      : "border-[#bfc9c3]"
                  }`}>
                    {isActive === opt.val && (
                      <div className={`h-2 w-2 rounded-full ${opt.val ? "bg-[#064e3b]" : "bg-[#ba1a1a]"}`} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#191c1d]">{opt.label}</p>
                    <p className="text-xs text-[#707974]">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* ── Kolom kanan (1/3) ── */}
        <div className="space-y-6">

          {/* Media */}
          <section className="rounded-xl border border-[#e1e3e4] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003527]">photo_library</span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#707974]">
                Foto Produk
              </h3>
            </div>

            <div className="mb-3 flex gap-2">
              <input
                type="url" className={inputCls + " flex-1 text-xs"} placeholder="Paste URL gambar..."
                value={imageInput} onChange={(e) => setImageInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageByUrl(); } }}
              />
              <button type="button" onClick={addImageByUrl}
                className="rounded-lg bg-[#064e3b] px-3 py-2 text-xs font-bold text-white hover:bg-[#043b2d] transition-colors">
                + Tambah
              </button>
            </div>

            <div
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                dragActive ? "border-[#064e3b] bg-[#064e3b]/5" : "border-[#bfc9c3] hover:border-[#064e3b] hover:bg-[#f8f9fa]"
              }`}
            >
              <span className="material-symbols-outlined text-4xl text-[#bfc9c3] mb-2">
                {uploadingImages ? "hourglass_top" : "cloud_upload"}
              </span>
              <p className="text-xs font-semibold text-[#404944]">
                {uploadingImages ? "Mengupload..." : "Seret & lepas atau klik"}
              </p>
              <p className="mt-1 text-[10px] text-[#707974]">PNG, JPG hingga 10MB</p>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => handleFileUpload(Array.from(e.target.files ?? []))}
              />
            </div>

            {imageUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {imageUrls.map((url, i) => (
                  <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-[#e1e3e4] bg-[#edeeef]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`preview-${i}`} className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeImage(url)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 rounded bg-[#064e3b] px-1.5 py-0.5 text-[9px] font-bold text-white">Utama</span>
                    )}
                  </div>
                ))}
                {imageUrls.length < 6 && Array.from({ length: Math.min(3 - (imageUrls.length % 3), 3) }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square rounded-lg border border-dashed border-[#bfc9c3] bg-[#edeeef] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#bfc9c3] text-xl">add</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Harga & Stok */}
          <section className="rounded-xl border border-[#e1e3e4] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003527]">payments</span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#707974]">
                Harga & Stok
              </h3>
            </div>
            <div className="space-y-4">
              <Field label="Harga Jual (Rp)" required>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#707974]">Rp</span>
                  <input type="number" min="0" className={inputCls + " pl-9"}
                    placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
              </Field>
              <Field label="Harga Coret / Lama (Rp)">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#707974]">Rp</span>
                  <input type="number" min="0" className={inputCls + " pl-9"}
                    placeholder="Opsional" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} />
                </div>
              </Field>
              <Field label="Stok Tersedia" required>
                <input type="number" min="0" className={inputCls}
                  placeholder="1" value={stock} onChange={(e) => setStock(e.target.value)} />
              </Field>
            </div>
          </section>

          {/* Badge Promo */}
          <section className="rounded-xl border border-[#e1e3e4] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003527]">local_offer</span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#707974]">
                Badge Promo
              </h3>
            </div>
            <p className="text-xs text-[#707974] mb-4">Tampilkan badge di pojok gambar produk. Kosongkan jika tidak ada promo.</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { val: "", label: "Tidak Ada", bg: "bg-[#e1e3e4]", text: "text-[#707974]" },
                { val: "SALE", label: "SALE", bg: "bg-[#ba1a1a]", text: "text-white" },
                { val: "NEW", label: "NEW", bg: "bg-[#064e3b]", text: "text-white" },
                { val: "HOT", label: "HOT 🔥", bg: "bg-orange-500", text: "text-white" },
                { val: "DISKON", label: "DISKON", bg: "bg-[#1d4ed8]", text: "text-white" },
                { val: "TERBATAS", label: "TERBATAS", bg: "bg-[#7c3aed]", text: "text-white" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setBadge(opt.val)}
                  className={`rounded-lg py-2.5 text-xs font-bold transition-all border-2 ${
                    badge === opt.val
                      ? `${opt.bg} ${opt.text} border-transparent scale-105 shadow-md`
                      : "bg-white border-[#e1e3e4] text-[#707974] hover:border-[#bfc9c3]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {badge && (
              <div className="flex items-center gap-2 rounded-lg bg-[#f8f9fa] border border-[#e1e3e4] px-3 py-2">
                <span className="text-xs text-[#707974]">Preview:</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                  badge === "SALE" ? "bg-[#ba1a1a] text-white" :
                  badge === "NEW" ? "bg-[#064e3b] text-white" :
                  badge === "HOT" ? "bg-orange-500 text-white" :
                  badge === "DISKON" ? "bg-[#1d4ed8] text-white" :
                  badge === "TERBATAS" ? "bg-[#7c3aed] text-white" : ""
                }`}>{badge}</span>
                <span className="text-xs text-[#707974]">akan tampil di pojok gambar produk</span>
              </div>
            )}
          </section>

          {/* Tips */}
          <div className="rounded-xl border border-[#064e3b]/15 bg-[#064e3b]/5 p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#064e3b] text-xl">lightbulb</span>
              <p className="text-xs leading-relaxed text-[#003527]">
                <strong>Tips:</strong> Perubahan akan langsung tampil di toko setelah disimpan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="mt-6 flex gap-3 border-t border-[#e1e3e4] pt-5 lg:hidden">
        <button type="button" onClick={() => router.push("/dashboard-admin/admin/products")}
          className="flex-1 rounded-lg border border-[#bfc9c3] py-3 text-sm font-semibold text-[#191c1d]">
          Batal
        </button>
        <button type="submit" disabled={isPending}
          className="flex-1 rounded-lg bg-[#064e3b] py-3 text-sm font-semibold text-white disabled:opacity-60">
          {isPending ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
}
