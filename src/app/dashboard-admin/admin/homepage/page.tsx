"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchHomepageSections, type HomepageSections } from "@/lib/homepage-settings";
import { adminApi } from "@/lib/admin-api";

interface SectionConfig {
 key: keyof HomepageSections;
 label: string;
 description: string;
 icon: string;
}

const SECTIONS: SectionConfig[] = [
 {
  key: "showHero",
  label: "Hero Banner",
  description: "Bento grid banner utama di bagian paling atas halaman home",
  icon: "image",
 },
 {
  key: "showPromo",
  label: "Promo Spesial",
  description: "Section kartu promo horizontal di bawah hero",
  icon: "local_offer",
 },
 {
  key: "showProduct",
  label: "Produk Populer",
  description: "Grid produk unggulan yang tampil di halaman home",
  icon: "inventory_2",
 },
 {
  key: "showJasa",
  label: "Jasa Profesional",
  description: "Grid layanan jasa yang ditawarkan oleh mitra",
  icon: "design_services",
 },
 {
  key: "showSewa",
  label: "Sewa Peralatan",
  description: "Grid item yang tersedia untuk disewa",
  icon: "handshake",
 },
];

export default function HomepageSettingsPage() {
 const router = useRouter();
 const [sections, setSections] = useState<HomepageSections>({
  showHero: true,
  showPromo: true,
  showProduct: true,
  showJasa: true,
  showSewa: true,
 });
 const [loading, setLoading] = useState(true);
 // savingKey = key yang sedang disimpan, null = idle
 const [savingKey, setSavingKey] = useState<keyof HomepageSections | null>(null);
 // savedKey = key yang baru saja berhasil disimpan (untuk animasi centang)
 const [savedKey, setSavedKey] = useState<keyof HomepageSections | null>(null);
 const [error, setError] = useState<string | null>(null);

 // Load data saat mount
 useEffect(() => {
  fetchHomepageSections()
   .then((data) => {
    setSections(data);
    setLoading(false);
   })
   .catch(() => {
    setError("Gagal memuat pengaturan. Pastikan backend berjalan.");
    setLoading(false);
   });
 }, []);

 // Auto-save ke API setiap kali sections berubah (kecuali saat initial load)
 const autoSave = useCallback(
  async (key: keyof HomepageSections, newSections: HomepageSections) => {
   setSavingKey(key);
   setError(null);
   try {
    await adminApi("settings/homepage_sections", {
     method: "PUT",
     body: JSON.stringify(newSections),
    });
    setSavedKey(key);
    // Hilangkan centang setelah 2 detik
    setTimeout(() => setSavedKey(null), 2000);
   } catch (e: unknown) {
    setError(e instanceof Error ? e.message : "Gagal menyimpan pengaturan");
    // Rollback toggle jika gagal
    setSections((prev) => ({ ...prev, [key]: !newSections[key] }));
   } finally {
    setSavingKey(null);
   }
  },
  [router]
 );

 async function handleToggle(key: keyof HomepageSections) {
  if (savingKey !== null) return; // cegah toggle bersamaan
  const newSections = { ...sections, [key]: !sections[key] };
  setSections(newSections);
  setError(null);
  await autoSave(key, newSections);
 }

 const activeCount = Object.values(sections).filter(Boolean).length;

 return (
  <div className="min-h-screen bg-[#f8f9fa]">
   <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
    .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin 0.8s linear infinite; display: inline-block; }
   `}</style>


   <div className="lg:ml-64 min-h-screen flex flex-col pb-24 lg:pb-0">

    <main className="p-6 w-full">

     {/* Error */}
     {error && (
      <div className="mb-5 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/20 px-4 py-3 flex items-center gap-2 text-sm font-semibold text-[#93000a]">
       <span className="material-symbols-outlined text-base">error</span>
       {error}
       <button
        onClick={() => setError(null)}
        className="ml-auto text-xs underline"
       >
        Tutup
       </button>
      </div>
     )}

     {/* Info card */}
     <section className="bg-white rounded-xl border border-[#e1e3e4] p-5 shadow-sm mb-6">
      <div className="flex items-start gap-3">
       <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#b0f0d6]">
        <span className="material-symbols-outlined text-[#003527] text-lg">bolt</span>
       </div>
       <div>
        <p className="text-sm font-semibold text-[#191c1d]">Perubahan Realtime</p>
        <p className="mt-1 text-xs text-[#707974]">
         Toggle langsung tersimpan otomatis — tidak perlu klik tombol Simpan.
         Saat ini <span className="font-bold text-[#003527]">{activeCount} dari {SECTIONS.length}</span> section aktif di homepage.
        </p>
       </div>
      </div>
     </section>

     {/* Toggle list */}
     <section className="bg-white rounded-xl border border-[#e1e3e4] shadow-sm overflow-hidden mb-6">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-[#e1e3e4]">
       <span className="material-symbols-outlined text-[#003527]">view_agenda</span>
       <h2 className="text-xs font-bold uppercase tracking-widest text-[#707974]">Section Home</h2>
      </div>

      {loading ? (
       <div className="flex items-center justify-center py-16 gap-3 text-[#707974]">
        <span className="material-symbols-outlined spin text-2xl">progress_activity</span>
        <span className="text-sm font-medium">Memuat pengaturan...</span>
       </div>
      ) : (
       <div className="divide-y divide-[#e1e3e4]">
        {SECTIONS.map((sec, idx) => {
         const isActive = sections[sec.key];
         const isSaving = savingKey === sec.key;
         const isSaved = savedKey === sec.key;

         return (
          <div
           key={sec.key}
           className={`flex items-center gap-4 px-6 py-5 transition-colors ${
            isActive ? "bg-white" : "bg-[#f8f9fa]"
           }`}
          >
           {/* Nomor urut */}
           <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
             isActive
              ? "bg-[#b0f0d6] text-[#003527]"
              : "bg-[#e1e3e4] text-[#707974]"
            }`}
           >
            {idx + 1}
           </div>

           {/* Icon */}
           <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
             isActive ? "bg-[#064e3b]" : "bg-[#e1e3e4]"
            }`}
           >
            <span
             className={`material-symbols-outlined text-xl transition-colors ${
              isActive ? "text-white" : "text-[#707974]"
             }`}
            >
             {sec.icon}
            </span>
           </div>

           {/* Label & desc */}
           <div className="flex-1 min-w-0">
            <p
             className={`text-sm font-semibold transition-colors ${
              isActive ? "text-[#191c1d]" : "text-[#707974]"
             }`}
            >
             {sec.label}
            </p>
            <p className="mt-0.5 text-xs text-[#707974] leading-snug">
             {sec.description}
            </p>
           </div>

           {/* Status: loading / saved / badge */}
           <div className="shrink-0 hidden sm:flex items-center gap-2">
            {isSaving ? (
             <span className="material-symbols-outlined text-base spin text-[#064e3b]">autorenew</span>
            ) : isSaved ? (
             <span className="material-symbols-outlined text-base text-[#064e3b]">check_circle</span>
            ) : (
             <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
               isActive
                ? "bg-[#b0f0d6] text-[#003527]"
                : "bg-[#e1e3e4] text-[#707974]"
              }`}
             >
              <span
               className={`h-1.5 w-1.5 rounded-full ${
                isActive ? "bg-[#064e3b]" : "bg-[#bfc9c3]"
               }`}
              />
              {isActive ? "Aktif" : "Nonaktif"}
             </span>
            )}
           </div>

           {/* Toggle switch */}
           <button
            onClick={() => handleToggle(sec.key)}
            disabled={savingKey !== null}
            role="switch"
            aria-checked={isActive}
            aria-label={`Toggle ${sec.label}`}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#064e3b] focus-visible:ring-offset-2 disabled:cursor-wait ${
             isActive ? "bg-[#064e3b]" : "bg-[#bfc9c3]"
            }`}
           >
            <span
             className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ${
              isActive ? "translate-x-5" : "translate-x-0.5"
             }`}
            />
           </button>
          </div>
         );
        })}
       </div>
      )}
     </section>

     {/* Preview urutan */}
     <section className="bg-white rounded-xl border border-[#e1e3e4] p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
       <span className="material-symbols-outlined text-[#003527]">preview</span>
       <h2 className="text-xs font-bold uppercase tracking-widest text-[#707974]">Preview Urutan Section</h2>
      </div>
      <div className="space-y-2">
       {SECTIONS.map((sec, idx) => {
        const isActive = sections[sec.key];
        return (
         <div
          key={sec.key}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-all duration-300 ${
           isActive
            ? "bg-[#f0fdf7] border border-[#064e3b]/20"
            : "bg-[#f3f4f5] border border-transparent opacity-40"
          }`}
         >
          <span className={`material-symbols-outlined text-base ${isActive ? "text-[#064e3b]" : "text-[#bfc9c3]"}`}>
           {sec.icon}
          </span>
          <span className={`font-semibold ${isActive ? "text-[#003527]" : "text-[#707974] line-through"}`}>
           {idx + 1}. {sec.label}
          </span>
          {!isActive && (
           <span className="ml-auto text-[10px] font-medium text-[#707974]">Disembunyikan</span>
          )}
         </div>
        );
       })}
      </div>
      <p className="mt-4 text-[11px] text-[#707974]">
       * Perubahan toggle langsung diterapkan ke halaman home secara realtime.
      </p>
     </section>
    </main>
   </div>
  </div>
 );
}
