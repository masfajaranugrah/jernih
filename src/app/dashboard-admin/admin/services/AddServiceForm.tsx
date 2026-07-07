"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createService } from "@/lib/service-actions";
import { useToast } from "@/app/dashboard-admin/components/Toast";

const inputCls =
  "w-full bg-transparent border border-[#bfc9c3] rounded-lg px-4 py-2.5 text-sm text-[#191c1d] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all";

function toSlug(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

interface PackageTier {
  name: string;
  price: string;
  features: string;
  recommended: boolean;
}

const DEFAULT_TIER: PackageTier = { name: "", price: "", features: "", recommended: false };

export default function AddServiceForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { success, error: toastError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Basic fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [methodology, setMethodology] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [unit, setUnit] = useState("project");
  const [isActive, setIsActive] = useState(true);

  // Images
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Package tiers
  const [tiers, setTiers] = useState<PackageTier[]>([{ ...DEFAULT_TIER }]);

  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // ── Images ──────────────────────────────────────────────────────────────────
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

  // ── Tiers ────────────────────────────────────────────────────────────────────
  function addTier() { setTiers((p) => [...p, { ...DEFAULT_TIER }]); }
  function removeTier(i: number) { setTiers((p) => p.filter((_, idx) => idx !== i)); }
  function updateTier(i: number, field: keyof PackageTier, value: string | boolean) {
    setTiers((p) => p.map((t, idx) => idx === i ? { ...t, [field]: value } : t));
  }

  // ── Tags ─────────────────────────────────────────────────────────────────────
  function addTag() {
    const t = tagInput.trim().toUpperCase();
    if (t && !tags.includes(t)) { setTags((p) => [...p, t]); setTagInput(""); }
  }
  function removeTag(t: string) { setTags((p) => p.filter((x) => x !== t)); }

  // ── Submit ───────────────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toastError("Nama jasa wajib diisi");
    if (!priceFrom || isNaN(Number(priceFrom)) || Number(priceFrom) <= 0)
      return toastError("Harga tidak valid");

    // Encode tiers into description
    const validTiers = tiers.filter((t) => t.name.trim());
    const tiersData = validTiers.map((t) => ({
      name: t.name,
      price: t.price ? Number(t.price.replace(/\D/g, "")) : null,
      recommended: t.recommended,
      features: t.features.split("\n").map((f) => f.trim()).filter(Boolean),
    }));

    const fullDescription = [
      description,
      tiersData.length ? `||PACKAGES_START||${JSON.stringify(tiersData)}||PACKAGES_END||` : "",
    ].filter(Boolean).join("\n");

    startTransition(async () => {
      try {
        await createService({
          name: name.trim(),
          slug: toSlug(name),
          description: fullDescription,
          priceFrom: Number(priceFrom),
          unit,
          images: imageUrls,
          isActive,
        });
        success("Jasa berhasil disimpan!", `"${name.trim()}" telah ditambahkan.`);
        router.push("/dashboard-admin/admin/services");
      } catch (err: unknown) {
        toastError("Gagal menyimpan", err instanceof Error ? err.message : "Coba lagi.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Header sticky */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-30 px-6 py-4 border-b border-[#e1e3e4] flex justify-between items-center -mx-6 mb-6">
        <div>
          <nav className="flex items-center gap-1 text-xs text-[#707974] mb-1">
            <span>Admin</span><span>›</span><span>Jasa</span><span>›</span>
            <span className="font-bold text-[#003527]">Tambah Baru</span>
          </nav>
          <h2 className="text-xl font-bold text-[#003527]">Tambah Jasa Baru</h2>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => router.push("/dashboard-admin/admin/services")}
            className="rounded-lg border border-[#bfc9c3] px-5 py-2.5 text-sm font-semibold text-[#191c1d] hover:bg-[#edeeef] transition-colors">
            Batal
          </button>
          <button type="submit" disabled={isPending}
            className="rounded-lg bg-[#064e3b] px-5 py-2.5 text-sm font-semibold text-white shadow-sm flex items-center gap-2 hover:bg-[#043b2d] transition-all disabled:opacity-60">
            <span className="material-symbols-outlined text-base">publish</span>
            {isPending ? "Menyimpan..." : "Publish Jasa"}
          </button>
        </div>
      </header>

      <div className="max-w-[1000px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── Left 2/3 ── */}
          <div className="md:col-span-2 space-y-6">

            {/* Service Info */}
            <section className="bg-white rounded-xl border border-[#e1e3e4] p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#707974] mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#003527]">info</span>
                Informasi Jasa
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#707974]">
                    Nama Jasa <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input type="text" className={inputCls} placeholder="Contoh: Konsultasi Desain Interior"
                    value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#707974]">Slug URL</label>
                    <input type="text" className={inputCls + " text-[#707974]"} value={toSlug(name)} readOnly />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#707974]">Satuan</label>
                    <select className={inputCls} value={unit} onChange={(e) => setUnit(e.target.value)}>
                      <option value="project">Project</option>
                      <option value="jam">Per Jam</option>
                      <option value="hari">Per Hari</option>
                      <option value="m2">Per m²</option>
                      <option value="unit">Per Unit</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#707974]">Deskripsi Singkat</label>
                  <textarea className={inputCls + " resize-none"} rows={3}
                    placeholder="Intro singkat yang menarik untuk listing jasa..."
                    value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>
            </section>

            {/* Methodology */}
            <section className="bg-white rounded-xl border border-[#e1e3e4] p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#707974] mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#003527]">subject</span>
                Metodologi & Proses
              </h3>
              <textarea className={inputCls + " resize-none"} rows={8}
                placeholder="Jelaskan proses kreatif, langkah kerja, dan apa yang bisa diharapkan klien..."
                value={methodology} onChange={(e) => setMethodology(e.target.value)} />
              <p className="mt-1.5 text-[11px] text-[#707974]">{methodology.length} karakter</p>
            </section>

            {/* Package Tiers */}
            <section className="bg-white rounded-xl border border-[#e1e3e4] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#707974] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#003527]">payments</span>
                  Paket Layanan
                </h3>
                <button type="button" onClick={addTier}
                  className="text-xs font-semibold text-[#003527] flex items-center gap-1 hover:underline">
                  <span className="material-symbols-outlined text-base">add_circle</span>
                  Tambah Paket
                </button>
              </div>

              <div className="space-y-4">
                {tiers.map((tier, i) => (
                  <div key={i} className="border border-[#e1e3e4] rounded-lg p-4 relative">
                    <button type="button" onClick={() => removeTier(i)}
                      className="absolute top-3 right-3 text-[#bfc9c3] hover:text-[#ba1a1a] transition-colors">
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <label className="text-xs text-[#707974] font-semibold">Nama Paket</label>
                        <input type="text" placeholder="Contoh: Basic" className={inputCls}
                          value={tier.name} onChange={(e) => updateTier(i, "name", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-[#707974] font-semibold">Harga (Rp, opsional)</label>
                        <input type="text" placeholder="5.000.000" className={inputCls}
                          value={tier.price} onChange={(e) => updateTier(i, "price", e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-1 mb-3">
                      <label className="text-xs text-[#707974] font-semibold">Fitur / Inclusions (satu per baris)</label>
                      <textarea className={inputCls + " resize-none"} rows={3}
                        placeholder={"Konsultasi awal\n3 revisi\nFile resolusi tinggi"}
                        value={tier.features} onChange={(e) => updateTier(i, "features", e.target.value)} />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={tier.recommended}
                        onChange={(e) => updateTier(i, "recommended", e.target.checked)}
                        className="accent-[#064e3b]" />
                      <span className="text-xs font-semibold text-[#707974]">Tandai sebagai Recommended</span>
                    </label>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Right 1/3 ── */}
          <div className="space-y-6">

            {/* Harga & Status */}
            <section className="bg-white rounded-xl border border-[#e1e3e4] p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#707974] mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#003527]">payments</span>
                Harga & Status
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#707974]">
                    Harga Mulai (Rp) <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#707974]">Rp</span>
                    <input type="number" min="0" className={inputCls + " pl-9"} placeholder="0"
                      value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-semibold text-[#191c1d]">Aktif di Storefront</span>
                  <button type="button" onClick={() => setIsActive((v) => !v)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${isActive ? "bg-[#064e3b]" : "bg-[#bfc9c3]"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isActive ? "right-0.5" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
            </section>

            {/* Portfolio Gallery */}
            <section className="bg-white rounded-xl border border-[#e1e3e4] p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#707974] mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#003527]">photo_library</span>
                Portfolio Gallery
              </h3>
              {/* URL input */}
              <div className="flex gap-2 mb-3">
                <input type="url" className={inputCls + " flex-1 text-xs"} placeholder="Paste URL gambar..."
                  value={imageInput} onChange={(e) => setImageInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageByUrl(); } }} />
                <button type="button" onClick={addImageByUrl}
                  className="rounded-lg bg-[#064e3b] px-3 py-2 text-xs font-bold text-white hover:bg-[#043b2d] transition-colors">
                  + URL
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
              {/* Preview */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {imageUrls.map((url, i) => (
                    <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-[#e1e3e4] bg-[#edeeef]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`preview-${i}`} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button type="button" onClick={() => removeImage(url)}
                          className="text-white">
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 rounded bg-[#064e3b] px-1.5 py-0.5 text-[9px] font-bold text-white">Utama</span>
                      )}
                    </div>
                  ))}
                  {/* Add slot */}
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border border-dashed border-[#bfc9c3] flex items-center justify-center hover:border-[#003527] transition-colors">
                    <span className="material-symbols-outlined text-[#bfc9c3] text-xl">add</span>
                  </button>
                </div>
              )}
            </section>

            {/* Visibility & Tags */}
            <section className="bg-white rounded-xl border border-[#e1e3e4] p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#707974] mb-5">
                Visibilitas & Tags
              </h3>
              <div className="space-y-4">
                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <span key={t} className="flex items-center gap-1 px-2 py-1 bg-[#d9dff5] text-[#575e70] text-[11px] font-bold rounded">
                        {t}
                        <button type="button" onClick={() => removeTag(t)} className="hover:text-[#ba1a1a]">
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input type="text" className={inputCls + " flex-1 text-xs"} placeholder="Tambah tag (Enter)..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} />
                  <button type="button" onClick={addTag}
                    className="rounded-lg bg-[#064e3b] px-3 py-2 text-xs font-bold text-white hover:bg-[#043b2d] transition-colors">
                    +
                  </button>
                </div>
              </div>
            </section>

            {/* Help card */}
            <div className="p-4 border border-[#bfc9c3] rounded-xl flex items-start gap-3">
              <span className="material-symbols-outlined text-[#003527]">help</span>
              <div>
                <p className="text-sm font-bold text-[#191c1d]">Tips listing efektif</p>
                <p className="text-xs text-[#707974] mt-1">Jasa dengan foto portofolio dan deskripsi lengkap mendapat lebih banyak permintaan. Tambahkan minimal 3 foto.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom */}
      <div className="mt-6 flex gap-3 border-t border-[#e1e3e4] pt-5 md:hidden">
        <button type="button" onClick={() => router.push("/dashboard-admin/admin/services")}
          className="flex-1 rounded-lg border border-[#bfc9c3] py-3 text-sm font-semibold text-[#191c1d]">
          Batal
        </button>
        <button type="submit" disabled={isPending}
          className="flex-1 rounded-lg bg-[#064e3b] py-3 text-sm font-semibold text-white disabled:opacity-60">
          {isPending ? "Menyimpan..." : "Publish"}
        </button>
      </div>
    </form>
  );
}
