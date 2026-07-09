"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getCategoryOptions } from "@/lib/categories";
import { createProduct } from "@/lib/product-actions";
import { useToast } from "@/app/dashboard-admin/components/Toast";

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

export default function AddProductForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error: toastError } = useToast();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [material, setMaterial] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [weight, setWeight] = useState("");
  const [color, setColor] = useState("");
  const [warranty, setWarranty] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);       // file belum diupload
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]); // blob URL untuk preview
  const [imageInput, setImageInput] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [badge, setBadge] = useState("");

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

  function removePending(index: number) {
    URL.revokeObjectURL(pendingPreviews[index]); // bebaskan memory blob
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    setPendingPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Drag & drop (simulasi — tampilkan preview dari URL yang di-drag) ─────────
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const text = e.dataTransfer.getData("text/plain").trim();
    if (text.startsWith("http")) {
      setImageUrls((prev) => [...prev, text]);
    }
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) return toastError("Nama produk wajib diisi");
    if (!categoryId) return toastError("Kategori belum dipilih");
    if (!price || isNaN(Number(price)) || Number(price) <= 0)
      return toastError("Harga tidak valid", "Masukkan harga jual yang benar");
    if (Number(price) > 9_999_999_999)
      return toastError("Harga terlalu besar", "Maksimum harga adalah Rp 9.999.999.999");
    if (oldPrice && Number(oldPrice) > 9_999_999_999)
      return toastError("Harga coret terlalu besar", "Maksimum harga adalah Rp 9.999.999.999");

    startTransition(async () => {
      // ── Upload pending files dulu baru simpan ──────────────────────────
      let finalImageUrls = [...imageUrls];

      if (pendingFiles.length > 0) {
        setUploadingImages(true);
        try {
          const formData = new FormData();
          pendingFiles.forEach((file) => formData.append("files", file));
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) throw new Error("Server upload error");
          const data = await res.json();
          const uploadedUrls: string[] = data.urls ?? [];
          finalImageUrls = [...finalImageUrls, ...uploadedUrls];
          // Cleanup blob URLs
          pendingPreviews.forEach((p) => URL.revokeObjectURL(p));
          setPendingFiles([]);
          setPendingPreviews([]);
        } catch (uploadErr) {
          setUploadingImages(false);
          toastError("Gagal upload gambar", "Coba lagi atau gunakan URL gambar.");
          return;
        } finally {
          setUploadingImages(false);
        }
      }

      const descWithBadge = badge
        ? `[badge:${badge}] ${description}`
        : description;
      const result = await createProduct({
        name: name.trim(),
        slug: toSlug(name),
        categoryId,
        description: descWithBadge,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : undefined,
        stock: Number(stock) || 0,
        images: finalImageUrls,
        isActive: true,
      });

      if (!result.success) {
        toastError("Gagal menyimpan produk", result.error);
        return;
      }

      success("Produk berhasil disimpan!", `"${name.trim()}" telah ditambahkan ke katalog.`);
      router.push("/dashboard-admin/admin/products");
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
            <span className="font-bold text-[#003527]">Tambah Baru</span>
          </nav>
          <h2 className="text-2xl font-bold text-[#191c1d]">Tambah Produk Baru</h2>
          <p className="mt-1 text-sm text-[#707974]">
            Isi informasi lengkap produk untuk ditampilkan di marketplace.
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
            disabled={isPending || uploadingImages}
            className="rounded-lg bg-[#064e3b] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#043b2d] disabled:opacity-60 disabled:translate-y-0"
          >
            {uploadingImages ? "Mengupload gambar..." : isPending ? "Menyimpan..." : "Simpan Produk"}
          </button>
        </div>
      </div>

      {/* Error — dihapus, pakai toast */}

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
                <Field label="Kategori" required>
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

          {/* Spesifikasi */}
          <section className="rounded-xl border border-[#e1e3e4] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003527]">straighten</span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#707974]">
                Spesifikasi
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <Field label="Material">
                <input type="text" className={inputCls} placeholder="Aluminium, Plastik, dll" value={material} onChange={(e) => setMaterial(e.target.value)} />
              </Field>
              <Field label="Dimensi (cm)">
                <input type="text" className={inputCls} placeholder="30 x 20 x 5" value={dimensions} onChange={(e) => setDimensions(e.target.value)} />
              </Field>
              <Field label="Berat (kg)">
                <input type="text" className={inputCls} placeholder="1.5" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </Field>
              <Field label="Warna">
                <input type="text" className={inputCls} placeholder="Hitam, Putih, dll" value={color} onChange={(e) => setColor(e.target.value)} />
              </Field>
              <Field label="Garansi">
                <input type="text" className={inputCls} placeholder="1 Tahun resmi" value={warranty} onChange={(e) => setWarranty(e.target.value)} />
              </Field>
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

            {/* Input URL gambar */}
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

            {/* Drop zone */}
            <div
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                dragActive
                  ? "border-[#064e3b] bg-[#064e3b]/5"
                  : "border-[#bfc9c3] hover:border-[#064e3b] hover:bg-[#f8f9fa]"
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
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  if (!files.length) return;
                  // Buat blob URL hanya untuk preview — belum upload ke server
                  const previews = files.map((f) => URL.createObjectURL(f));
                  setPendingFiles((prev) => [...prev, ...files]);
                  setPendingPreviews((prev) => [...prev, ...previews]);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              />
            </div>

            {/* Preview grid */}
            {(imageUrls.length > 0 || pendingPreviews.length > 0) && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {/* Gambar sudah tersimpan (URL permanen) */}
                {imageUrls.map((url, i) => (
                  <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-[#e1e3e4] bg-[#edeeef]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`preview-${i}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                    {i === 0 && pendingPreviews.length === 0 && (
                      <span className="absolute bottom-1 left-1 rounded bg-[#064e3b] px-1.5 py-0.5 text-[9px] font-bold text-white">Utama</span>
                    )}
                  </div>
                ))}

                {/* Gambar pending (belum diupload, blob URL) */}
                {pendingPreviews.map((preview, i) => (
                  <div key={preview} className="group relative aspect-square overflow-hidden rounded-lg border-2 border-dashed border-[#064e3b]/40 bg-[#edeeef]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt={`pending-${i}`} className="h-full w-full object-cover opacity-80" />
                    <button
                      type="button"
                      onClick={() => removePending(i)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                    {imageUrls.length === 0 && i === 0 && (
                      <span className="absolute bottom-1 left-1 rounded bg-[#064e3b] px-1.5 py-0.5 text-[9px] font-bold text-white">Utama</span>
                    )}
                    {/* Badge "belum disimpan" */}
                    <span className="absolute top-1 left-1 rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-white">Pending</span>
                  </div>
                ))}

                {/* Slot kosong */}
                {(imageUrls.length + pendingPreviews.length) < 6 &&
                  Array.from({ length: Math.min(3 - ((imageUrls.length + pendingPreviews.length) % 3), 3) }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square rounded-lg border border-dashed border-[#bfc9c3] bg-[#edeeef] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#bfc9c3] text-xl">add</span>
                    </div>
                  ))
                }
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
                  <input
                    type="number" min="0" className={inputCls + " pl-9"}
                    placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </Field>
              <Field label="Harga Coret / Lama (Rp)">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#707974]">Rp</span>
                  <input
                    type="number" min="0" className={inputCls + " pl-9"}
                    placeholder="Opsional" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)}
                  />
                </div>
              </Field>
              <Field label="Stok Tersedia" required>
                <input
                  type="number" min="0" className={inputCls}
                  placeholder="1" value={stock} onChange={(e) => setStock(e.target.value)}
                />
              </Field>
            </div>
          </section>

          {/* Badge Promo */}
          <section className="rounded-xl border border-[#e1e3e4] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003527]">local_offer</span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#707974]">Badge Promo</h3>
            </div>
            <p className="text-xs text-[#707974] mb-4">Tampilkan badge di pojok gambar produk.</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { val: "", label: "Tidak Ada", bg: "bg-[#e1e3e4]", text: "text-[#707974]" },
                { val: "SALE", label: "SALE", bg: "bg-[#ba1a1a]", text: "text-white" },
                { val: "NEW", label: "NEW", bg: "bg-[#064e3b]", text: "text-white" },
                { val: "HOT", label: "HOT 🔥", bg: "bg-orange-500", text: "text-white" },
                { val: "DISKON", label: "DISKON", bg: "bg-[#1d4ed8]", text: "text-white" },
                { val: "TERBATAS", label: "TERBATAS", bg: "bg-[#7c3aed]", text: "text-white" },
              ].map((opt) => (
                <button key={opt.val} type="button" onClick={() => setBadge(opt.val)}
                  className={`rounded-lg py-2.5 text-xs font-bold transition-all border-2 ${
                    badge === opt.val
                      ? `${opt.bg} ${opt.text} border-transparent scale-105 shadow-md`
                      : "bg-white border-[#e1e3e4] text-[#707974] hover:border-[#bfc9c3]"
                  }`}>
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
                  "bg-[#7c3aed] text-white"
                }`}>{badge}</span>
              </div>
            )}
          </section>

          {/* Tips */}
          <div className="rounded-xl border border-[#064e3b]/15 bg-[#064e3b]/5 p-4">            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#064e3b] text-xl">lightbulb</span>
              <p className="text-xs leading-relaxed text-[#003527]">
                <strong>Tips:</strong> Produk dengan foto berkualitas tinggi dan deskripsi lengkap memiliki konversi lebih tinggi. Gunakan minimal 3 foto dari sudut berbeda.
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
        <button type="submit" disabled={isPending || uploadingImages}
          className="flex-1 rounded-lg bg-[#064e3b] py-3 text-sm font-semibold text-white disabled:opacity-60">
          {uploadingImages ? "Mengupload..." : isPending ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
}
