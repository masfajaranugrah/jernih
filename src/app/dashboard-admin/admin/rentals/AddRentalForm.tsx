"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRentalItem } from "@/lib/rental-actions";
import { useToast } from "@/app/dashboard-admin/components/Toast";

const inputCls =
  "w-full bg-transparent border border-[#bfc9c3] rounded-lg px-4 py-2.5 text-sm text-[#191c1d] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all";

function toSlug(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function AddRentalForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { success, error: toastError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [deposit, setDeposit] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  function addImageByUrl() {
    const url = imageInput.trim();
    if (url && !imageUrls.includes(url)) { setImageUrls((p) => [...p, url]); setImageInput(""); }
  }
  function removeImage(url: string) { setImageUrls((p) => p.filter((u) => u !== url)); }

  async function handleFileUpload(files: File[]) {
    if (!files.length) return;
    setUploadingImages(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const urls: string[] = data.urls ?? [];
      if (urls.length) { setImageUrls((p) => [...p, ...urls]); success(`${urls.length} gambar diupload`); }
    } catch { toastError("Upload gagal", "Gunakan paste URL sebagai alternatif."); }
    finally { setUploadingImages(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length) { handleFileUpload(files); return; }
    const text = e.dataTransfer.getData("text/plain").trim();
    if (text.startsWith("http")) setImageUrls((p) => [...p, text]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toastError("Nama item wajib diisi");
    if (!pricePerDay || isNaN(Number(pricePerDay)) || Number(pricePerDay) <= 0)
      return toastError("Harga sewa per hari tidak valid");

    startTransition(async () => {
      try {
        await createRentalItem({
          name: name.trim(),
          slug: toSlug(name),
          description,
          pricePerDay: Number(pricePerDay),
          deposit: deposit ? Number(deposit) : undefined,
          images: imageUrls,
          isActive,
        });
        success("Item sewa berhasil disimpan!", `"${name.trim()}" telah ditambahkan.`);
        router.push("/dashboard-admin/admin/rentals");
      } catch (err: unknown) {
        toastError("Gagal menyimpan", err instanceof Error ? err.message : "Coba lagi.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-30 px-6 py-4 border-b border-[#e1e3e4] flex justify-between items-center -mx-6 mb-6">
        <div>
          <nav className="flex items-center gap-1 text-xs text-[#707974] mb-1">
            <span>Admin</span><span>›</span><span>Sewa</span><span>›</span>
            <span className="font-bold text-[#003527]">Tambah Baru</span>
          </nav>
          <h2 className="text-xl font-bold text-[#003527]">Tambah Item Sewa Baru</h2>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => router.push("/dashboard-admin/admin/rentals")}
            className="rounded-lg border border-[#bfc9c3] px-5 py-2.5 text-sm font-semibold text-[#191c1d] hover:bg-[#edeeef] transition-colors">
            Batal
          </button>
          <button type="submit" disabled={isPending}
            className="rounded-lg bg-[#064e3b] px-5 py-2.5 text-sm font-semibold text-white shadow-sm flex items-center gap-2 hover:bg-[#043b2d] transition-all disabled:opacity-60">
            <span className="material-symbols-outlined text-base">publish</span>
            {isPending ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </header>

      <div className="max-w-[800px] space-y-6">
        {/* Info */}
        <section className="bg-white rounded-xl border border-[#e1e3e4] p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#707974] mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003527]">info</span>
            Informasi Item
          </h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#707974]">
                Nama Item <span className="text-[#ba1a1a]">*</span>
              </label>
              <input type="text" className={inputCls} placeholder="Contoh: Kamera Sony A7III"
                value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#707974]">Slug URL</label>
              <input type="text" className={inputCls + " text-[#707974]"} value={toSlug(name)} readOnly />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#707974]">Deskripsi</label>
              <textarea className={inputCls + " resize-none"} rows={4}
                placeholder="Deskripsi item sewa..."
                value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-white rounded-xl border border-[#e1e3e4] p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#707974] mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003527]">payments</span>
            Harga & Status
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#707974]">
                Harga per Hari (Rp) <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#707974]">Rp</span>
                <input type="number" min="0" className={inputCls + " pl-9"} placeholder="0"
                  value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#707974]">Deposit (Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#707974]">Rp</span>
                <input type="number" min="0" className={inputCls + " pl-9"} placeholder="0"
                  value={deposit} onChange={(e) => setDeposit(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#e1e3e4]">
            <span className="text-sm font-semibold text-[#191c1d]">Aktif di Storefront</span>
            <button type="button" onClick={() => setIsActive((v) => !v)}
              className={`w-10 h-5 rounded-full relative transition-colors ${isActive ? "bg-[#064e3b]" : "bg-[#bfc9c3]"}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isActive ? "right-0.5" : "left-0.5"}`} />
            </button>
          </div>
        </section>

        {/* Images */}
        <section className="bg-white rounded-xl border border-[#e1e3e4] p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#707974] mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003527]">photo_library</span>
            Foto Item
          </h3>
          <div className="flex gap-2 mb-3">
            <input type="url" className={inputCls + " flex-1 text-xs"} placeholder="Paste URL gambar..."
              value={imageInput} onChange={(e) => setImageInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageByUrl(); } }} />
            <button type="button" onClick={addImageByUrl}
              className="rounded-lg bg-[#064e3b] px-3 py-2 text-xs font-bold text-white hover:bg-[#043b2d] transition-colors">
              + URL
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
              {uploadingImages ? "Mengupload..." : "Drag & Drop atau Klik"}
            </p>
            <p className="mt-1 text-[10px] text-[#707974]">PNG, JPG hingga 10MB</p>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => handleFileUpload(Array.from(e.target.files ?? []))} />
          </div>
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {imageUrls.map((url, i) => (
                <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-[#e1e3e4] bg-[#edeeef]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`preview-${i}`} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button type="button" onClick={() => removeImage(url)} className="text-white">
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </form>
  );
}
