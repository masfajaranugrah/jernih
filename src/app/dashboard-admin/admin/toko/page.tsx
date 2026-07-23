"use client";

import { useState } from "react";

const inputCls = "w-full rounded-lg border border-[#bfc9c3] bg-[#f8f9fa] px-4 py-2.5 text-sm text-[#191c1d] outline-none transition-all focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/20";

export default function TokoPage() {
 const [saved, setSaved] = useState(false);
 const [saving, setSaving] = useState(false);

 const [form, setForm] = useState({
  storeName: "Jernih Creative Official",
  storeTagline: "Platform belanja terpercaya dengan produk berkualitas pilihan.",
  whatsapp: "6281318638100",
  email: "hello@jernihcreative.id",
  address: "Indonesia",
  instagram: "@jernihcreative",
  footerDesc: "Platform belanja terpercaya dengan produk berkualitas pilihan.",
 });

 function handleChange(key: keyof typeof form, value: string) {
  setForm((p) => ({ ...p, [key]: value }));
  setSaved(false);
 }

 async function handleSave() {
  setSaving(true);
  // Simulasi save — nanti connect ke API
  await new Promise((r) => setTimeout(r, 800));
  setSaving(false);
  setSaved(true);
  setTimeout(() => setSaved(false), 3000);
 }

 return (
  <div className="min-h-screen bg-[#f8f9fa]">
   <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
    .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
   `}</style>


   <div className="lg:ml-64 min-h-screen flex flex-col pb-24 lg:pb-0">
    {/* Top bar */}
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#e1e3e4] bg-white/90 px-6 shadow-sm backdrop-blur">
     <div className="flex items-center gap-3">
      <span className="material-symbols-outlined text-[#003527]">storefront</span>
      <h1 className="text-[#003527] font-bold text-lg">Info Toko</h1>
     </div>
     <button
      onClick={handleSave}
      disabled={saving}
      className="flex items-center gap-2 rounded-lg bg-[#064e3b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#043b2d] disabled:opacity-60 disabled:translate-y-0"
     >
      <span className="material-symbols-outlined text-base">
       {saving ? "hourglass_top" : saved ? "check_circle" : "save"}
      </span>
      {saving ? "Menyimpan..." : saved ? "Tersimpan!" : "Simpan"}
     </button>
    </header>

    <main className="p-6 max-w-3xl w-full">

     {saved && (
      <div className="mb-5 rounded-xl bg-[#b0f0d6] border border-[#064e3b]/20 px-4 py-3 flex items-center gap-2 text-sm font-semibold text-[#003527]">
       <span className="material-symbols-outlined text-base">check_circle</span>
       Informasi toko berhasil disimpan!
      </div>
     )}

     {/* Identitas Toko */}
     <section className="bg-white rounded-xl border border-[#e1e3e4] p-6 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-5">
       <span className="material-symbols-outlined text-[#003527]">badge</span>
       <h2 className="text-xs font-bold uppercase tracking-widest text-[#707974]">Identitas Toko</h2>
      </div>
      <div className="space-y-4">
       <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#707974] mb-1.5">
         Nama Toko <span className="text-[#ba1a1a]">*</span>
        </label>
        <input
         type="text"
         className={inputCls}
         value={form.storeName}
         onChange={(e) => handleChange("storeName", e.target.value)}
         placeholder="Nama toko kamu"
        />
        <p className="mt-1 text-[11px] text-[#707974]">Tampil di halaman produk sebagai nama penjual</p>
       </div>
       <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#707974] mb-1.5">
         Tagline / Slogan
        </label>
        <input
         type="text"
         className={inputCls}
         value={form.storeTagline}
         onChange={(e) => handleChange("storeTagline", e.target.value)}
         placeholder="Tagline singkat toko kamu"
        />
       </div>
       <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#707974] mb-1.5">
         Deskripsi Footer
        </label>
        <textarea
         className={inputCls + " resize-none"}
         rows={3}
         value={form.footerDesc}
         onChange={(e) => handleChange("footerDesc", e.target.value)}
         placeholder="Deskripsi singkat yang tampil di footer website"
        />
       </div>
      </div>
     </section>

     {/* Kontak */}
     <section className="bg-white rounded-xl border border-[#e1e3e4] p-6 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-5">
       <span className="material-symbols-outlined text-[#003527]">contact_phone</span>
       <h2 className="text-xs font-bold uppercase tracking-widest text-[#707974]">Kontak & Lokasi</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
       <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#707974] mb-1.5">
         Nomor WhatsApp
        </label>
        <div className="relative">
         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#707974]">+</span>
         <input
          type="text"
          className={inputCls + " pl-6"}
          value={form.whatsapp}
          onChange={(e) => handleChange("whatsapp", e.target.value)}
          placeholder="628123456789"
         />
        </div>
        <p className="mt-1 text-[11px] text-[#707974]">Format internasional tanpa + (contoh: 628123...)</p>
       </div>
       <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#707974] mb-1.5">
         Email
        </label>
        <input
         type="email"
         className={inputCls}
         value={form.email}
         onChange={(e) => handleChange("email", e.target.value)}
         placeholder="email@tokokamu.com"
        />
       </div>
       <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#707974] mb-1.5">
         Lokasi / Kota
        </label>
        <input
         type="text"
         className={inputCls}
         value={form.address}
         onChange={(e) => handleChange("address", e.target.value)}
         placeholder="Contoh: Jakarta, Indonesia"
        />
       </div>
       <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#707974] mb-1.5">
         Instagram
        </label>
        <div className="relative">
         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#707974]">@</span>
         <input
          type="text"
          className={inputCls + " pl-7"}
          value={form.instagram.replace("@", "")}
          onChange={(e) => handleChange("instagram", "@" + e.target.value.replace("@", ""))}
          placeholder="usernamekamu"
         />
        </div>
       </div>
      </div>
     </section>

     {/* Preview */}
     <section className="bg-white rounded-xl border border-[#e1e3e4] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
       <span className="material-symbols-outlined text-[#003527]">preview</span>
       <h2 className="text-xs font-bold uppercase tracking-widest text-[#707974]">Preview Tampilan</h2>
      </div>
      <div className="rounded-xl bg-[#f8f9fa] border border-[#e1e3e4] p-4 space-y-2">
       <p className="text-[10px] text-[#707974] uppercase tracking-widest">Tampil di halaman produk:</p>
       <p className="text-xs text-[#707974]">oleh <span className="font-semibold text-[#003527]">{form.storeName || "—"}</span></p>
       <div className="border-t border-[#e1e3e4] pt-3 mt-3">
        <p className="text-[10px] text-[#707974] uppercase tracking-widest mb-1">Tampil di halaman detail produk:</p>
        <p className="text-xs text-[#707974]">Dijual oleh: <span className="font-semibold text-[#003527]">{form.storeName || "—"}</span></p>
        <p className="text-xs text-[#707974]">Lokasi: {form.address || "—"}</p>
       </div>
      </div>
     </section>
    </main>
   </div>
  </div>
 );
}
